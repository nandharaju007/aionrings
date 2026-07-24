#!/usr/bin/env python3
"""Generate iOS and Android app icon asset sets from a 1024x1024 source."""
import json
import shutil
import zipfile
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE_PATH = ROOT / "src/assets/aion-app-icon-source.png"
FOREGROUND_PATH = ROOT / "src/assets/aion-app-icon-foreground.png"
OUT_DIR = ROOT / "src/assets/app-icons"
ZIP_PATH = Path("/mnt/documents/aion-app-icons.zip")

IOS_SIZES = [
    (20, [2, 3]),
    (29, [2, 3]),
    (40, [2, 3]),
    (60, [2, 3]),
    (76, [2]),
    (83.5, [2]),
    (1024, ["marketing"]),
]

ANDROID_DENSITIES = [
    ("mdpi", 48),
    ("hdpi", 72),
    ("xhdpi", 96),
    ("xxhdpi", 144),
    ("xxxhdpi", 192),
]

ADAPTIVE_SIZE_DP = 432  # xxxhdpi adaptive layer size


def make_ios_iconset(source: Image.Image):
    iconset_dir = OUT_DIR / "ios/AppIcon.appiconset"
    iconset_dir.mkdir(parents=True, exist_ok=True)
    images = []
    for base, scales in IOS_SIZES:
        for scale in scales:
            if isinstance(scale, str):
                size_px = int(base)
                filename = f"icon-{base}-{scale}.png"
                idioma = "ios-marketing"
                scale_str = "1x"
            else:
                size_px = int(base * scale)
                filename = f"icon-{base}@{scale}x.png"
                idioma = "iphone" if base in (20, 29, 40, 60) else "ipad"
                scale_str = f"{scale}x"
            resized = source.resize((size_px, size_px), Image.LANCZOS)
            resized.save(iconset_dir / filename, "PNG")
            images.append(
                {
                    "size": f"{base}x{base}" if base != 1024 else "1024x1024",
                    "idiom": idioma,
                    "filename": filename,
                    "scale": scale_str,
                }
            )
    (iconset_dir / "Contents.json").write_text(
        json.dumps({"images": images, "info": {"version": 1, "author": "aiOn"}}, indent=2)
    )


def make_android_icons(source: Image.Image, foreground: Image.Image):
    for density, size in ANDROID_DENSITIES:
        mipmap_dir = OUT_DIR / f"android/mipmap-{density}"
        mipmap_dir.mkdir(parents=True, exist_ok=True)
        # Legacy launcher icon (square, no rounding)
        source.resize((size, size), Image.LANCZOS).save(
            mipmap_dir / "ic_launcher.png", "PNG"
        )
        # Round legacy variant (circular mask)
        circular = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        src = source.resize((size, size), Image.LANCZOS).convert("RGBA")
        mask = Image.new("L", (size, size), 0)
        mask.paste(255, (0, 0, size, size))
        # Apply circular mask
        from PIL import ImageDraw
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, size, size), fill=255)
        circular.paste(src, (0, 0), mask)
        circular.save(mipmap_dir / "ic_launcher_round.png", "PNG")

    # Adaptive foreground / background at xxxhdpi density (432x432)
    adaptive_dir = OUT_DIR / "android/mipmap-xxxhdpi"
    adaptive_dir.mkdir(parents=True, exist_ok=True)
    bg = Image.new("RGBA", (ADAPTIVE_SIZE_DP, ADAPTIVE_SIZE_DP), (10, 22, 40, 255))
    fg = foreground.resize((ADAPTIVE_SIZE_DP, ADAPTIVE_SIZE_DP), Image.LANCZOS).convert("RGBA")
    bg.save(adaptive_dir / "ic_launcher_background.png", "PNG")
    fg.save(adaptive_dir / "ic_launcher_foreground.png", "PNG")

    # Play Store feature / store listing icon
    play_dir = OUT_DIR / "android/play-store"
    play_dir.mkdir(parents=True, exist_ok=True)
    source.resize((512, 512), Image.LANCZOS).save(play_dir / "icon-512.png", "PNG")


def make_web_icons(source: Image.Image):
    web_dir = OUT_DIR / "web"
    web_dir.mkdir(parents=True, exist_ok=True)
    for name, size in [("favicon", 32), ("apple-touch-icon", 180), ("icon-192", 192), ("icon-512", 512)]:
        source.resize((size, size), Image.LANCZOS).save(web_dir / f"{name}.png", "PNG")
    # Favicon .ico with multiple sizes
    fav = source.resize((256, 256), Image.LANCZOS)
    fav.save(web_dir / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (256, 256)])


def make_zip():
    if ZIP_PATH.exists():
        ZIP_PATH.unlink()
    with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in OUT_DIR.rglob("*"):
            if path.is_file():
                zf.write(path, path.relative_to(OUT_DIR))
    print(f"Created {ZIP_PATH}")


def main():
    if not SOURCE_PATH.exists():
        raise FileNotFoundError(f"Source icon not found: {SOURCE_PATH}")
    source = Image.open(SOURCE_PATH).convert("RGB")
    if source.size != (1024, 1024):
        source = source.resize((1024, 1024), Image.LANCZOS)

    foreground = Image.open(FOREGROUND_PATH).convert("RGBA") if FOREGROUND_PATH.exists() else None
    if foreground and foreground.size != (1024, 1024):
        foreground = foreground.resize((1024, 1024), Image.LANCZOS)

    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    make_ios_iconset(source)
    make_android_icons(source, foreground or source)
    make_web_icons(source)
    make_zip()

    # Update project web icons from generated set
    web_dir = OUT_DIR / "web"
    public_dir = ROOT / "public"
    shutil.copy(web_dir / "favicon.ico", public_dir / "favicon.ico")
    shutil.copy(web_dir / "favicon.png", public_dir / "favicon.png")
    shutil.copy(web_dir / "apple-touch-icon.png", public_dir / "apple-touch-icon.png")
    print("Updated public favicon assets.")


if __name__ == "__main__":
    main()
