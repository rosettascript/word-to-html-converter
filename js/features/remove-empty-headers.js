/**
 * Remove Empty Headers
 * Removes header elements (H1-H6) that contain no meaningful text content
 */

/**
 * Check if a header is empty (no text or only whitespace/formatting)
 * @param {Element} header - The header element to check
 * @returns {boolean} True if header is empty
 */
function isEmptyHeader(header) {
  if (!header || !header.textContent) {
    return true;
  }
  
  // Get text content and normalize whitespace
  const text = header.textContent.trim();
  
  // Check if empty or only contains non-breaking spaces
  return text === '' || text.replace(/\u00A0/g, '').trim() === '';
}

/**
 * Remove all empty headers from the document
 * @param {Document} doc - The document to process
 */
export function removeEmptyHeaders(doc) {
  // Find all header elements (H1-H6)
  const headers = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let removedCount = 0;
  
  headers.forEach(header => {
    if (isEmptyHeader(header)) {
      header.remove();
      removedCount++;
    }
  });
  
  if (removedCount > 0) {
    console.log(`Removed ${removedCount} empty header(s)`);
  }
}

