/**
 * Combine Sequential Ordered Lists
 * Detects multiple single-item <ol> tags separated by content and combines them
 * into a single ordered list with content nested inside each <li>
 */

/**
 * Combine sequential single-item ordered lists
 * @param {HTMLElement} root - Root element to process
 */
export function combineSequentialOrderedLists(root) {
  const orderedLists = Array.from(root.querySelectorAll('ol'));
  
  if (orderedLists.length === 0) return;
  
  let i = 0;
  while (i < orderedLists.length) {
    const currentList = orderedLists[i];
    
    // Only process lists with exactly 1 list item
    const listItems = currentList.querySelectorAll(':scope > li');
    if (listItems.length !== 1) {
      i++;
      continue;
    }
    
    // Look for a sequence of single-item <ol> tags
    const sequence = [];
    const contentAfterEach = []; // Array of arrays - content after each list
    
    let checkList = currentList;
    
    // Collect the sequence of single-item lists and content after each
    while (checkList && checkList.tagName === 'OL') {
      const items = checkList.querySelectorAll(':scope > li');
      if (items.length !== 1) break;
      
      sequence.push(checkList);
      
      // Collect content after this list until we hit another <ol> or structural element
      const contentAfter = [];
      let nextElement = checkList.nextElementSibling;
      
      while (nextElement) {
        if (nextElement.tagName === 'OL') {
          // Found next list, stop collecting
          checkList = nextElement;
          break;
        } else if (nextElement.tagName && ['H1', 'H2'].includes(nextElement.tagName)) {
          // Found a major heading - this is a new section, not part of list item
          // Stop collecting and end the sequence
          checkList = null;
          break;
        } else {
          // Collect this content element (paragraphs, images, etc.)
          contentAfter.push(nextElement);
          nextElement = nextElement.nextElementSibling;
        }
      }
      
      contentAfterEach.push(contentAfter);
      
      // If we didn't find another OL or hit a structural element, we're done
      if (!checkList || !nextElement || nextElement.tagName !== 'OL') {
        break;
      }
    }
    
    // Only combine if we found a sequence of at least 2 single-item lists
    if (sequence.length >= 2) {
      const firstList = sequence[0];
      
      // Process each list in the sequence
      sequence.forEach((list, index) => {
        const li = list.querySelector('li');
        const content = contentAfterEach[index];
        
        // Append content after this list to this list item
        content.forEach(element => {
          li.appendChild(element.cloneNode(true));
        });
        
        if (index > 0) {
          // Move this <li> to the first list
          firstList.appendChild(li);
          
          // Remove the now-empty list
          list.remove();
        }
      });
      
      // Remove the original content elements that we've now embedded in list items
      contentAfterEach.forEach(content => {
        content.forEach(element => {
          if (element.parentNode) {
            element.remove();
          }
        });
      });
      
      // Update the orderedLists array to skip processed lists
      orderedLists.splice(i + 1, sequence.length - 1);
    }
    
    i++;
  }
}

