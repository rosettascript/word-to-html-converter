/**
 * Convert Sequential Ordered Lists to Numbered Headings
 * For Shopify Blogs/Shoppables: Converts sequential single-item <ol> tags
 * to manually numbered headings (e.g., <h3>1. Item Name</h3>)
 */

/**
 * Convert sequential single-item ordered lists to numbered headings
 * @param {HTMLElement} root - Root element to process
 */
export function convertListsToNumberedHeadings(root) {
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
    const contentAfterEach = [];
    
    let checkList = currentList;
    
    // Collect the sequence of single-item lists and content after each
    while (checkList && checkList.tagName === 'OL') {
      const items = checkList.querySelectorAll(':scope > li');
      if (items.length !== 1) break;
      
      sequence.push(checkList);
      
      // Collect content after this list until we hit another <ol> or major heading
      const contentAfter = [];
      let nextElement = checkList.nextElementSibling;
      
      while (nextElement) {
        if (nextElement.tagName === 'OL') {
          // Found next list, stop collecting
          checkList = nextElement;
          break;
        } else if (nextElement.tagName && ['H1', 'H2'].includes(nextElement.tagName)) {
          // Found a major heading - stop the sequence
          checkList = null;
          break;
        } else {
          // Collect this content element
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
    
    // Only process if we found a sequence of at least 2 single-item lists
    if (sequence.length >= 2) {
      // Process each list in the sequence
      sequence.forEach((list, index) => {
        const li = list.querySelector('li');
        const heading = li.querySelector('h3');
        
        if (heading) {
          // Add number to the heading text
          const number = index + 1;
          const headingText = heading.textContent.trim();
          heading.textContent = `${number}. ${headingText}`;
          
          // Get all content from the list item
          const listItemContent = Array.from(li.childNodes);
          
          // Insert heading and content before the list
          listItemContent.forEach(node => {
            list.parentNode.insertBefore(node.cloneNode(true), list);
          });
          
          // Insert content that came after this list
          const content = contentAfterEach[index];
          content.forEach(element => {
            list.parentNode.insertBefore(element.cloneNode(true), list);
          });
          
          // Remove the original content elements
          content.forEach(element => {
            if (element.parentNode) {
              element.remove();
            }
          });
          
          // Remove the now-empty list
          list.remove();
        }
      });
      
      // Update the orderedLists array to skip processed lists
      orderedLists.splice(i + 1, sequence.length - 1);
    }
    
    i++;
  }
}

