/**
 * Clean Anchor Whitespace
 * Removes excessive leading and trailing whitespace from anchor tag content
 * Moves necessary spacing OUTSIDE the anchor tag to adjacent text nodes
 */

/**
 * Trim whitespace from all anchor tags while preserving necessary spacing
 * @param {HTMLElement} root - Root element to process
 */
export function cleanAnchorWhitespace(root) {
  const anchors = root.querySelectorAll('a');

  anchors.forEach(anchor => {
    const originalText = anchor.textContent;
    const trimmedText = originalText.trim();

    if (!trimmedText) return;

    // Check if original had leading/trailing spaces
    const hadLeadingSpace = /^\s/.test(originalText);
    const hadTrailingSpace = /\s$/.test(originalText);

    // Preserve formatting (strong, em, etc.) while trimming whitespace
    // Don't use textContent as it removes all HTML formatting
    // Instead, trim whitespace from text nodes only
    trimWhitespaceFromAnchor(anchor);

    // Move leading space OUTSIDE to previous sibling or create new text node
    if (hadLeadingSpace) {
      const prevSibling = anchor.previousSibling;
      if (prevSibling && prevSibling.nodeType === Node.TEXT_NODE) {
        // Add space to end of previous text node if it doesn't have one
        if (!/\s$/.test(prevSibling.textContent)) {
          prevSibling.textContent = prevSibling.textContent + ' ';
        }
      } else {
        // Create a new text node with space before the anchor
        anchor.parentNode.insertBefore(document.createTextNode(' '), anchor);
      }
    }

    // Move trailing space OUTSIDE to next sibling or create new text node
    if (hadTrailingSpace) {
      const nextSibling = anchor.nextSibling;
      if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
        // Add space to start of next text node if it doesn't have one
        if (!/^\s/.test(nextSibling.textContent)) {
          nextSibling.textContent = ' ' + nextSibling.textContent;
        }
      } else {
        // Create a new text node with space after the anchor
        anchor.parentNode.insertBefore(document.createTextNode(' '), anchor.nextSibling);
      }
    }
  });
}

/**
 * Trim whitespace from anchor tag while preserving formatting
 * Removes leading/trailing whitespace from text nodes only
 * @param {HTMLElement} anchor - Anchor element to clean
 */
function trimWhitespaceFromAnchor(anchor) {
  // Get all child nodes
  const childNodes = Array.from(anchor.childNodes);
  
  // Trim leading whitespace from first text node
  if (childNodes.length > 0 && childNodes[0].nodeType === Node.TEXT_NODE) {
    const firstText = childNodes[0];
    firstText.textContent = firstText.textContent.replace(/^\s+/, '');
    // Remove empty text node if it became empty
    if (firstText.textContent === '') {
      firstText.remove();
    }
  }
  
  // Trim trailing whitespace from last text node
  if (childNodes.length > 0) {
    const lastNode = childNodes[childNodes.length - 1];
    if (lastNode.nodeType === Node.TEXT_NODE) {
      lastNode.textContent = lastNode.textContent.replace(/\s+$/, '');
      // Remove empty text node if it became empty
      if (lastNode.textContent === '') {
        lastNode.remove();
      }
    }
  }
}
