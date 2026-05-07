from waitress import serve
import uuid
import threading
import time
from pathlib import Path
from flask import Flask, request, jsonify, Response
from ComfyUI import generate_image
from flask_cors import CORS

app = Flask(__name__, static_url_path="/files", static_folder="outputs")
CORS(app)

OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

WIDTH = 1280
HEIGHT = 768
STEPS = 5
CFG = 1.0
SEED = -1
SHIFT = 3.0

jobs = {}
lock = threading.Lock()


# -------------------------
# WAIT UNTIL FILE IS FULLY WRITTEN
# -------------------------
def wait_until_complete(path: Path):
    last_size = -1
    stable_count = 0

    while True:
        size = path.stat().st_size if path.exists() else 0

        if size == last_size and size > 0:
            stable_count += 1
        else:
            stable_count = 0

        if stable_count >= 3:
            break

        last_size = size
        time.sleep(0.2)


# -------------------------
# IMAGE GENERATION
# -------------------------
def _run_job(job_id: str, prompt: str):
    output_path = OUTPUT_DIR / f"{job_id}.png"

    try:
        generate_image(
            prompt=prompt,
            output_path=str(output_path),
            width=WIDTH,
            height=HEIGHT,
            steps=STEPS,
            cfg=CFG,
            seed=SEED,
            shift=SHIFT,
        )

        wait_until_complete(output_path)

        with lock:
            jobs[job_id] = {"status": "done", "file": str(output_path)}

    except Exception as e:
        with lock:
            jobs[job_id] = {"status": "error", "error": str(e)}


# -------------------------
# GENERATE
# -------------------------
@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json(force=True) or {}
    prompt = data.get("prompt", "").strip()

    if not prompt:
        return jsonify({"error": "prompt required"}), 400

    job_ids = []

    for _ in range(3):
        job_id = str(uuid.uuid4())

        with lock:
            jobs[job_id] = {"status": "pending"}

        threading.Thread(
            target=_run_job,
            args=(job_id, prompt),
            daemon=True
        ).start()

        job_ids.append(job_id)

    return jsonify({"job_ids": job_ids}), 202


# -------------------------
# STATUS
# -------------------------
@app.route("/status/<job_id>")
def status(job_id):
    with lock:
        job = jobs.get(job_id)

    if not job:
        return jsonify({"error": "not found"}), 404

    if job["status"] == "pending":
        return jsonify({"status": "pending"}), 202

    if job["status"] == "error":
        return jsonify({"status": "error", "error": job["error"]}), 500

    base_url = request.host_url.rstrip("/")

    return jsonify({
        "status": "done",
        "image_url": f"{base_url}/file/{job_id}.png"
    })


# -------------------------
# IMAGE SERVE (FULL BUFFER FIX)
# -------------------------
from flask import send_file

from flask import send_from_directory

@app.route('/file/<filename>')
def file(filename):
    print("Serving file:", filename);
    return send_from_directory(
        directory="outputs",
        path=filename,
        mimetype="image/png",
        conditional=False
    )
# -------------------------
# LIST IMAGES
# -------------------------
@app.route("/images")
def images():
    files = sorted(OUTPUT_DIR.glob("*.png"), reverse=True)
    base_url = request.host_url.rstrip("/")

    return jsonify([
        {
            "filename": f.name,
            "url": f"{base_url}/file/{f.name}"
        }
        for f in files
    ])


# -------------------------
# HEALTH
# -------------------------
@app.route("/health")
def health():
    return jsonify({"status": "ok"})


import socket

if __name__ == "__main__":
    print("Starting server with Waitress...")

    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)

    print(f"Server running on: http://{local_ip}:5000")

    serve(app, host="0.0.0.0", port=5000)