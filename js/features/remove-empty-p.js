/**
 * Remove Empty P Tags
 * Removes empty <p></p> tags (no content or only whitespace)
 */

/**
 * Remove all empty <p> tags
 * @param {HTMLElement} root - Root element to process
 */
export function removeEmptyP(root) {
  // Remove all empty <p> tags (no content or only whitespace)
  const pTags = Array.from(root.querySelectorAll('p'));
  pTags.forEach(p => {
    if (p.textContent.trim() === '') {
      p.remove();
    }
  });
}
