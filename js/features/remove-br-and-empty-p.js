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
  // Also remove <p>&nbsp;</p> spacer paragraphs
  // Note: &nbsp; entities may be converted to non-breaking space characters (U+00A0) by DOMParser
  // JavaScript's trim() does NOT remove non-breaking spaces, so we need to check for them explicitly
  const pTags = Array.from(root.querySelectorAll('p'));
  pTags.forEach(p => {
    const textContent = p.textContent;
    const innerHTML = p.innerHTML.trim();
    
    // Check for &nbsp; entity in innerHTML first (most reliable check)
    if (innerHTML === '&nbsp;' && !p.hasAttributes()) {
      p.remove();
      return; // Skip other checks
    }
    
    // Check for non-breaking space character (U+00A0) - this is what &nbsp; becomes after DOMParser
    // Remove all whitespace and non-breaking spaces, then check if empty
    // Also check if innerHTML is empty or only contains whitespace/nbsp
    const cleanedText = textContent.replace(/[\s\u00A0]/g, '');
    const cleanedHTML = innerHTML.replace(/[\s\u00A0&;]/g, '');
    
    if ((cleanedText === '' || cleanedHTML === '' || cleanedHTML === 'nbsp') && !p.hasAttributes()) {
      p.remove();
    }
    // Fallback: Check for empty text content (after trimming regular whitespace)
    else if (textContent.trim() === '' && !p.hasAttributes()) {
      p.remove();
    }
  });
}
