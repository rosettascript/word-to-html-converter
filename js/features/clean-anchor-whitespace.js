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
    
    // Set the cleaned text (no spaces inside anchor)
    anchor.textContent = trimmedText;
    
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

