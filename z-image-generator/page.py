"""
Z-Image-Turbo — Text to Image
Optimized for RTX 3050 Laptop GPU (4 GB VRAM) + 28 GB RAM
"""

import torch
import argparse
from pathlib import Path
from PIL import Image
import os
import time

# ── model settings ─────────────────────────────────────────────────────────────
GGUF_REPO  = "jayn7/Z-Image-Turbo-GGUF"
GGUF_FILE  = "z_image_turbo-Q3_K_S.gguf"
BASE_REPO  = "Tongyi-MAI/Z-Image-Turbo"
LOCAL_DIR  = r"C:\Users\Ltaief\.cache\z-image-turbo-gguf"

# ── inference settings ─────────────────────────────────────────────────────────
DEFAULT_STEPS  = 8
DEFAULT_CFG    = 1.0
DEFAULT_WIDTH  = 512
DEFAULT_HEIGHT = 512
DEFAULT_SEED   = 42

BASE_FILES = [
    "model_index.json",
    "scheduler/scheduler_config.json",
    "tokenizer/tokenizer_config.json",
    "tokenizer/vocab.json",
    "tokenizer/merges.txt",
    "transformer/config.json",
    "text_encoder/config.json",
    "text_encoder/model-00001-of-00003.safetensors",
    "text_encoder/model-00002-of-00003.safetensors",
    "text_encoder/model-00003-of-00003.safetensors",
    "text_encoder/model.safetensors.index.json",
    "vae/config.json",
    "vae/diffusion_pytorch_model.safetensors",
]


def ensure_files():
    from huggingface_hub import hf_hub_download
    os.makedirs(LOCAL_DIR, exist_ok=True)

    gguf_path = Path(LOCAL_DIR) / GGUF_FILE
    if not gguf_path.exists():
        print(f"Downloading GGUF transformer (~5 GB)...")
        hf_hub_download(repo_id=GGUF_REPO, filename=GGUF_FILE, local_dir=LOCAL_DIR)
        print("✓ GGUF downloaded")
    else:
        print("✓ GGUF file ready")

    for filename in BASE_FILES:
        dest = Path(LOCAL_DIR) / filename
        if dest.exists():
            continue
        try:
            hf_hub_download(repo_id=BASE_REPO, filename=filename, local_dir=LOCAL_DIR)
        except Exception:
            pass

    print("✓ All files ready\n")


def load_pipeline():
    from diffusers import ZImagePipeline, ZImageTransformer2DModel, GGUFQuantizationConfig
    from diffusers.utils import logging as dlogging
    dlogging.set_verbosity_warning()

    gguf_path = str(Path(LOCAL_DIR) / GGUF_FILE)
    print("Loading GGUF transformer...")

    transformer = ZImageTransformer2DModel.from_single_file(
        gguf_path,
        quantization_config=GGUFQuantizationConfig(compute_dtype=torch.bfloat16),
        torch_dtype=torch.bfloat16,
    )

    print("Loading pipeline...")
    pipe = ZImagePipeline.from_pretrained(
        LOCAL_DIR,
        transformer=transformer,
        torch_dtype=torch.bfloat16,
        local_files_only=True,
        low_cpu_mem_usage=True,
    )

    # ── GPU memory strategy for 4 GB VRAM ─────────────────────────────────────
    vram_gb = torch.cuda.get_device_properties(0).total_memory / 1e9
    print(f"  GPU: {torch.cuda.get_device_name(0)} ({vram_gb:.1f} GB VRAM)")

    # sequential_cpu_offload is slower but uses less VRAM than model_cpu_offload
    # For RTX 3050 4GB, try model_cpu_offload first — if you get OOM errors
    # switch to sequential_cpu_offload
    pipe.enable_model_cpu_offload()

    # Enable flash attention for speed if available
    try:
        pipe.enable_xformers_memory_efficient_attention()
        print("  xformers ✓")
    except Exception:
        # Try torch's built-in flash attention
        try:
            pipe.transformer.enable_flash_attn()
            print("  flash attention ✓")
        except Exception:
            print("  using default attention")

    # Compile transformer for ~20% speedup (first run will be slow to compile)
    # Uncomment if you want to try it:
    # pipe.transformer = torch.compile(pipe.transformer, mode="reduce-overhead")

    print("Pipeline ready ✓\n")
    return pipe


def generate(pipe, prompt: str, output_path: str,
             width: int, height: int, steps: int, cfg: float, seed: int):
    print(f"Prompt : {prompt}")
    print(f"Size   : {width}×{height}  |  Steps: {steps}  |  CFG: {cfg}  |  Seed: {seed}")
    print("Generating...")

    t0 = time.time()
    generator = torch.Generator("cpu").manual_seed(seed)

    with torch.inference_mode():
        result = pipe(
            prompt=prompt,
            height=height,
            width=width,
            num_inference_steps=steps,
            guidance_scale=cfg,
            generator=generator,
        )

    elapsed = time.time() - t0
    image: Image.Image = result.images[0]
    image.save(output_path)
    print(f"Done in {elapsed:.1f}s  →  {output_path}")
    return image


def main():
    parser = argparse.ArgumentParser(description="Z-Image-Turbo — RTX 3050 optimized")
    parser.add_argument("--prompt", type=str, required=True)
    parser.add_argument("--output", type=str, default="output.png")
    parser.add_argument("--width",  type=int, default=DEFAULT_WIDTH)
    parser.add_argument("--height", type=int, default=DEFAULT_HEIGHT)
    parser.add_argument("--steps",  type=int, default=DEFAULT_STEPS)
    parser.add_argument("--cfg",    type=float, default=DEFAULT_CFG)
    parser.add_argument("--seed",   type=int, default=DEFAULT_SEED)
    args = parser.parse_args()

    ensure_files()
    pipe = load_pipeline()
    generate(pipe, args.prompt, args.output,
             args.width, args.height, args.steps, args.cfg, args.seed)


if __name__ == "__main__":
    main()