# Use this script after running `mit_canvas_download.js` 
# to move canvas files into a folder structure that matches the course structure.
import os
import shutil

# Replace with your Downloads path
download_dir = "~/Downloads"  # e.g., "C:/Users/You/Downloads" or "~/Downloads"
download_dir = os.path.expanduser(download_dir)

# Paste the mapping from the Console here
default_to_target_path_map = {
    "Syll2024.pdf": "Week_1/Syll2024.pdf",
    "Notes1_2024.pdf": "Week_1/Notes1_2024.pdf",
    "Corrections2017_10_15.pdf": "Week_1/Corrections2017_10_15.pdf"
    # Add more from your Console output
}

# Move files into folders
for default_filename, target_path in default_to_target_path_map.items():
    src = os.path.join(download_dir, default_filename)
    print(src)
    if os.path.exists(src):
        # Extract folder and filename from target path
        folder, filename = target_path.split('/', 1)
        folder_path = os.path.join(download_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        dst = os.path.join(folder_path, filename)
        shutil.move(src, dst)
        print(f"Moved {default_filename} to {folder}/{filename}")
    else:
        print(f"File {default_filename} not found in {download_dir}")