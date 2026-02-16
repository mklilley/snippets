"""
Concatenate MP4 files in the current directory into a single output video.

Behaviour:
- Scans the current folder for all .mp4 files
- Extracts the first number found in each filename
- Sorts files numerically (e.g. clip1.mp4, clip2.mp4, clip10.mp4)
- Files without numbers are placed at the end
- Uses ffmpeg to concatenate without re-encoding (fast, lossless)

Usage:
1. Place this script in the folder with your MP4 files
2. Ensure ffmpeg is installed and on PATH
3. Run: python concat_mp4s.py
4. Output file: output.mp4 (created in the same directory)

Notes:
- Input videos should have matching codecs and settings for stream-copy concat
- Only processes MP4 files in the current directory (no subfolders)
"""

import os
import re
import glob
import subprocess
import sys

def extract_number(filename):
    """
    Extract the first integer found in a filename.
    Files without numbers are sorted last.
    """
    match = re.search(r'\d+', filename)
    return int(match.group()) if match else float("inf")

def main():
    # Find all MP4 files in current directory
    mp4_files = glob.glob("*.mp4")

    if not mp4_files:
        print("No MP4 files found in current directory.")
        sys.exit(1)

    # Sort by number extracted from filename
    mp4_files.sort(key=extract_number)

    print("Concatenation order:")
    for f in mp4_files:
        print(" ", f)

    # Create temporary file list for ffmpeg
    list_filename = "files_to_concat.txt"
    with open(list_filename, "w", encoding="utf-8") as f:
        for filename in mp4_files:
            # ffmpeg concat demuxer requires this format
            f.write(f"file '{os.path.abspath(filename)}'\n")

    output_file = "output.mp4"

    # Run ffmpeg
    cmd = [
        "ffmpeg",
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", list_filename,
        "-c", "copy",
        output_file
    ]

    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError:
        print("ffmpeg failed.")
        sys.exit(1)
    finally:
        # Clean up temp file
        if os.path.exists(list_filename):
            os.remove(list_filename)

    print(f"\nDone. Created: {output_file}")

if __name__ == "__main__":
    main()

