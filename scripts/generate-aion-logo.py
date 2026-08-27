#!/usr/bin/env python3
"""Generate downloadable aiOn logo package (PNG + SVG + PDF)."""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white, Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

OUT_DIR = Path("/mnt/documents/aion-logo")
OUT_DIR.mkdir(parents=True, exist_ok=True)

WIDTH, HEIGHT = 3000, 2000
BG = "#0A1628"
WHITE = "#F8FAFC"
GRAY_LIGHT = "#94A3B8"
GRAY_MID = "#6B7A8C"

FONT_BOLD = "/nix/store/0hdgmcjy7q8zn7h3amz8nf96l9qh7wv0-liberation-fonts-2.1.5/share/fonts/truetype/LiberationSans-Bold.ttf"
FONT_REG = "/nix/store/0hdgmcjy7q8zn7h3amz8nf96l9qh7wv0-liberation-fonts-2.1.5/share/fonts/truetype/LiberationSans-Regular.ttf"

GRADIENT = ["#00A9E0", "#1878E0", "#6D28D9"]


def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def lerp_color(c1, c2, t):
    r1, g1, b1 = c1
    r2, g2, b2 = c2
    return (
        int(r1 + (r2 - r1) * t),
        int(g1 + (g2 - g1) * t),
        int(b1 + (b2 - b1) * t),
    )


def gradient_color(t):
    # t from 0 to 1 mapped to 3-stop gradient
    if t < 0.5:
        return lerp_color(hex_to_rgb(GRADIENT[0]), hex_to_rgb(GRADIENT[1]), t * 2)
    else:
        return lerp_color(hex_to_rgb(GRADIENT[1]), hex_to_rgb(GRADIENT[2]), (t - 0.5) * 2)


def draw_gradient_ring(draw, cx, cy, r, thickness, steps=360):
    """Draw an anti-aliased ring with a multi-stop gradient stroke."""
    for i in range(steps):
        t = i / steps
        color = gradient_color(t)
        angle_start = t * 360 - 90
        angle_end = ((i + 1) / steps) * 360 - 90
        draw.arc(
            [cx - r, cy - r, cx + r, cy + r],
            start=angle_start,
            end=angle_end,
            fill=color,
            width=thickness,
        )


def make_png():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(img)

    font_main = ImageFont.truetype(FONT_BOLD, 280)
    font_tag = ImageFont.truetype(FONT_BOLD, 72)
    font_sub = ImageFont.truetype(FONT_REG, 56)

    # Measure text pieces
    ai_bbox = draw.textbbox((0, 0), "ai", font=font_main)
    n_bbox = draw.textbbox((0, 0), "n", font=font_main)
    ai_w = ai_bbox[2] - ai_bbox[0]
    n_w = n_bbox[2] - n_bbox[0]

    # Ring geometry
    ring_r = 90
    ring_thickness = 28
    gap = 18
    total_word_width = ai_w + gap + ring_r * 2 + gap + n_w
    start_x = (WIDTH - total_word_width) / 2
    baseline_y = HEIGHT // 2 - 60

    # Draw ai
    draw.text((start_x, baseline_y - (ai_bbox[3] - ai_bbox[1]) // 2), "ai", font=font_main, fill=WHITE, anchor="lm")
    # Letter "a" baseline adjustment: anchor lm needs bbox offset; simpler draw at baseline with textbbox top
    ai_top = baseline_y - (ai_bbox[3] - ai_bbox[1]) / 2 - ai_bbox[1]
    n_top = baseline_y - (n_bbox[3] - n_bbox[1]) / 2 - n_bbox[1]
    draw.text((start_x, ai_top), "ai", font=font_main, fill=WHITE)
    # Ring center
    ring_cx = start_x + ai_w + gap + ring_r
    ring_cy = baseline_y
    draw_gradient_ring(draw, ring_cx, ring_cy, ring_r, ring_thickness)
    # n
    n_x = ring_cx + ring_r + gap
    draw.text((n_x, n_top), "n", font=font_main, fill=WHITE)

    # Tagline 1: VITAL · LIFE · FORCE
    tag1 = "VITAL · LIFE · FORCE"
    tag1_bbox = draw.textbbox((0, 0), tag1, font=font_tag)
    tag1_w = tag1_bbox[2] - tag1_bbox[0]
    tag1_x = (WIDTH - tag1_w) / 2
    tag1_y = baseline_y + 180
    draw.text((tag1_x, tag1_y), tag1, font=font_tag, fill=GRAY_MID)

    # Tagline 2: The Full Circle of Health
    tag2 = "The Full Circle of Health"
    tag2_bbox = draw.textbbox((0, 0), tag2, font=font_sub)
    tag2_w = tag2_bbox[2] - tag2_bbox[0]
    tag2_x = (WIDTH - tag2_w) / 2
    tag2_y = tag1_y + 110
    draw.text((tag2_x, tag2_y), tag2, font=font_sub, fill=GRAY_LIGHT)

    out_path = OUT_DIR / "aion-logo.png"
    img.save(out_path, "PNG", dpi=(300, 300))
    print(f"Created {out_path}")
    return out_path


def make_svg():
    svg = f'''<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="3000" height="2000" viewBox="0 0 3000 2000" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{GRADIENT[0]}" />
      <stop offset="50%" stop-color="{GRADIENT[1]}" />
      <stop offset="100%" stop-color="{GRADIENT[2]}" />
    </linearGradient>
    <style>
      .main {{ font: bold 280px 'Liberation Sans', Arial, sans-serif; fill: {WHITE}; letter-spacing: -4px; }}
      .tag1 {{ font: bold 72px 'Liberation Sans', Arial, sans-serif; fill: {GRAY_MID}; letter-spacing: 6px; }}
      .tag2 {{ font: normal 56px 'Liberation Sans', Arial, sans-serif; fill: {GRAY_LIGHT}; }}
    </style>
  </defs>
  <rect width="3000" height="2000" fill="{BG}" />
  <text x="1060" y="1030" text-anchor="end" class="main">ai</text>
  <circle cx="1500" cy="1000" r="90" fill="none" stroke="url(#ringGradient)" stroke-width="28" />
  <text x="1550" y="1030" text-anchor="start" class="main">n</text>
  <text x="1500" y="1180" text-anchor="middle" class="tag1">VITAL · LIFE · FORCE</text>
  <text x="1500" y="1290" text-anchor="middle" class="tag2">The Full Circle of Health</text>
</svg>'''
    out_path = OUT_DIR / "aion-logo.svg"
    out_path.write_text(svg)
    print(f"Created {out_path}")
    return out_path


def make_pdf():
    png_path = OUT_DIR / "aion-logo.png"
    pdf_path = OUT_DIR / "aion-logo.pdf"

    c = canvas.Canvas(str(pdf_path), pagesize=letter)
    width, height = letter  # 612 x 792 points

    # Background
    c.setFillColor(HexColor(BG))
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # Embed the high-res PNG, scaled to fit the page with margins
    img_w, img_h = 3000, 2000
    target_w = width - 72  # 0.5 inch margin each side
    scale = target_w / img_w
    target_h = img_h * scale
    x = 36
    y = (height - target_h) / 2
    c.drawImage(str(png_path), x, y, width=target_w, height=target_h)

    c.save()
    print(f"Created {pdf_path}")
    return pdf_path


if __name__ == "__main__":
    make_png()
    make_svg()
    make_pdf()
    print("aiOn logo package ready.")
