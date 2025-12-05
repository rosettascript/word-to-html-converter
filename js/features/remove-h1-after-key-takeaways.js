/**
 * Remove H1 After Key Takeaways
 * Removes any h1 element and its content that appears after a Key Takeaways section
 */

/**
 * Remove all h1 elements that appear after Key Takeaways sections
 * This feature is ONLY for Shopify Blogs mode - it should not run in other modes
 * @param {HTMLElement} root - Root element to process
 * @param {string} mode - Processing mode (must be 'shopify-blogs')
 */
export function removeH1AfterKeyTakeaways(root, mode = 'shopify-blogs') {
  // Safety guard: Only process in Shopify Blogs mode
  if (mode !== 'shopify-blogs') {
    return; // Do not process in non-Blogs modes
  }
  // Find all h1 elements first
  const allH1s = Array.from(root.querySelectorAll('h1'));

  // Find if there's a Key Takeaways section (in heading OR paragraph)
  const allHeadings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const allParagraphs = root.querySelectorAll('p');
  let keyTakeawaysElement = null;

  // Check headings first
  allHeadings.forEach(heading => {
    const text = heading.textContent.trim().toLowerCase();
    const normalizedText = text.replace(/:\s*$/, '');
    
    // Match summary/takeaways sections more generally
    const isSummarySection = 
      normalizedText.includes('key takeaway') ||
      normalizedText.includes('key point') ||
      normalizedText.includes('main point') ||
      normalizedText === 'summary' ||
      normalizedText === 'highlights' ||
      normalizedText === 'takeaways' ||
      /^(key|main|important)\s+(takeaways?|points?|highlights?)$/i.test(normalizedText);
    
    if (isSummarySection) {
      keyTakeawaysElement = heading;
    }
  });

  // If not found in headings, check paragraphs
  if (!keyTakeawaysElement) {
    Array.from(allParagraphs).forEach(p => {
      const text = p.textContent.trim();
      const hasStrongOrBold = p.querySelector('strong') || p.querySelector('b');
      
      // Match paragraph format: <p><strong>Key Takeaways:</strong></p>
      if (hasStrongOrBold && /^key\s+takeaways?:?$/i.test(text)) {
        keyTakeawaysElement = p;
      }
    });
  }

  // If we found a Key Takeaways section (heading or paragraph), remove all H1s that come after it
  if (keyTakeawaysElement) {
    allH1s.forEach(h1 => {
      // Check if this h1 comes after the Key Takeaways element in the DOM
      if (isAfter(h1, keyTakeawaysElement)) {
        h1.remove();
      }
    });
  }
}

/**
 * Check if element A comes after element B in the DOM
 * @param {HTMLElement} elementA
 * @param {HTMLElement} elementB
 * @returns {boolean}
 */
function isAfter(elementA, elementB) {
  const position = elementB.compareDocumentPosition(elementA);
  return (position & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}
