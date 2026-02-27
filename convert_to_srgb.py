#!/usr/bin/env python3
"""
convert_to_srgb.py — Convert images to sRGB on macOS (fixes muted colours in LaTeX).

Uses the built-in `sips` tool to convert (not just strip) the embedded colour profile
to standard sRGB.

Usage:
  python convert_to_srgb.py image1.png image2.jpg ...
  ./convert_to_srgb.py image1.png

Output:
  Writes a new file next to the original with '_srgb' appended to the name.
  Example: figure.png -> figure_srgb.png
"""

import subprocess
import sys
from pathlib import Path

SRGB_PROFILE = "/System/Library/ColorSync/Profiles/sRGB Profile.icc"

def convert_image(path):
    path = Path(path)
    if not path.exists():
        print(f"❌ File not found: {path}")
        return

    output = path.with_stem(path.stem + "_srgb")

    cmd = [
        "sips",
        "--matchTo", SRGB_PROFILE,
        str(path),
        "--out", str(output)
    ]

    try:
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)
        print(f"✅ Converted: {output}")
    except subprocess.CalledProcessError:
        print(f"❌ Failed: {path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python convert_to_srgb.py image1.png image2.png ...")
        sys.exit(1)

    for image in sys.argv[1:]:
        convert_image(image)