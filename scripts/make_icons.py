# Generates the VigiRail PWA icons (rasterised from the vector logo).
# Usage: python scripts/make_icons.py   (requires pillow)
from __future__ import annotations

import os

from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "icons")
ACCENT_TOP = (59, 130, 246)     # #3b82f6
ACCENT_BOTTOM = (29, 78, 216)   # #1d4ed8


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def draw_logo(size: int, *, radius_ratio: float = 0.25, scale: float = 1.0) -> Image.Image:
    """Rounded-square badge with the VigiRail track glyph."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    radius = int(size * radius_ratio)

    # Vertical gradient background.
    for y in range(size):
        t = y / max(1, size - 1)
        color = (
            lerp(ACCENT_TOP[0], ACCENT_BOTTOM[0], t),
            lerp(ACCENT_TOP[1], ACCENT_BOTTOM[1], t),
            lerp(ACCENT_TOP[2], ACCENT_BOTTOM[2], t),
            255,
        )
        draw.line([(0, y), (size, y)], fill=color)
    # Re-apply rounded corners with a mask.
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    img.putalpha(mask)

    # Track glyph: two rails + sleepers, scaled into the badge.
    draw = ImageDraw.Draw(img)
    stroke = max(2, int(size * 0.055 * scale))
    white = (255, 255, 255, 255)
    inset = size * 0.30
    top_w = size * 0.26
    bottom_w = size * 0.40

    # Rails (slightly converging upward).
    draw.line([(size / 2 - top_w / 2, inset), (size / 2 - bottom_w / 2, size - inset)], fill=white, width=stroke)
    draw.line([(size / 2 + top_w / 2, inset), (size / 2 + bottom_w / 2, size - inset)], fill=white, width=stroke)

    # Sleepers.
    for t in (0.30, 0.52, 0.74):
        y = inset + (size - 2 * inset) * t
        x_left = size / 2 - (top_w + (bottom_w - top_w) * t) / 2
        x_right = size / 2 + (top_w + (bottom_w - top_w) * t) / 2
        draw.line([(x_left, y), (x_right, y)], fill=white, width=max(2, stroke - 1))
    return img


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    draw_logo(192).save(os.path.join(OUT, "icon-192.png"))
    draw_logo(512).save(os.path.join(OUT, "icon-512.png"))
    draw_logo(512, radius_ratio=0.5).save(os.path.join(OUT, "maskable-512.png"))  # full-bleed safe zone
    draw_logo(180, radius_ratio=0.22).save(os.path.join(OUT, "apple-touch-icon.png"))
    print(f"Icons written to {os.path.abspath(OUT)}")


if __name__ == "__main__":
    main()
