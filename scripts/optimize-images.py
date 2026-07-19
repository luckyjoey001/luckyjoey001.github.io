#!/usr/bin/env python3
"""优化 calligraphy 作品图：生成 web 展示图(限宽1600) + 小缩略图(限宽240)。

- assets/works/work-XX.jpg  -> 覆盖为限宽 1600 的展示图 (q85, progressive)
- assets/works/thumbs/work-XX.jpg -> 限宽 240 的缩略图 (q80)
仅在需要时重编码，避免无谓的画质损失。
"""
import os
from PIL import Image, ImageOps

ROOT = os.path.join(os.path.dirname(__file__), "..", "assets", "works")
THUMB_DIR = os.path.join(ROOT, "thumbs")
DISPLAY_MAX_W = 1600
THUMB_MAX_W = 240
DISPLAY_Q = 85
THUMB_Q = 80

os.makedirs(THUMB_DIR, exist_ok=True)


def resize_to_width(im, max_w):
    w, h = im.size
    if w <= max_w:
        return im
    ratio = max_w / w
    return im.resize((max_w, max(1, round(h * ratio))), Image.Resampling.LANCZOS)


def process(n):
    name = f"work-{n:02d}.jpg"
    src = os.path.join(ROOT, name)
    if not os.path.exists(src):
        print(f"skip {name} (missing)")
        return
    im = Image.open(src).convert("RGB")

    # 展示图：覆盖原文件
    disp = resize_to_width(im, DISPLAY_MAX_W)
    disp.save(os.path.join(ROOT, name), "JPEG",
              quality=DISPLAY_Q, optimize=True, progressive=True)

    # 缩略图
    th = resize_to_width(im, THUMB_MAX_W)
    th.save(os.path.join(THUMB_DIR, name), "JPEG",
            quality=THUMB_Q, optimize=True)

    dsize = os.path.getsize(os.path.join(ROOT, name)) / 1024
    tsize = os.path.getsize(os.path.join(THUMB_DIR, name)) / 1024
    print(f"{name}: display {disp.size[0]}x{disp.size[1]} {dsize:.0f}KB | "
          f"thumb {th.size[0]}x{th.size[1]} {tsize:.0f}KB")


if __name__ == "__main__":
    for i in range(1, 22):
        process(i)
    print("done")
