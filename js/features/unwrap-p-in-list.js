/**
 * Unwrap P Tags Inside List Items
 * Removes unnecessary <p> wrappers inside <li> elements
 */

/**
 * Unwrap all <p> tags that are direct children of <li> elements
 * @param {HTMLElement} root - Root element to process
 */
export function unwrapPInList(root) {
  const listItems = root.querySelectorAll('li');
  
  listItems.forEach(li => {
    // Find all direct child <p> tags
    const pTags = Array.from(li.children).filter(child => child.tagName === 'P');
    
    pTags.forEach(p => {
      // Move all children of <p> before the <p> element
      while (p.firstChild) {
        li.insertBefore(p.firstChild, p);
      }
      // Remove the now-empty <p> tag
      p.remove();
    });
  });
}

