/**
 * Strong in Headers Feature
 * Wraps header content in <strong> tags or removes them
 */

/**
 * Apply <strong> tags to headers (h1-h6)
 * @param {HTMLElement} root - Root element to process
 * @param {boolean} enable - True to add <strong>, false to remove
 */
export function applyStrongInHeaders(root, enable = true) {
  const headers = root.querySelectorAll('h1, h2, h3, h4, h5, h6');

  headers.forEach(header => {
    if (enable) {
      // Add <strong> if not already present
      // Check if header already contains <strong> at root level
      if (header.querySelector(':scope > strong')) {
        return;
      }

      // Wrap all content in <strong>
      const strong = document.createElement('strong');
      while (header.firstChild) {
        strong.appendChild(header.firstChild);
      }
      header.appendChild(strong);
    } else {
      // Remove <strong> tags from headers
      const strongTags = header.querySelectorAll('strong');
      strongTags.forEach(strong => {
        // Move children out of <strong> and remove the tag
        while (strong.firstChild) {
          strong.parentNode.insertBefore(strong.firstChild, strong);
        }
        strong.remove();
      });
    }
  });
}
