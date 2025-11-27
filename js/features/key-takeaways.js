/**
 * Key Takeaways Feature (Shopify Blogs Mode)
 * Processes "Key Takeaways" sections: removes <em> tags, normalizes headings
 */

/**
 * Process all "Key Takeaways" sections
 * This feature is ONLY for Shopify Blogs mode - it should not run in other modes
 * @param {HTMLElement} root - Root element to process
 * @param {string} mode - Processing mode (must be 'shopify-blogs')
 */
export function processKeyTakeaways(root, mode = 'shopify-blogs') {
  // Safety guard: Only process in Shopify Blogs mode
  if (mode !== 'shopify-blogs') {
    return; // Do not process in non-Blogs modes
  }
  const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');

  headings.forEach(heading => {
    const headingText = heading.textContent.trim().toLowerCase();
    // Remove trailing colon for comparison
    const normalizedHeading = headingText.replace(/:\s*$/, '');

    // Check if heading is a summary/takeaways section using general patterns
    // Match variations: "key takeaways", "key points", "main points", "summary", "highlights", etc.
    // Use structural detection: heading followed by a list indicates a takeaways section
    const isSummarySection = 
      normalizedHeading === 'key takeaways' ||
      normalizedHeading === 'key points' ||
      normalizedHeading === 'main points' ||
      normalizedHeading === 'summary' ||
      normalizedHeading === 'highlights' ||
      normalizedHeading === 'takeaways' ||
      normalizedHeading === 'points to remember' ||
      normalizedHeading === 'important points' ||
      /^(key|main|important)\s+(takeaways?|points?|highlights?)$/i.test(normalizedHeading) ||
      /^summary\s*(of|points?)?$/i.test(normalizedHeading);

    // Also check if it's followed by a list (structural indicator)
    // If a heading is followed by a list, it's likely a summary/takeaways section
    // This is a structural pattern that works regardless of the exact wording
    let nextElement = heading.nextElementSibling;
    const hasListAfter = nextElement && (nextElement.tagName === 'UL' || nextElement.tagName === 'OL');
    
    // More specific: only treat as Key Takeaways if heading explicitly matches summary patterns
    // AND has a list after it. Don't use broad keyword matching to avoid false positives
    // This prevents removing <em> tags from regular sections that happen to have lists
    const hasExplicitSummaryKeywords = /^(key\s+(takeaways?|points?)|main\s+points?|important\s+points?|summary|highlights?|takeaways?|points?\s+to\s+remember)$/i.test(normalizedHeading);

    // Only process if it's explicitly a Key Takeaways section (exact match or explicit pattern)
    // OR if it has explicit summary keywords AND a list immediately after
    // This prevents false positives on regular sections
    if (isSummarySection || (hasListAfter && hasExplicitSummaryKeywords)) {
      // Remove <em> tags from the heading (preserve <strong> and other tags)
      // Use a document fragment to preserve nested formatting (like <strong> inside <em>)
      const emTagsInHeading = heading.querySelectorAll('em');
      emTagsInHeading.forEach(em => {
        // Move all children out of <em> before removing it (preserves <strong> and other nested tags)
        const fragment = document.createDocumentFragment();
        while (em.firstChild) {
          fragment.appendChild(em.firstChild);
        }
        // Replace <em> with its children (preserving all nested formatting)
        em.parentNode.replaceChild(fragment, em);
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

      // Remove <em> tags only from list items within the section
      // Preserve formatting in paragraphs and other elements
      section.forEach(element => {
        // Only process list items (ul, ol) - don't remove formatting from paragraphs
        if (element.tagName === 'UL' || element.tagName === 'OL') {
          const listItems = element.querySelectorAll('li');
          listItems.forEach(li => {
            const emTags = li.querySelectorAll('em');
            emTags.forEach(em => {
              // Move all children out of <em> before removing it (preserves <strong> and other nested tags)
              // This ensures nested formatting like <strong> inside <em> is preserved
              const fragment = document.createDocumentFragment();
              while (em.firstChild) {
                fragment.appendChild(em.firstChild);
              }
              // Replace <em> with its children (preserving all nested formatting)
              em.parentNode.replaceChild(fragment, em);
            });
          });
        }
        // Don't remove <em> or <strong> from paragraphs or other elements
        // This preserves formatting in regular content
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
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);

  let node;
  while ((node = walker.nextNode())) {
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
