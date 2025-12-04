/**
 * Add Paragraph Spacers
 * Adds <p>&nbsp;</p> spacers before headers and in specific sections
 */

import { isSpacerParagraph } from '../utils/validation.js';
import { setSafeHTML } from '../utils/safe-html.js';

// Cache for Key Takeaways section info to avoid repeated DOM queries
let keyTakeawaysCache = null;

/**
 * Get Key Takeaways section information (cached)
 * @param {HTMLElement} root - Root element to search in
 * @returns {Object|null} - Object with heading, level, and endElement, or null if not found
 */
function getKeyTakeawaysInfo(root) {
  // Return cached result if available and root matches
  if (keyTakeawaysCache && keyTakeawaysCache.root === root) {
    return keyTakeawaysCache.info;
  }

  // Find the Key Takeaways heading
  const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');

  let keyTakeawaysHeading = null;
  let keyTakeawaysLevel = null;
  let endElement = null;

  // Find Key Takeaways heading (or similar summary sections)
  headings.forEach(heading => {
    const text = heading.textContent.trim().toLowerCase();
    const normalizedText = text.replace(/:\s*$/, '');
    
    // Match summary/takeaways sections more generally
    const isSummarySection = 
      normalizedText.includes('key takeaway') ||
      normalizedText.includes('key point') ||
      normalizedText.includes('main point') ||
      normalizedText === 'summary' ||
      normalizedText === 'highlights' ||
      normalizedText === 'takeaways' ||
      /^(key|main|important)\s+(takeaways?|points?|highlights?)$/i.test(normalizedText);
    
    if (isSummarySection) {
      keyTakeawaysHeading = heading;
      keyTakeawaysLevel = parseInt(heading.tagName.substring(1));
    }
  });

  if (!keyTakeawaysHeading) {
    keyTakeawaysCache = { root, info: null };
    return null;
  }

  // Find the end of the Key Takeaways section (next heading of same or higher level)
  let current = keyTakeawaysHeading.nextElementSibling;
  while (current) {
    if (/^H[1-6]$/.test(current.tagName)) {
      const currentLevel = parseInt(current.tagName.substring(1));
      if (currentLevel <= keyTakeawaysLevel) {
        endElement = current;
        break;
      }
    }
    current = current.nextElementSibling;
  }

  const info = {
    heading: keyTakeawaysHeading,
    level: keyTakeawaysLevel,
    endElement,
  };

  // Cache the result
  keyTakeawaysCache = { root, info };

  return info;
}

/**
 * Clear the Key Takeaways cache
 * Useful when DOM structure changes
 */
export function clearKeyTakeawaysCache() {
  keyTakeawaysCache = null;
}

/**
 * Add paragraph spacers to improve readability
 * This feature is ONLY for Shopify Blogs mode - it should not run in other modes
 * @param {HTMLElement} root - Root element to process
 * @param {string} mode - Processing mode (must be 'shopify-blogs')
 */
export function addParagraphSpacers(root, mode = 'shopify-blogs') {
  // Safety guard: Only process in Shopify Blogs mode
  if (mode !== 'shopify-blogs') {
    return; // Do not process in non-Blogs modes
  }

  // Clear cache at start of processing to ensure fresh data
  clearKeyTakeawaysCache();

  // 1. Add spacers before every header (except in Key Takeaways section)
  addSpacersBeforeHeaders(root);

  // 2. Add spacer after the list in Key Takeaways section
  addSpacerAfterKeyTakeawaysList(root);

  // 3. Add spacer before Read Also/Read More sections
  addSpacerBeforeReadSections(root);

  // 4. Add spacer before Alt Image Text paragraphs
  addSpacerBeforeAltImageText(root);

  // 5. Remove spacer between FAQ h2 and first h3 question
  removeSpacerAfterFAQHeader(root);

  // 6. Cleanup: Remove any spacers that appear after headers (structural check)
  // Headers should never have spacers after them - they should be followed by content
  removeSpacersAfterHeaders(root);
}

/**
 * Add spacers before all headers except those in Key Takeaways section
 * @param {HTMLElement} root - Root element to process
 */
