"""
ComfyUI API wrapper for Z-Image Turbo FP8 workflow.
Make sure ComfyUI is running with: python main.py --listen 0.0.0.0 --port 8188
"""

import json
import uuid
import time
import random
import urllib.request
import urllib.error
from pathlib import Path
from PIL import Image
import io
import copy

COMFY_URL = "http://127.0.0.1:8188"

# Your workflow — node IDs locked to your export
BASE_WORKFLOW = {
    "194": {
        "inputs": {
            "unet_name": "z-image\\z-image-turbo_fp8_scaled_e5m2_KJ.safetensors",
            "weight_dtype": "default"
        },
        "class_type": "UNETLoader"
    },
    "195": {
        "inputs": {
            "clip_name": "Huihui-Qwen3-4B-abliterated-v2_fp8mixed.safetensors",
            "type": "stable_diffusion",
            "device": "default"
        },
        "class_type": "CLIPLoader"
    },
    "196": {
        "inputs": {
            "vae_name": "ae.safetensors"
        },
        "class_type": "VAELoader"
    },
    "277": {
        "inputs": {
            "shift": 3,
            "model": ["194", 0]
        },
        "class_type": "ModelSamplingAuraFlow"
    },
    "278": {
        "inputs": {
            "conditioning": ["281", 0]
        },
        "class_type": "ConditioningZeroOut"
    },
    "279": {
        "inputs": {
            "width": 1280,
            "height": 768,
            "batch_size": 1
        },
        "class_type": "EmptySD3LatentImage"
    },
    "280": {
        "inputs": {
            "samples": ["283", 0],
            "vae": ["196", 0]
        },
        "class_type": "VAEDecode"
    },
    "281": {
        "inputs": {
            "text": "",   # <-- injected at runtime
            "clip": ["195", 0]
        },
        "class_type": "CLIPTextEncode"
    },
    "283": {
        "inputs": {
            "seed": 0,    # <-- injected at runtime
            "steps": 5,
            "cfg": 1,
            "sampler_name": "dpmpp_3m_sde",
            "scheduler": "beta",
            "denoise": 1,
            "model": ["277", 0],
            "positive": ["281", 0],
            "negative": ["278", 0],
            "latent_image": ["279", 0]
        },
        "class_type": "KSampler"
    },
    "284": {
        "inputs": {
            "filename_prefix": "ComfyUI",
            "images": ["280", 0]
        },
        "class_type": "SaveImage"
    }
}


def _queue_prompt(workflow: dict, client_id: str) -> str:
    payload = json.dumps({"prompt": workflow, "client_id": client_id}).encode()
    req = urllib.request.Request(
        f"{COMFY_URL}/prompt",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())["prompt_id"]


def _wait_for_image(prompt_id: str, timeout: int = 300) -> bytes:
    """Poll /history until the job is done, return raw image bytes."""
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(f"{COMFY_URL}/history/{prompt_id}") as r:
                history = json.loads(r.read())
            if prompt_id in history:
                outputs = history[prompt_id]["outputs"]
                for node_output in outputs.values():
                    if "images" in node_output:
                        img_info = node_output["images"][0]
                        url = (
                            f"{COMFY_URL}/view"
                            f"?filename={img_info['filename']}"
                            f"&subfolder={img_info['subfolder']}"
                            f"&type={img_info['type']}"
                        )
                        with urllib.request.urlopen(url) as r:
                            return r.read()
        except urllib.error.URLError:
            pass
        time.sleep(0.5)
    raise TimeoutError(f"No image after {timeout}s — is ComfyUI running?")


def generate_image(
    prompt: str,
    output_path: str = "output.png",
    width: int = 1280,
    height: int = 768,
    steps: int = 5,
    cfg: float = 1.0,
    seed: int = -1,        # -1 = random
    shift: float = 3.0,
) -> Image.Image:
    """
    Generate an image via your ComfyUI workflow.

    Args:
        prompt:      Text prompt
        output_path: Where to save the PNG
        width:       Image width  (default 1280)
        height:      Image height (default 768)
        steps:       KSampler steps (default 5)
        cfg:         CFG scale (default 1.0)
        seed:        Seed, -1 for random
        shift:       ModelSamplingAuraFlow shift (default 3.0)

    Returns:
        PIL.Image
    """
    if seed == -1:
        seed = random.randint(0, 2**32 - 1)

    # Deep copy so we never mutate the base workflow
    wf = copy.deepcopy(BASE_WORKFLOW)

    # Inject runtime values
    wf["281"]["inputs"]["text"]        = prompt
    wf["283"]["inputs"]["seed"]        = seed
    wf["283"]["inputs"]["steps"]       = steps
    wf["283"]["inputs"]["cfg"]         = cfg
    wf["279"]["inputs"]["width"]       = width
    wf["279"]["inputs"]["height"]      = height
    wf["277"]["inputs"]["shift"]       = shift

    client_id = str(uuid.uuid4())

    print(f"Queuing prompt...")
    print(f"  Prompt : {prompt[:80]}{'...' if len(prompt) > 80 else ''}")
    print(f"  Size   : {width}×{height}  |  Steps: {steps}  |  CFG: {cfg}  |  Seed: {seed}")

    t0 = time.time()
    prompt_id = _queue_prompt(wf, client_id)
    print(f"  Job ID : {prompt_id}")
    print("  Waiting for ComfyUI...")

    image_bytes = _wait_for_image(prompt_id)
    elapsed = time.time() - t0

    image = Image.open(io.BytesIO(image_bytes))
    image.save(output_path)
    print(f"  Done in {elapsed:.1f}s  →  {output_path}")
    return image


# ── CLI usage ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Z-Image ComfyUI generator")
    parser.add_argument("--prompt",  type=str,   required=True)
    parser.add_argument("--output",  type=str,   default="output.png")
    parser.add_argument("--width",   type=int,   default=1280)
    parser.add_argument("--height",  type=int,   default=768)
    parser.add_argument("--steps",   type=int,   default=5)
    parser.add_argument("--cfg",     type=float, default=1.0)
    parser.add_argument("--seed",    type=int,   default=-1)
    parser.add_argument("--shift",   type=float, default=3.0)
    args = parser.parse_args()

    generate_image(
        prompt=args.prompt,
        output_path=args.output,
        width=args.width,
        height=args.height,
        steps=args.steps,
        cfg=args.cfg,
        seed=args.seed,
        shift=args.shift,
    )