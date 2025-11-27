/**
 * Convert Sequential Ordered Lists to Numbered Headings
 * For Shopify Blogs/Shoppables: Converts sequential single-item <ol> tags
 * to manually numbered headings (e.g., <h3>1. Item Name</h3>)
 */

/**
 * Group content nodes into paragraphs based on natural boundaries
 * Detects sentence endings, structural markers, and whitespace gaps
 * @param {Node[]} nodes - Array of DOM nodes to group
 * @returns {Node[][]} - Array of node arrays, each representing a paragraph
 */
function groupContentIntoParagraphs(nodes) {
  const paragraphs = [];
  let currentParagraph = [];
  
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const prevNode = i > 0 ? nodes[i - 1] : null;
    const nextNode = i < nodes.length - 1 ? nodes[i + 1] : null;
    
    // Check if this is a natural paragraph break point
    const isParagraphBreak = shouldCreateNewParagraph(node, prevNode, nextNode, currentParagraph);
    
    if (isParagraphBreak && currentParagraph.length > 0) {
      // Save current paragraph and start new one
      paragraphs.push(currentParagraph);
      currentParagraph = [node];
    } else {
      currentParagraph.push(node);
    }
  }
  
  // Add final paragraph if it has content
  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph);
  }
  
  return paragraphs;
}

/**
 * Determine if a new paragraph should be created at this node
 * @param {Node} node - Current node being processed
 * @param {Node|null} prevNode - Previous node
 * @param {Node|null} nextNode - Next node
 * @param {Node[]} currentParagraph - Current paragraph being built
 * @returns {boolean} - True if a new paragraph should start here
 */
