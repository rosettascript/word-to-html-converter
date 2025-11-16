/**
 * Fix Orphaned List Items
 * Detects content immediately after a list that looks like it should be a list item
 * VERY CONSERVATIVE: Only checks immediate next sibling, strict criteria
 */

/**
 * Fix orphaned list items (content that should be in the list but is outside)
 * @param {HTMLElement} root - Root element to process
 */
export function fixOrphanedListItems(root) {
  const lists = root.querySelectorAll('ul, ol');
  
  lists.forEach(list => {
    // Only check the IMMEDIATE next sibling (not 2nd, 3rd, etc.)
    let nextSibling = list.nextElementSibling;
    
    // If no next sibling or it's not em/p, skip
    if (!nextSibling || (nextSibling.tagName !== 'EM' && nextSibling.tagName !== 'P')) {
      return;
    }
    
    // Collect elements that should be grouped together (em + link, etc.)
    const orphanGroup = [nextSibling];
    
    // Check the next 1-2 siblings for related content (like a link right after em)
    let checkNext = nextSibling.nextElementSibling;
    let checked = 0;
    while (checkNext && checked < 2) {
      // If it's a link or another em/p, it might belong to the orphan
      if (checkNext.tagName === 'A' || checkNext.tagName === 'EM' || checkNext.tagName === 'P') {
        orphanGroup.push(checkNext);
        checkNext = checkNext.nextElementSibling;
        checked++;
      } else {
        break; // Stop if we hit something else
      }
    }
    
    // STRICT CRITERIA: Only consider it orphaned if it matches list item patterns
    if (looksLikeOrphanedListItem(list, orphanGroup)) {
      // Create a new list item
      const li = document.createElement('li');
      
      // Clone each orphan element with all its content and append to the new <li>
      orphanGroup.forEach(orphan => {
        li.appendChild(orphan.cloneNode(true));
      });
      
      // Add the new list item to the list
      list.appendChild(li);
      
      // Remove the original orphan elements
      orphanGroup.forEach(orphan => orphan.remove());
    }
  });
}

/**
 * Check if a group of elements looks like an orphaned list item
 * @param {HTMLElement} list - The list element
 * @param {HTMLElement[]} orphanGroup - Array of potential orphan elements
 * @returns {boolean}
 */
function looksLikeOrphanedListItem(list, orphanGroup) {
  // Combine text from all elements in the group
  const text = orphanGroup.map(el => el.textContent).join(' ').trim();
  
  // Must have some content
  if (!text) {
    return false;
  }
  
  // Check if any element in the group has a link
  const hasLink = orphanGroup.some(el => el.tagName === 'A' || el.querySelector('a'));
  
  // Check if any element in the group has italics
  const hasItalics = orphanGroup.some(el => el.tagName === 'EM' || el.querySelector('em'));
  
  // Check if list items have similar structure (e.g., all contain links)
  const listItems = Array.from(list.querySelectorAll('li'));
  const mostItemsHaveLinks = listItems.filter(li => li.querySelector('a')).length > listItems.length / 2;
  
  // If most list items have links, orphan should too
  if (mostItemsHaveLinks && !hasLink) {
    return false;
  }
  
  // For OL (numbered lists), check if it looks like a citation/reference
  // Common patterns: starts with author name, year, publication
  if (list.tagName === 'OL') {
    // Check if it looks like a citation (has italics + link, or just italics with structured text)
    const looksLikeCitation = /^[A-Z][a-zA-Z\s,\.]+\(\d{4}/.test(text); // Name (Year
    
    if (hasItalics && (hasLink || looksLikeCitation)) {
      return true; // Likely an orphaned citation
    }
  }
  
  // For UL (bullet lists), be more conservative
  // Only if it has a link (like other list items) or starts with bold text
  if (list.tagName === 'UL') {
    const hasStrong = orphanGroup.some(el => el.tagName === 'STRONG' || el.querySelector('strong'));
    
    if (hasLink || hasStrong) {
      return true;
    }
  }
  
  // Default: don't assume it's orphaned
  return false;
}