function addSpacersBeforeHeaders(root) {
  const headers = root.querySelectorAll('h1, h2, h3, h4, h5, h6');

  headers.forEach((header, index) => {
    // Check if header IS a summary/takeaways heading
    const headerText = header.textContent.trim().toLowerCase();
    const normalizedHeaderText = headerText.replace(/:\s*$/, '');
    const isSummaryHeading = 
      normalizedHeaderText.includes('key takeaway') ||
      normalizedHeaderText.includes('key point') ||
      normalizedHeaderText.includes('main point') ||
      normalizedHeaderText === 'summary' ||
      normalizedHeaderText === 'highlights' ||
      normalizedHeaderText === 'takeaways' ||
      /^(key|main|important)\s+(takeaways?|points?|highlights?)$/i.test(normalizedHeaderText);

    if (isSummaryHeading) {
      return; // Skip summary/takeaways headings
    }

    // Check if header is in Key Takeaways section
    const inKeyTakeaways = isInKeyTakeawaysSection(header);
    
    if (inKeyTakeaways) {
      return; // Skip headers in Key Takeaways section
    }

    // Structural check: Skip if previous sibling is a header (headers shouldn't have spacers between them)
    const prevSibling = header.previousElementSibling;
    if (prevSibling && /^H[1-6]$/.test(prevSibling.tagName)) {
      return; // Don't add spacer between consecutive headers
    }

    // Check if there's already a spacer before this header
    const hasSpacerBefore = isSpacerParagraph(prevSibling);

    if (hasSpacerBefore) {
      return; // Already has spacer
    }

    // Create and insert spacer
    const spacer = document.createElement('p');
    setSafeHTML(spacer, '&nbsp;');
    header.parentNode.insertBefore(spacer, header);
  });
}

/**
 * Add spacer after the list in Key Takeaways section
 * @param {HTMLElement} root - Root element to process
 */
function addSpacerAfterKeyTakeawaysList(root) {
  const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');

  headings.forEach(heading => {
    const headingText = heading.textContent.trim().toLowerCase();
    const normalizedHeadingText = headingText.replace(/:\s*$/, '');
    const isSummarySection = 
      normalizedHeadingText.includes('key takeaway') ||
      normalizedHeadingText.includes('key point') ||
      normalizedHeadingText.includes('main point') ||
      normalizedHeadingText === 'summary' ||
      normalizedHeadingText === 'highlights' ||
      normalizedHeadingText === 'takeaways' ||
      /^(key|main|important)\s+(takeaways?|points?|highlights?)$/i.test(normalizedHeadingText);
    
    if (isSummarySection) {
      // Find the next list (ul or ol) after this heading
      let nextElement = heading.nextElementSibling;
      while (nextElement) {
        if (nextElement.tagName === 'UL' || nextElement.tagName === 'OL') {
          // Check if there's already a spacer after the list
          const nextSibling = nextElement.nextElementSibling;
          if (isSpacerParagraph(nextSibling)) {
            return; // Already has spacer
          }

          // Create and insert spacer after the list
          const spacer = document.createElement('p');
          setSafeHTML(spacer, '&nbsp;');
          nextElement.parentNode.insertBefore(spacer, nextElement.nextSibling);
          break;
        }

        // Stop if we hit another heading
        if (/^H[1-6]$/.test(nextElement.tagName)) {
          break;
        }

        nextElement = nextElement.nextElementSibling;
      }
    }
  });
}

/**
 * Add spacer before Read Also/Read More sections
 * @param {HTMLElement} root - Root element to process
 */
function addSpacerBeforeReadSections(root) {
  // Check both headings (h1-h6) and paragraphs with strong tags
  const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const paragraphs = root.querySelectorAll('p');

  // Process headings
  headings.forEach(heading => {
    const headingText = heading.textContent.trim().toLowerCase();

    // Match related content sections more generally
    // Pattern: phrases indicating related/additional content, typically ending with colon
    const normalizedHeadingText = headingText.replace(/:\s*$/, '');
    const isReadSection =
      /^(read\s+(also|more)|related\s+(articles?|posts?|content|topics?|resources?|links?|information)|see\s+also|further\s+reading|additional\s+(resources?|information|reading|links?)|more\s+(information|resources?|reading)|explore\s+(more|further)|continue\s+reading|you\s+may\s+(also\s+)?(like|enjoy|find\s+interesting))$/i.test(normalizedHeadingText) ||
      /^(related|additional|more|further|explore)\s+(content|resources?|information|reading|links?|topics?)/i.test(normalizedHeadingText);

    if (isReadSection) {
      addSpacerBeforeElement(heading);
    }
  });

  // Process paragraphs (e.g., <p><strong>Read also:</strong></p>)
  paragraphs.forEach(paragraph => {
    const paragraphText = paragraph.textContent.trim().toLowerCase();

    // Match related content sections more generally (same pattern as headings)
    const normalizedParagraphText = paragraphText.replace(/:\s*$/, '');
    const isReadSection =
      /^(read\s+(also|more)|related\s+(articles?|posts?|content|topics?|resources?|links?|information)|see\s+also|further\s+reading|additional\s+(resources?|information|reading|links?)|more\s+(information|resources?|reading)|explore\s+(more|further)|continue\s+reading|you\s+may\s+(also\s+)?(like|enjoy|find\s+interesting))$/i.test(normalizedParagraphText) ||
      /^(related|additional|more|further|explore)\s+(content|resources?|information|reading|links?|topics?)/i.test(normalizedParagraphText);

    if (isReadSection) {
      addSpacerBeforeElement(paragraph);
    }
  });
}

