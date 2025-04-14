// Login to MIT Canvas, navigate to a module, e.g. https://canvas.mit.edu/courses/28152/modules
// and run this script in the browser console to download all PDFs from the course.
// This script will first log the mapping of default filenames to target paths,
// then prompt the user to decide whether to download the files.
// This script is intended for educational purposes only. Use it responsibly and in accordance with MIT's policies.
// Use in combination with `mit_canvas_move.py` to move files into a folder structure that matches the course structure.
(async () => {
  // Extract the course ID from the URL (e.g., https://canvas.mit.edu/courses/28152/modules)
  const currentUrl = window.location.href;
  const courseIdMatch = currentUrl.match(/\/courses\/(\d+)/);
  if (!courseIdMatch) {
    console.error('Could not extract course ID from URL:', currentUrl);
    return;
  }
  const courseId = courseIdMatch[1]; // e.g., 28152
  console.log(`Extracted course ID: ${courseId}`);

  // Function to fetch the final file_id by following redirects
  async function getDownloadUrl(itemUrl) {
    try {
      const response = await fetch(itemUrl, { method: 'GET', credentials: 'include' });
      const finalUrl = response.url;
      const fileIdMatch = finalUrl.match(/\/files\/(\d+)/);
      if (!fileIdMatch) {
        console.warn(`Could not extract file_id from ${finalUrl}`);
        return null;
      }
      const fileId = fileIdMatch[1];
      return `/courses/${courseId}/files/${fileId}/download`; // Use extracted courseId
    } catch (error) {
      console.error(`Error fetching ${itemUrl}:`, error);
      return null;
    }
  }

  // Function to trigger a download
  function triggerDownload(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Function to sanitize filenames
  function sanitizeName(name) {
    return name.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
  }

  // Collect all modules
  const modules = document.querySelectorAll('div.context_module');
  const downloadTasks = [];
  const defaultToTargetPathMap = {};

  for (const module of modules) {
    // Get module name
    const moduleNameEl = module.querySelector('.ig-header-title .name') || module.querySelector('[aria-label]');
    const moduleName = moduleNameEl ? moduleNameEl.textContent.trim() : 'Unknown_Module';
    const sanitizedModuleName = sanitizeName(moduleName);

    // Find item links
    const itemLinks = module.querySelectorAll('a[href*="/courses/"]');
    for (const link of itemLinks) {
      const itemUrl = link.href;
      const itemTitle = link.textContent.trim() || 'unnamed_file';

      // Skip non-PDFs
      if (!itemTitle.toLowerCase().endsWith('.pdf')) {
        console.log(`Skipping non-PDF: ${itemTitle}`);
        continue;
      }

      const sanitizedTitle = sanitizeName(itemTitle);
      const defaultFilename = itemTitle; // Guess the default filename as the itemTitle (e.g., Syll2024.pdf)
      const targetPath = `${sanitizedModuleName}/${defaultFilename}`; // e.g., Week_1/Syll2024.pdf

      downloadTasks.push({
        moduleName: sanitizedModuleName,
        itemUrl,
        filename: `${sanitizedModuleName}_${sanitizedTitle}`,
        defaultFilename: defaultFilename,
        targetPath: targetPath,
      });
    }
  }

  // Log all tasks
  console.log(`Found ${downloadTasks.length} PDFs:`);
  downloadTasks.forEach(task => console.log(`- ${task.filename}: ${task.itemUrl}`));

  // Build and log the mapping immediately
  for (const task of downloadTasks) {
    defaultToTargetPathMap[task.defaultFilename] = task.targetPath;
  }

  console.log('Default Filename to Target Path Mapping (for moving):');
  console.log(JSON.stringify(defaultToTargetPathMap, null, 2));

  // Prompt the user to decide whether to download
  const shouldDownload = window.confirm(`Found ${downloadTasks.length} PDFs. Do you want to download all files?`);
  if (!shouldDownload) {
    console.log('Download canceled by user.');
    return;
  }

  // Process downloads with delay, resolving URLs only after confirmation
  for (const task of downloadTasks) {
    console.log(`Preparing ${task.filename}...`);
    const downloadUrl = await getDownloadUrl(task.itemUrl);
    if (downloadUrl) {
      console.log(`Downloading ${task.filename} (will save as ${task.defaultFilename}) from ${downloadUrl}`);
      triggerDownload(downloadUrl, task.filename);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay
    } else {
      console.warn(`Failed to get download URL for ${task.filename}`);
    }
  }

  console.log('Download process complete! Use the mapping to move files into folders.');
})();