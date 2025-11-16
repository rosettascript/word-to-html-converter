/**
 * Key Takeaways Feature (Shopify Blogs Mode)
 * Processes "Key Takeaways" sections: removes <em> tags, normalizes headings
 */

/**
 * Process all "Key Takeaways" sections
 * @param {HTMLElement} root - Root element to process
 */
export function processKeyTakeaways(root) {
  const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  headings.forEach(heading => {
    const headingText = heading.textContent.trim().toLowerCase();
    
    // Check if heading is "Key Takeaways" (case-insensitive)
    if (headingText === 'key takeaways' || headingText === 'key takeaways:') {
      // Remove <em> tags from the heading (preserve <strong> and other tags)
      const emTagsInHeading = heading.querySelectorAll('em');
      emTagsInHeading.forEach(em => {
        const textNode = document.createTextNode(em.textContent);
        em.parentNode.replaceChild(textNode, em);
      });
      
      // Ensure heading ends with colon (preserve existing structure)
      if (!heading.textContent.trim().endsWith(':')) {
        // Find the last text node and append colon to it
        const lastTextNode = findLastTextNode(heading);
        if (lastTextNode) {
          lastTextNode.textContent = lastTextNode.textContent + ':';
        } else {
          // Fallback: append text node with colon
          heading.appendChild(document.createTextNode(':'));
        }
      }
      
      // Find the section following this heading (until next heading of same or higher level)
      const section = findSectionContent(heading);
      
      // Remove <em> tags within the section
      section.forEach(element => {
        const emTags = element.querySelectorAll('em');
        emTags.forEach(em => {
          // Replace <em> with its text content
          const textNode = document.createTextNode(em.textContent);
          em.parentNode.replaceChild(textNode, em);
        });
      });
    }
  });
}

/**
 * Find the last text node in an element
 * @param {HTMLElement} element 
 * @returns {Text|null}
 */
function findLastTextNode(element) {
  let lastText = null;
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    if (node.textContent.trim()) {
      lastText = node;
    }
  }
  
  return lastText;
}

/**
 * Find all elements in a section (until next heading of same or higher level)
 * @param {HTMLElement} heading - The section heading
 * @returns {Array<HTMLElement>} - Array of elements in the section
 */
function findSectionContent(heading) {
  const headingLevel = parseInt(heading.tagName.substring(1));
  const sectionElements = [];
  
  let sibling = heading.nextElementSibling;
  
  while (sibling) {
    // Stop if we encounter a heading of same or higher level
    if (/^H[1-6]$/.test(sibling.tagName)) {
      const siblingLevel = parseInt(sibling.tagName.substring(1));
      if (siblingLevel <= headingLevel) {
        break;
      }
    }
    
    sectionElements.push(sibling);
    sibling = sibling.nextElementSibling;
  }
  
  return sectionElements;
}


