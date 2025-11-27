/**
 * Add Shoppables Spacers
 * Adds <p><br></p> spacers before "read also"/"read more" and "sources" sections
 * This is specifically for Shopify Shoppables mode (different from Shopify Blogs spacers)
 */

/**
 * Check if element is a shoppables spacer paragraph (<p><br></p>)
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} - True if element is a shoppables spacer paragraph
 */
function isShoppablesSpacer(element) {
  if (!element || element.tagName !== 'P') {
    return false;
  }
  
  // Check if it contains only a <br> tag
  const innerHTML = element.innerHTML.trim();
  return innerHTML === '<br>' || innerHTML === '<br/>' || innerHTML === '<br />';
}

/**
 * Add spacer before an element if it doesn't already have one
 * @param {HTMLElement} element - Element to add spacer before
 */
function addSpacerBeforeElement(element) {
  // Check if there's already a spacer before this element
  const prevSibling = element.previousElementSibling;
  if (isShoppablesSpacer(prevSibling)) {
    return; // Already has spacer
  }

  // Create and insert spacer (<p><br></p>)
  const spacer = document.createElement('p');
  const br = document.createElement('br');
  spacer.appendChild(br);
  element.parentNode.insertBefore(spacer, element);
}

/**
 * Normalize text for keyword matching - handles various formats, punctuation, and whitespace
 * @param {string} text - Text to normalize
 * @returns {string} - Normalized text
 */
function normalizeTextForMatching(text) {
  return text
    .toLowerCase()
    .trim()
    // Remove trailing colons, periods, dashes, and other punctuation
    .replace(/[:;.,\-—–]\s*$/, '')
    // Normalize multiple spaces to single space
    .replace(/\s+/g, ' ')
    // Remove leading/trailing whitespace again after normalization
    .trim();
}

/**
 * Check if text matches "read also/read more" related keywords
 * Handles various formats, case variations, and additional terms
 * @param {string} text - Text to check
 * @returns {boolean} - True if text matches read section keywords
 */
function isReadSectionKeyword(text) {
  const normalized = normalizeTextForMatching(text);
  
  // Comprehensive patterns for related content sections
  // Handles: read also, read more, related articles, see also, further reading, etc.
  const readSectionPatterns = [
    // Direct patterns
    /^read\s+(also|more|further)$/i,
    /^see\s+(also|more)$/i,
    /^also\s+(read|see|check)$/i,
    /^more\s+(to\s+)?(read|see|explore)$/i,
    
    // Related content patterns
    /^related\s+(articles?|posts?|content|topics?|resources?|links?|information|items?|pages?|stories?|pieces?)$/i,
    /^related\s+(to\s+)?(this|above|below)$/i,
    
    // Additional/Further patterns
    /^additional\s+(resources?|information|reading|links?|content|articles?|posts?|materials?)$/i,
    /^further\s+(reading|information|resources?|exploration|content)$/i,
    /^more\s+(information|resources?|reading|content|articles?|posts?|links?|details?)$/i,
    
    // Explore patterns
    /^explore\s+(more|further|additional|related)$/i,
    
    // Continue patterns
    /^continue\s+(reading|exploring)$/i,
    
    // "You may also" patterns
    /^you\s+(may|might)\s+(also\s+)?(like|enjoy|find\s+interesting|want\s+to\s+read|be\s+interested\s+in)$/i,
    /^you\s+may\s+also$/i,
    
    // Other common variations
    /^similar\s+(articles?|posts?|content|topics?|resources?)$/i,
    /^recommended\s+(reading|articles?|posts?|content|resources?)$/i,
    /^suggested\s+(reading|articles?|posts?|content|resources?)$/i,
    /^check\s+(out\s+)?(also|these|more)$/i,
    /^don'?t\s+miss$/i,
    /^next\s+(steps?|articles?|posts?|reading)$/i,
    /^what'?s\s+next$/i,
    /^keep\s+(reading|exploring)$/i,
  ];
  
  // Check if any pattern matches
  return readSectionPatterns.some(pattern => pattern.test(normalized));
}

/**
 * Add spacer before Read Also/Read More sections
 * @param {HTMLElement} root - Root element to process
 */
function addSpacerBeforeReadSections(root) {
  // Check both headings (h1-h6) and paragraphs
  const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const paragraphs = root.querySelectorAll('p');

  // Process headings
  headings.forEach(heading => {
    const headingText = heading.textContent || '';
    
    if (isReadSectionKeyword(headingText)) {
      addSpacerBeforeElement(heading);
    }
  });

  // Process paragraphs (e.g., <p><strong>Read also:</strong></p>)
  paragraphs.forEach(paragraph => {
    const paragraphText = paragraph.textContent || '';
    
    if (isReadSectionKeyword(paragraphText)) {
      addSpacerBeforeElement(paragraph);
    }
  });
}

/**
 * Check if text matches "sources" related keywords
 * Handles various formats, case variations, and additional terms
 * @param {string} text - Text to check
 * @returns {boolean} - True if text matches sources section keywords
 */
function isSourcesSectionKeyword(text) {
  const normalized = normalizeTextForMatching(text);
  
  // Comprehensive patterns for reference/bibliography sections
  const sourcesSectionPatterns = [
    // Direct source patterns
    /^sources?$/i,
    /^source\s+(list|page|section|information)$/i,
    /^sources?\s+(and\s+)?(references?|citations?)$/i,
    
    // Reference patterns
    /^references?$/i,
    /^reference\s+(list|page|section|materials?)$/i,
    /^works?\s+cited$/i,
    /^works?\s+referenced$/i,
    
    // Citation patterns
    /^citations?$/i,
    /^citation\s+(list|page|section)$/i,
    
    // Bibliography patterns
    /^bibliography$/i,
    /^bibliographic\s+(references?|sources?)$/i,
    
    // Further reading (can be sources or read more - but we'll match it here for sources)
    /^further\s+reading$/i,
    
    // Other common variations
    /^attributions?$/i,
    /^credits?$/i,
    /^acknowledgments?$/i,
    /^acknowledgements?$/i,
    /^notes?$/i,
    /^endnotes?$/i,
    /^footnotes?$/i,
    /^resources?\s+(used|referenced|cited)$/i,
    /^literature\s+(cited|referenced|review)$/i,
    /^works?\s+(consulted|used|referenced)$/i,
    /^selected\s+(bibliography|references?|sources?)$/i,
    /^additional\s+(sources?|references?|reading)$/i,
  ];
  
  // Check if any pattern matches
  return sourcesSectionPatterns.some(pattern => pattern.test(normalized));
}

/**
 * Add spacer before Sources sections
 * @param {HTMLElement} root - Root element to process
 */
function addSpacerBeforeSources(root) {
  const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6, p');

  headings.forEach(heading => {
    const headingText = heading.textContent || '';
    
    // Check if element is a reference section
    if (isSourcesSectionKeyword(headingText)) {
      addSpacerBeforeElement(heading);
    }
  });
}

/**
 * Add shoppables spacers based on options
 * This feature is ONLY for Shopify Shoppables mode
 * @param {HTMLElement} root - Root element to process
 * @param {Object} options - Options object
 */
export function addShoppablesSpacers(root, options = {}) {
  // Add spacer before Read Also/Read More sections if enabled
  if (options.addSpacerBeforeReadSections) {
    addSpacerBeforeReadSections(root);
  }

  // Add spacer before Sources sections if enabled
  if (options.addSpacerBeforeSources) {
    addSpacerBeforeSources(root);
  }
}

