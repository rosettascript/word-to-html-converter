/**
 * List Combiner Feature
 * Combines consecutive lists of the same type
 */

/**
 * Combine adjacent lists based on mode rules
 * @param {HTMLElement} root - Root element to process
 * @param {string} mode - 'regular', 'shopify-blogs', or 'shopify-shoppables'
 */
export function combineLists(root, mode) {
  const listPairs = [];
  
  // Find all consecutive list pairs
  root.querySelectorAll('ul, ol').forEach(list => {
    let nextSibling = list.nextSibling;
    let foundSeparator = null;
    
    // Skip whitespace and acceptable separators
    while (nextSibling) {
      if (nextSibling.nodeType === Node.TEXT_NODE && /^\s*$/.test(nextSibling.textContent)) {
        // Whitespace-only text node - acceptable
        nextSibling = nextSibling.nextSibling;
        continue;
      }
      
      if (nextSibling.nodeType === Node.ELEMENT_NODE) {
        const tagName = nextSibling.tagName.toLowerCase();
        
        // Empty paragraph - acceptable
        if (tagName === 'p' && nextSibling.innerHTML.trim() === '') {
          foundSeparator = nextSibling;
          nextSibling = nextSibling.nextSibling;
          continue;
        }
        
        // Spacer paragraph - mode-dependent
        if (tagName === 'p' && nextSibling.innerHTML.trim() === '&nbsp;') {
          if (mode === 'shopify-shoppables') {
            foundSeparator = nextSibling;
            nextSibling = nextSibling.nextSibling;
            continue;
          } else {
            // In Blogs/Regular mode, preserve spacer (don't combine)
            break;
          }
        }
        
        // Check if next element is a list of the same type
        if (tagName === list.tagName.toLowerCase()) {
          listPairs.push({
            first: list,
            second: nextSibling,
            separator: foundSeparator
          });
        }
        
        break;
      }
      
      break;
    }
  });
  
  // Combine list pairs (in reverse to avoid DOM mutation issues)
  listPairs.reverse().forEach(({ first, second, separator }) => {
    // Move all <li> elements from second list to first list
    while (second.firstChild) {
      first.appendChild(second.firstChild);
    }
    
    // Remove separator if present
    if (separator) {
      separator.remove();
    }
    
    // Remove second list
    second.remove();
  });
}