function shouldCreateNewParagraph(node, prevNode, nextNode, currentParagraph) {
  // If previous node ends with sentence punctuation and whitespace
  if (prevNode && prevNode.nodeType === Node.TEXT_NODE) {
    const prevText = prevNode.textContent.trim();
    // Check if text ends with sentence-ending punctuation
    if (/[.!?]\s*$/.test(prevText)) {
      // Check if current node suggests a new paragraph
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Elements like <em> often indicate new semantic blocks (alt text, captions, etc.)
        if (['EM', 'STRONG'].includes(node.tagName)) {
          return true;
        }
      }
      // If there's significant whitespace after punctuation, it might be a break
      const trailingWhitespace = prevNode.textContent.match(/\s+$/);
      if (trailingWhitespace && trailingWhitespace[0].length > 1) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          return true;
        }
      }
    }
  }
  
  // If there's significant whitespace before this node
  if (prevNode && prevNode.nodeType === Node.TEXT_NODE) {
    const whitespace = prevNode.textContent.match(/\s+$/);
    if (whitespace && whitespace[0].length > 1) {
      // Multiple spaces or newlines suggest a break
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Check if it's a structural element that suggests a new paragraph
        if (['EM', 'STRONG', 'A'].includes(node.tagName)) {
          // Only create break if current paragraph has meaningful content
          const hasContent = currentParagraph.some(n => {
            if (n.nodeType === Node.TEXT_NODE) {
              return n.textContent.trim().length > 0;
            }
            return true;
          });
          if (hasContent) {
            return true;
          }
        }
      }
    }
  }
  
  // Check if current node is an <em> or <strong> that starts a new semantic block
  // This handles cases like alt image text, captions, etc.
  if (node.nodeType === Node.ELEMENT_NODE && ['EM', 'STRONG'].includes(node.tagName)) {
    // Check if previous content ends with sentence punctuation
    if (currentParagraph.length > 0) {
      const lastNode = currentParagraph[currentParagraph.length - 1];
      if (lastNode && lastNode.nodeType === Node.TEXT_NODE) {
        const lastText = lastNode.textContent.trim();
        if (/[.!?]\s*$/.test(lastText)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Convert sequential single-item ordered lists to numbered headings
 * @param {HTMLElement} root - Root element to process
 */
export function convertListsToNumberedHeadings(root) {
  const orderedLists = Array.from(root.querySelectorAll('ol'));

  if (orderedLists.length === 0) return;

  // Track processed lists to avoid processing them again
  const processed = new Set();
  
  // Track how many numbered headings we've created so far
  // This ensures standalone lists get the correct number even after sequences are removed
  let globalNumberCounter = 0;

  let i = 0;
  while (i < orderedLists.length) {
    const currentList = orderedLists[i];

    // Skip if already processed
    if (processed.has(currentList)) {
      i++;
      continue;
    }

    let listItems = currentList.querySelectorAll(':scope > li');
    
    // Handle special case: list with 2 items where first has h3 and second has content
    // This happens when Word splits a list item into two (e.g., heading in first li, content in second)
    if (listItems.length === 2) {
      const firstLi = listItems[0];
      const secondLi = listItems[1];
      const heading = firstLi.querySelector('h3');
      
      // Check if first li contains only h3 (and possibly whitespace/spacers)
      // After fixParagraphsInLists, <p>&nbsp;</p> becomes just &nbsp; text node
      if (heading) {
        // Get all non-heading content from first li
        const firstLiClone = firstLi.cloneNode(true);
        const headingClone = firstLiClone.querySelector('h3');
        if (headingClone) {
          headingClone.remove();
        }
        const remainingText = firstLiClone.textContent.trim().replace(/[\u00A0\s]+/g, ' '); // \u00A0 is &nbsp;
        
        // If first li only has heading + whitespace/spacers, combine with second li
        if (remainingText === '' || remainingText === '\u00A0' || remainingText === '&nbsp;') {
          // Move heading to start of second li
          secondLi.insertBefore(heading, secondLi.firstChild);
          // Remove first li (now empty or just whitespace)
          firstLi.remove();
          // Re-query list items after DOM modification
          listItems = currentList.querySelectorAll(':scope > li');
          // Now we should have a single-item list - continue processing below
        } else {
          // First li has content other than heading, skip this list
          i++;
          continue;
        }
      } else {
        // No heading in first li, skip this list
        i++;
        continue;
      }
    }
    
    // Only process lists with exactly 1 list item
    if (listItems.length !== 1) {
      i++;
      continue;
    }

    // Clean up spacer paragraphs inside the list item before processing
    const li = listItems[0];
    const spacerPs = Array.from(li.querySelectorAll('p')).filter(
      p => {
        const text = p.textContent.trim();
        const html = p.innerHTML.trim();
        return text === '' || html === '&nbsp;' || text === '\u00A0' || html === '<br>';
      }
    );
    spacerPs.forEach(p => p.remove());

    // Check if this list item has an h3 heading
    const listHasHeading = li.querySelector('h3');
    if (!listHasHeading) {
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

      // Check if this list has an h3 heading
      const h3 = items[0].querySelector('h3');
      if (!h3) break; // Stop sequence if list doesn't have h3

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

    // Process if we found a sequence of at least 2 single-item lists
    // OR if it's a single list with an h3 heading (standalone numbered item)
    if (sequence.length >= 2 || (sequence.length === 1 && listHasHeading)) {
      // Mark all lists in sequence as processed
      sequence.forEach(list => processed.add(list));

      // Process each list in the sequence
      sequence.forEach((list, index) => {
        const li = list.querySelector('li');
        const heading = li.querySelector('h3');

        if (heading) {
          // Add number to the heading text
          // For sequences, use the index in the sequence plus the global counter
          // For standalone lists, use the global counter + 1
          let number;
          if (sequence.length === 1) {
            // Standalone list - use global counter + 1
            number = globalNumberCounter + 1;
            globalNumberCounter++;
          } else {
            // Part of a sequence - use sequence index + global counter + 1
            number = globalNumberCounter + index + 1;
          }
          
          const headingText = heading.textContent.trim();
          heading.textContent = `${number}. ${headingText}`;

          // Separate heading from other content
          // Get all nodes from the list item
          const allNodes = Array.from(li.childNodes);
          
          // Find the heading node
          const headingNode = allNodes.find(node => 
            node.nodeType === Node.ELEMENT_NODE && node.tagName === 'H3'
          );
          
          // Get all content after the heading (text nodes, inline elements, etc.)
          const contentAfterHeading = [];
          let foundHeading = false;
          
          for (const node of allNodes) {
            if (node === headingNode) {
              foundHeading = true;
              continue;
            }
            if (foundHeading) {
              contentAfterHeading.push(node);
            }
          }

          // Insert the heading first
          if (headingNode) {
            list.parentNode.insertBefore(headingNode.cloneNode(true), list);
          }

          // Group content into paragraphs based on natural boundaries
          if (contentAfterHeading.length > 0) {
            // Check if content is only whitespace
            const hasNonWhitespace = contentAfterHeading.some(node => {
              if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent.trim() !== '';
              }
              return true; // Any element node is non-whitespace
            });

            if (hasNonWhitespace) {
              // Group content into paragraphs based on natural boundaries
              const paragraphGroups = groupContentIntoParagraphs(contentAfterHeading);
              
              // Create a paragraph for each group
              paragraphGroups.forEach(group => {
                if (group.length > 0) {
                  const paragraph = document.createElement('p');
                  group.forEach(node => {
                    paragraph.appendChild(node.cloneNode(true));
                  });
                  list.parentNode.insertBefore(paragraph, list);
                }
              });
            }
          }

          // Insert content that came after this list (only for sequences of 2+)
          if (sequence.length >= 2) {
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
          }

          // Remove the now-empty list
          list.remove();
        }
      });
      
      // Update global counter after processing a sequence (not standalone)
      if (sequence.length >= 2) {
        globalNumberCounter += sequence.length;
      }
    }

    i++;
  }
}
