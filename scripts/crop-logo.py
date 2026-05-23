#!/usr/bin/env python3
"""Pubblica logo1.png in header e ritaglia l'icona per la favicon."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "images" / "logo1.png"
OUT_HEADER = ROOT / "public" / "logo1.png"
OUT_FAVICON = ROOT / "src" / "app" / "icon.png"

PADDING = 16


def content_bounds(im: Image.Image) -> tuple[int, int, int, int]:
    pixels = im.load()
    w, h = im.size
    min_x, min_y, max_x, max_y = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a > 20 and (r + g + b) > 30:
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
    return min_x, min_y, max_x, max_y


def crop_with_padding(im: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    x0, y0, x1, y1 = box
    x0 = max(0, x0 - PADDING)
    y0 = max(0, y0 - PADDING)
    x1 = min(im.width, x1 + PADDING)
    y1 = min(im.height, y1 + PADDING)
    return im.crop((x0, y0, x1, y1))


def icon_from_horizontal_logo(im: Image.Image) -> Image.Image:
    """Icona a sinistra: tutto prima del gap prima della scritta STUFY."""
    w, h = im.size
    min_x, min_y, max_x, max_y = content_bounds(im)
    pixels = im.load()

    # Cerca colonna quasi vuota tra icona e testo (metà destra del contenuto)
    mid = min_x + (max_x - min_x) // 2
    split_x = max_x
    threshold = 6

    for x in range(mid, max_x):
        col = sum(
            1
            for y in range(min_y, max_y + 1)
            if pixels[x, y][3] > 20 and sum(pixels[x, y][:3]) > 30
        )
        if col < threshold:
            # conferma gap di almeno 8 colonne
            gap = True
            for x2 in range(x, min(x + 12, max_x)):
                c2 = sum(
                    1
                    for y in range(min_y, max_y + 1)
                    if pixels[x2, y][3] > 20 and sum(pixels[x2, y][:3]) > 30
                )
                if c2 >= threshold:
                    gap = False
                    break
            if gap:
                split_x = x
                break

    if split_x >= max_x - 20:
        split_x = min_x + int((max_x - min_x) * 0.42)

    return crop_with_padding(im, (min_x, min_y, split_x, max_y))


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Manca {SRC}")

    import shutil

    shutil.copy2(SRC, OUT_HEADER)
    im = Image.open(SRC).convert("RGBA")

    icon = icon_from_horizontal_logo(im)
    favicon = icon.copy()
    favicon.thumbnail((512, 512), Image.Resampling.LANCZOS)
    favicon.save(OUT_FAVICON, optimize=True)

    print(f"Header: {OUT_HEADER}")
    print(f"Favicon: {icon.size[0]}x{icon.size[1]}px → {OUT_FAVICON}")


if __name__ == "__main__":
    main()