/**
 * Add spacer before Alt Image Text paragraphs
 * Handles various case formats: "Alt Image Text:", "Alt image text:", etc.
 * @param {HTMLElement} root - Root element to process
 */
function addSpacerBeforeAltImageText(root) {
  const paragraphs = root.querySelectorAll('p');

  paragraphs.forEach(paragraph => {
    const paragraphText = paragraph.textContent.trim();

    // Match "Alt image text:" or "Alt Image Text:" (case-insensitive)
    // Pattern: starts with "alt" + whitespace + "image" + whitespace + "text" + optional ":"
    if (/^alt\s+image\s+text\s*:/i.test(paragraphText)) {
      addSpacerBeforeElement(paragraph);
    }
  });
}

/**
 * Add spacer before an element if it doesn't already have one
 * @param {HTMLElement} element - Element to add spacer before
 */
function addSpacerBeforeElement(element) {
  // Structural check: Skip if previous sibling is a header (headers shouldn't have spacers between them)
  const prevSibling = element.previousElementSibling;
  if (prevSibling && /^H[1-6]$/.test(prevSibling.tagName)) {
    return; // Don't add spacer between consecutive headers
  }

  // Check if there's already a spacer before this element
  if (isSpacerParagraph(prevSibling)) {
    return; // Already has spacer
  }

  // Create and insert spacer
  const spacer = document.createElement('p');
  setSafeHTML(spacer, '&nbsp;');
  element.parentNode.insertBefore(spacer, element);
}

/**
 * Remove spacer between FAQ h2 header and first h3 question
 * @param {HTMLElement} root - Root element to process
 */
function removeSpacerAfterFAQHeader(root) {
  const h2Headers = root.querySelectorAll('h2');

  h2Headers.forEach(h2 => {
    const text = h2.textContent.toLowerCase();
    const normalizedText = text.replace(/:\s*$/, '');
    
    // Match FAQ sections MORE STRICTLY - use regex patterns at start of text
    // Avoid broad .includes() that match regular words like "help" or "questions"
    const isFAQSection = 
      /^(faq|frequently\s+asked\s+questions?|questions?\s+and\s+answers?|q\s*&\s*a|q\s+and\s+a|common\s+questions?|help\s+(center|desk|section))$/i.test(normalizedText);
    
    if (isFAQSection) {
      // Find next sibling that's a spacer followed by h3
      let nextElement = h2.nextElementSibling;

      while (nextElement) {
        // If we find a spacer
        if (isSpacerParagraph(nextElement)) {
          // Check if the next element after spacer is a heading (any level)
          const afterSpacer = nextElement.nextElementSibling;
          if (afterSpacer && /^H[1-6]$/.test(afterSpacer.tagName)) {
            // Remove the spacer - FAQ questions can be any heading level
            nextElement.remove();
            break;
          }
        }

        // Stop if we hit any heading (not just h1-h3)
        if (nextElement.tagName && /^H[1-6]$/.test(nextElement.tagName)) {
          break;
        }

        nextElement = nextElement.nextElementSibling;
      }
    }
  });
}

/**
 * Check if element is within Key Takeaways section (using cached info)
 * @param {HTMLElement} element - Element to check
 * @returns {boolean}
 */
function isInKeyTakeawaysSection(element) {
  const root = element.ownerDocument.body || element.ownerDocument.documentElement;
  const info = getKeyTakeawaysInfo(root);

  if (!info) {
    return false;
  }

  // Simple range check: element must be after heading and before endElement
  let current = info.heading.nextElementSibling;
  while (current) {
    // If we reached the element, it's in Key Takeaways section
    if (current === element) {
      return true;
    }

    // If we hit the end element or a heading of same or higher level, stop
    if (current === info.endElement) {
      return false;
    }

    if (/^H[1-6]$/.test(current.tagName)) {
      const currentLevel = parseInt(current.tagName.substring(1));
      if (currentLevel <= info.level) {
        return false; // We've left the Key Takeaways section
      }
    }

    current = current.nextElementSibling;
  }

  return false;
}

/**
 * Remove any spacers that appear after headers (structural cleanup)
 * Headers should never have spacers after them - they should be followed by content
 * This is a structural check, not keyword-based, so it's consistent
 * @param {HTMLElement} root - Root element to process
 */
function removeSpacersAfterHeaders(root) {
  const headers = root.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  headers.forEach(header => {
    let nextSibling = header.nextElementSibling;
    
    // Remove any spacers immediately after the header
    while (nextSibling && isSpacerParagraph(nextSibling)) {
      const toRemove = nextSibling;
      nextSibling = nextSibling.nextElementSibling;
      toRemove.remove();
    }
  });
}
