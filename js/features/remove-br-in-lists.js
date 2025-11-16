/**
 * Remove BR in Lists
 * Removes <br> tags inside list items as they create invalid HTML
 */

/**
 * Remove all <br> tags inside list items
 * @param {HTMLElement} root - Root element to process
 */
export function removeBrInLists(root) {
  // Find all list items (li elements)
  const listItems = root.querySelectorAll('li');
  
  listItems.forEach(li => {
    // Find all <br> tags inside this list item
    const brTags = li.querySelectorAll('br');
    
    // Remove each <br> tag
    brTags.forEach(br => {
      br.remove();
    });
  });
}

