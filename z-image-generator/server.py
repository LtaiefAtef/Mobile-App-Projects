"""
Flask server for Z-Image ComfyUI workflow.
"""
import uuid
import threading
from pathlib import Path
from flask import Flask, request, jsonify, send_file, Response
from ComfyUI import generate_image

app = Flask(__name__)

OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

WIDTH  = 1280
HEIGHT = 768
STEPS  = 5
CFG    = 1.0
SEED   = -1
SHIFT  = 3.0

jobs: dict[str, dict] = {}
jobs_lock = threading.Lock()


def _run_job(job_id: str, prompt: str):
    output_path = str(OUTPUT_DIR / f"{job_id}.png")
    try:
        generate_image(
            prompt=prompt,
            output_path=output_path,
            width=WIDTH,
            height=HEIGHT,
            steps=STEPS,
            cfg=CFG,
            seed=SEED,
            shift=SHIFT,
        )
        png_files = list(OUTPUT_DIR.glob("*.png"))
        if not png_files:
            raise FileNotFoundError("No output image found")
        actual_file = max(png_files, key=lambda f: f.stat().st_mtime)

        with jobs_lock:
            jobs[job_id] = {"status": "done", "file": str(actual_file)}

        print(f"[JOB DONE] {job_id} → {actual_file}")

    except Exception as e:
        with jobs_lock:
            jobs[job_id] = {"status": "error", "error": str(e)}
        print(f"[JOB ERROR] {job_id} → {e}")


@app.route("/generate", methods=["POST"])
def generate():
    body = request.get_json(force=True, silent=True) or {}
    prompt = body.get("prompt", "").strip()
    if not prompt:
        return jsonify({"error": "prompt is required"}), 400

    job_id = str(uuid.uuid4())
    with jobs_lock:
        jobs[job_id] = {"status": "pending"}

    print(f"[JOB START] {job_id}")
    threading.Thread(target=_run_job, args=(job_id, prompt), daemon=True).start()

    return jsonify({"job_id": job_id, "status": "pending"}), 202


@app.route("/status/<job_id>", methods=["GET"])
def job_status(job_id: str):
    with jobs_lock:
        job = jobs.get(job_id)

    print(f"[STATUS] {job_id} → {job}")

    if job is None:
        return jsonify({"error": "job not found"}), 404
    if job["status"] == "pending":
        return jsonify({"status": "pending"}), 202
    if job["status"] == "error":
        return jsonify({"status": "error", "error": job["error"]}), 500

    return jsonify({"status": "done", "image_url": f"http://192.168.1.15:5000/image/{job_id}"}), 200


@app.route("/image/<job_id>", methods=["GET"])
def get_image(job_id: str):
    with jobs_lock:
        job = jobs.get(job_id)

    print(f"[IMAGE] {job_id} → {job}")

    if job is None or job["status"] != "done":
        return jsonify({"error": "image not ready"}), 404

    file_path = Path(job["file"])
    if not file_path.exists():
        return jsonify({"error": "file missing on disk"}), 404

    return send_file(str(file_path), mimetype="image/png")


@app.route("/view/<job_id>", methods=["GET"])
def view_image(job_id: str):
    with jobs_lock:
        job = jobs.get(job_id)

    if job is None or job["status"] != "done":
        return "<h2>Image not ready</h2>", 404

    import base64
    file_path = Path(job["file"])
    if not file_path.exists():
        return "<h2>File missing</h2>", 404

    with open(file_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")

    html = f'''<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* {{ margin: 0; padding: 0; }}
body {{ background: #ffffff; }}
img {{ width: 100%; height: auto; display: block; }}
</style>
</head>
<body>
<img src="data:image/png;base64,{b64}" />
</body>
</html>'''

    def generate():
        yield html

    return Response(generate(), mimetype='text/html', headers={
        'Transfer-Encoding': 'chunked',
        'Content-Length': '',
    })

@app.route("/images", methods=["GET"])
def list_images():
    png_files = sorted(OUTPUT_DIR.glob("*.png"), key=lambda f: f.stat().st_mtime, reverse=True)
    files = [{"filename": f.name, "url": f"http://192.168.1.15:5000/file/{f.name}"} for f in png_files]
    return jsonify(files)


@app.route("/file/<filename>", methods=["GET"])
def get_file(filename: str):
    file_path = OUTPUT_DIR / filename
    if not file_path.exists():
        return jsonify({"error": "file not found"}), 404
    return send_file(str(file_path), mimetype="image/png")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)