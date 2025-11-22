/**
 * Remove H1 After Key Takeaways
 * Removes any h1 element and its content that appears after a Key Takeaways section
 */

/**
 * Remove all h1 elements that appear after Key Takeaways sections
 * @param {HTMLElement} root - Root element to process
 */
export function removeH1AfterKeyTakeaways(root) {
  // Find all h1 elements first
  const allH1s = Array.from(root.querySelectorAll('h1'));

  // Find if there's a Key Takeaways heading
  const allHeadings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let keyTakeawaysHeading = null;

  allHeadings.forEach(heading => {
    const text = heading.textContent.trim().toLowerCase();
    if (text.includes('key takeaway')) {
      keyTakeawaysHeading = heading;
    }
  });

  // If we found a Key Takeaways heading, remove all H1s that come after it
  if (keyTakeawaysHeading) {
    allH1s.forEach(h1 => {
      // Check if this h1 comes after the Key Takeaways heading in the DOM
      if (isAfter(h1, keyTakeawaysHeading)) {
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
