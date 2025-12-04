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

  // 5. Add spacers around tables (before and after)
  addSpacersAroundTables(root);

  // 6. Remove spacer between FAQ h2 and first h3 question
  removeSpacerAfterFAQHeader(root);

  // 7. Cleanup: Remove any spacers that appear after headers (structural check)
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

    // Structural check: Skip if previous sibling is a header at same or higher level
    // We want spacers when going from parent to child (H2 -> H3), but not between siblings (H3 -> H3) or child to parent (H3 -> H2)
    const prevSibling = header.previousElementSibling;
    if (prevSibling && /^H[1-6]$/.test(prevSibling.tagName)) {
      const currentLevel = parseInt(header.tagName.substring(1)); // H3 -> 3
      const prevLevel = parseInt(prevSibling.tagName.substring(1)); // H2 -> 2
      
      // Skip spacer only if current level <= previous level (same level or going up in hierarchy)
      // e.g., H3 -> H3 (skip), H3 -> H2 (skip), but H2 -> H3 (don't skip, add spacer)
      if (currentLevel <= prevLevel) {
        return; // Don't add spacer between same-level headers or when going from child to parent
      }
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
 * Uses a scoring system to identify "Read Also" equivalent sections
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

  // Process paragraphs using scoring system
  paragraphs.forEach(paragraph => {
    const score = scoreReadAlsoSection(paragraph);
    
    // Require a minimum score of 3 to be considered a "Read Also" section
    if (score >= 3) {
      addSpacerBeforeElement(paragraph);
    }
  });
}

/**
 * Score a paragraph to determine if it's a "Read Also" equivalent section
 * Uses multiple criteria to avoid false positives
 * @param {HTMLElement} paragraph - The paragraph to score
 * @returns {number} Score (0-5+), higher = more likely to be "Read Also" section
 */
export function scoreReadAlsoSection(paragraph) {
  let score = 0;
  const paragraphText = paragraph.textContent.trim();
  const paragraphTextLower = paragraphText.toLowerCase();
  
  // Criterion 1: Contains strong/bold tag (1 point)
  const hasStrongTag = paragraph.querySelector('strong') || paragraph.querySelector('b');
  if (hasStrongTag) {
    score += 1;
  }
  
  // Criterion 2: Ends with colon (1 point)
  if (paragraphText.trim().endsWith(':')) {
    score += 1;
  }
  
  // Criterion 3: Followed by a list (ul/ol) containing links (2 points)
  // Skip over spacer paragraphs to find the actual next content element
  let nextSibling = paragraph.nextElementSibling;
  while (nextSibling && isSpacerParagraph(nextSibling)) {
    nextSibling = nextSibling.nextElementSibling;
  }
  
  if (nextSibling && (nextSibling.tagName === 'UL' || nextSibling.tagName === 'OL')) {
    const hasLinks = nextSibling.querySelectorAll('a').length > 0;
    if (hasLinks) {
      score += 2;
    }
  }
  
  // Criterion 4: Contains keywords suggesting related content (1 point)
  const keywords = [
    'read also', 'read more', 'related', 'check out', 'want to learn',
    'learn more', 'past blogs', 'further reading', 'see also',
    'additional resources', 'more information', 'explore', 'continue reading'
  ];
  
  const containsKeyword = keywords.some(keyword => paragraphTextLower.includes(keyword));
  if (containsKeyword) {
    score += 1;
  }
  
  // Criterion 5: Short text (less than 100 characters) suggests it's a label, not content (0.5 points)
  if (paragraphText.length < 100) {
    score += 0.5;
  }
  
  return score;
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
 * Add spacers around tables (before and after)
 * Skip if table is the first element or if spacers already exist
 * @param {HTMLElement} root - Root element to process
 */
function addSpacersAroundTables(root) {
  const tables = root.querySelectorAll('table');
  
  tables.forEach(table => {
    // Add spacer BEFORE table (if not first element and no spacer exists)
    const prevSibling = table.previousElementSibling;
    if (prevSibling) { // Not the first element
      if (!isSpacerParagraph(prevSibling)) {
        // No spacer exists, add one
        const spacer = document.createElement('p');
        setSafeHTML(spacer, '&nbsp;');
        table.parentNode.insertBefore(spacer, table);
      }
    }
    
    // Add spacer AFTER table (if no spacer exists)
    const nextSibling = table.nextElementSibling;
    if (nextSibling) { // Not the last element
      if (!isSpacerParagraph(nextSibling)) {
        // No spacer exists, add one
        const spacer = document.createElement('p');
        setSafeHTML(spacer, '&nbsp;');
        table.parentNode.insertBefore(spacer, nextSibling);
      }
    } else {
      // Table is the last element, add spacer after it
      const spacer = document.createElement('p');
      setSafeHTML(spacer, '&nbsp;');
      table.parentNode.appendChild(spacer);
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
    
    // Match FAQ sections at the START of text (not requiring exact end match)
    // This allows for variations like "FAQ About X" or "Frequently Asked Questions About Y"
    const isFAQSection = 
      /^(faq|frequently\s+asked\s+questions?|questions?\s+and\s+answers?|q\s*&\s*a|q\s+and\s+a|common\s+questions?)(\s|$)/i.test(normalizedText) ||
      /^(help\s+(center|desk|section))$/i.test(normalizedText);
    
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
 * Headers should never have spacers after them UNLESS followed by a child header
 * Keep spacers when: H2 -> spacer -> H3 (parent to child)
 * Remove spacers when: H2 -> spacer -> P (header to content)
 * @param {HTMLElement} root - Root element to process
 */
function removeSpacersAfterHeaders(root) {
  const headers = root.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  headers.forEach(header => {
    let nextSibling = header.nextElementSibling;
    
    // Check if there's a spacer after the header
    while (nextSibling && isSpacerParagraph(nextSibling)) {
      const spacer = nextSibling;
      const afterSpacer = nextSibling.nextElementSibling;
      
      // Check if the element after the spacer is a child header (higher level number)
      const headerLevel = parseInt(header.tagName.substring(1)); // H2 -> 2
      const isChildHeader = afterSpacer && /^H[1-6]$/.test(afterSpacer.tagName) && parseInt(afterSpacer.tagName.substring(1)) > headerLevel;
      
      // Only remove the spacer if it's NOT before a child header
      if (!isChildHeader) {
        nextSibling = spacer.nextElementSibling;
        spacer.remove();
      } else {
        // Keep the spacer, move to next sibling
        break;
      }
    }
  });
}
