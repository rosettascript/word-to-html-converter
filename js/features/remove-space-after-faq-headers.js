/**
 * Remove Space After FAQ Headers
 * Removes <br> or empty <p> tags that appear immediately after h2 elements
 */

/**
 * Remove <br> or empty paragraphs after h2 headers
 * @param {HTMLElement} root - Root element to process
 */
export function removeSpaceAfterFAQHeaders(root) {
  const h2Tags = root.querySelectorAll('h2');
  
  h2Tags.forEach(h2 => {
    let nextSibling = h2.nextSibling;
    
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
      if (nextSibling.nodeType === Node.ELEMENT_NODE && 
          nextSibling.tagName === 'P' && 
          nextSibling.textContent.trim() === '') {
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


