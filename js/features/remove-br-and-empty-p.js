/**
 * Remove BR and Empty P Tags
 * Removes <br> tags and empty <p></p> tags completely
 */

/**
 * Remove all <br> tags and empty <p> tags
 * @param {HTMLElement} root - Root element to process
 */
export function removeBrAndEmptyP(root) {
  // Remove all <br> tags
  const brTags = Array.from(root.querySelectorAll('br'));
  brTags.forEach(br => br.remove());

  // Remove all empty <p> tags (no content or only whitespace)
  const pTags = Array.from(root.querySelectorAll('p'));
  pTags.forEach(p => {
    if (p.textContent.trim() === '') {
      p.remove();
    }
  });
}
