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

  // Find Key Takeaways heading
  headings.forEach(heading => {
    const text = heading.textContent.trim().toLowerCase();
    if (text.includes('key takeaway')) {
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
 * @param {HTMLElement} root - Root element to process
 */
export function addParagraphSpacers(root) {
  // Clear cache at start of processing to ensure fresh data
  clearKeyTakeawaysCache();

  // 1. Add spacers before every header (except in Key Takeaways section)
  addSpacersBeforeHeaders(root);

  // 2. Add spacer after the list in Key Takeaways section
  addSpacerAfterKeyTakeawaysList(root);

  // 3. Add spacer before Read Also/Read More sections
  addSpacerBeforeReadSections(root);

  // 4. Remove spacer between FAQ h2 and first h3 question
  removeSpacerAfterFAQHeader(root);
}

/**
 * Add spacers before all headers except those in Key Takeaways section
 * @param {HTMLElement} root - Root element to process
 */
function addSpacersBeforeHeaders(root) {
  const headers = root.querySelectorAll('h1, h2, h3, h4, h5, h6');

  headers.forEach(header => {
    // Check if header IS the Key Takeaways heading
    const headerText = header.textContent.trim().toLowerCase();
    if (headerText.includes('key takeaway')) {
      return; // Skip the Key Takeaways heading itself
    }

    // Check if header is in Key Takeaways section
    if (isInKeyTakeawaysSection(header)) {
      return; // Skip headers in Key Takeaways section
    }

    // Check if there's already a spacer before this header
    const prevSibling = header.previousElementSibling;
    if (isSpacerParagraph(prevSibling)) {
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
    if (headingText.includes('key takeaway')) {
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

    // Match variations: "read also:", "read more:", "related articles:", etc.
    const isReadSection =
      /^(read\s+(also|more)|related\s+(articles|posts|content)|see\s+also|further\s+reading):/i.test(
        headingText
      );

    if (isReadSection) {
      addSpacerBeforeElement(heading);
    }
  });

  // Process paragraphs (e.g., <p><strong>Read also:</strong></p>)
  paragraphs.forEach(paragraph => {
    const paragraphText = paragraph.textContent.trim().toLowerCase();

    // Match variations: "read also:", "read more:", "related articles:", etc.
    const isReadSection =
      /^(read\s+(also|more)|related\s+(articles|posts|content)|see\s+also|further\s+reading):/i.test(
        paragraphText
      );

    if (isReadSection) {
      addSpacerBeforeElement(paragraph);
    }
  });
}

/**
 * Add spacer before an element if it doesn't already have one
 * @param {HTMLElement} element - Element to add spacer before
 */
function addSpacerBeforeElement(element) {
  // Check if there's already a spacer before this element
  const prevSibling = element.previousElementSibling;
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
    if (text.includes('faq') || text.includes('frequently asked questions')) {
      // Find next sibling that's a spacer followed by h3
      let nextElement = h2.nextElementSibling;

      while (nextElement) {
        // If we find a spacer
        if (isSpacerParagraph(nextElement)) {
          // Check if the next element after spacer is h3
          const afterSpacer = nextElement.nextElementSibling;
          if (afterSpacer && afterSpacer.tagName === 'H3') {
            // Remove the spacer
            nextElement.remove();
            break;
          }
        }

        // Stop if we hit h3 or another major heading
        if (
          nextElement.tagName === 'H3' ||
          nextElement.tagName === 'H2' ||
          nextElement.tagName === 'H1'
        ) {
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
