/**
 * Remove Space After FAQ Headers
 * Removes <br> or empty <p> tags that appear immediately after h2 elements
 */

/**
 * Remove <br> or empty paragraphs after FAQ headers (any heading level)
 * This feature is ONLY for Shopify Blogs mode - it should not run in other modes
 * @param {HTMLElement} root - Root element to process
 * @param {string} mode - Processing mode (must be 'shopify-blogs')
 */
export function removeSpaceAfterFAQHeaders(root, mode = 'shopify-blogs') {
  // Safety guard: Only process in Shopify Blogs mode
  if (mode !== 'shopify-blogs') {
    return; // Do not process in non-Blogs modes
  }
  // Process all heading levels, not just h2
  // FAQ sections can use any heading level
  const allHeadings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');

  allHeadings.forEach(heading => {
    // Check if this is an FAQ section (any heading level)
    const headingText = heading.textContent.trim().toLowerCase();
    const normalizedText = headingText.replace(/:\s*$/, '');
    const isFAQSection = 
      normalizedText.includes('faq') ||
      normalizedText.includes('frequently asked questions') ||
      normalizedText === 'questions' ||
      normalizedText === 'q&a' ||
      normalizedText === 'q and a' ||
      normalizedText.includes('common questions') ||
      normalizedText.includes('help') ||
      /^(questions?\s+and\s+answers?|q\s*&\s*a|faq|frequently\s+asked)/i.test(normalizedText);
    
    // Only process FAQ sections
    if (!isFAQSection) {
      return;
    }
    
    let nextSibling = heading.nextSibling;

    // Remove all immediate following <br>, empty <p>, or whitespace text nodes
    while (nextSibling) {
      // If it's a text node with only whitespace, remove it
      if (nextSibling.nodeType === Node.TEXT_NODE && /^\s*$/.test(nextSibling.textContent)) {
        const toRemove = nextSibling;
        nextSibling = nextSibling.nextSibling;
        toRemove.remove();
        continue;
      }

      // If it's a <br> tag, remove it
      if (nextSibling.nodeType === Node.ELEMENT_NODE && nextSibling.tagName === 'BR') {
        const toRemove = nextSibling;
        nextSibling = nextSibling.nextSibling;
        toRemove.remove();
        continue;
      }

      // If it's an empty <p> tag (completely empty or just whitespace), remove it
      if (
        nextSibling.nodeType === Node.ELEMENT_NODE &&
        nextSibling.tagName === 'P' &&
        nextSibling.textContent.trim() === ''
      ) {
        const toRemove = nextSibling;
        nextSibling = nextSibling.nextSibling;
        toRemove.remove();
        continue;
      }

      // Stop at the first non-whitespace, non-br, non-empty-p element
      break;
    }
  });
}
