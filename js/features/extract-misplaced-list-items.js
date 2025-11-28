/**
 * Extract Misplaced List Items
 * Detects list items that should be paragraphs outside the list
 * Uses pattern-based detection (e.g., "Interesting Fact:", "Note:") and
 * heuristic analysis (length, structure differences)
 */

/**
 * Check if inline content should start a new paragraph based on natural structural breaks
 * @param {Node} child - The inline content node to check
 * @param {HTMLElement|null} currentParagraph - Current paragraph being built
 * @returns {boolean} - True if a new paragraph should start
 */
function shouldStartNewParagraphForInlineContent(child, currentParagraph) {
  // Only check if we have an existing paragraph to separate from
  if (!currentParagraph) {
    return false;
  }
  
  // If current paragraph ends with sentence-ending punctuation, it might be a natural break
  const currentText = currentParagraph.textContent.trim();
  if (/[.!?]\s*$/.test(currentText)) {
    // If next content is an element (like <em>, <a>, etc.), treat as potential new paragraph
    if (child.nodeType === Node.ELEMENT_NODE) {
      return true;
    }
  }
  
  return false;
}

/**
 * Extract misplaced list items (content that should be paragraphs, not list items)
 * @param {HTMLElement} root - Root element to process
 */
export function extractMisplacedListItems(root) {
  const lists = Array.from(root.querySelectorAll('ul, ol'));

  lists.forEach(list => {
    // Only process lists with 2+ items (avoid false positives on single-item lists)
    const listItems = Array.from(list.querySelectorAll(':scope > li'));
    if (listItems.length < 2) {
      return;
    }

    // Check the last list item
    const lastItem = listItems[listItems.length - 1];
    if (!lastItem) {
      return;
    }

    // Determine if this item should be extracted
    // Pass allItems to isReadOrSourcesList check
    const shouldExtract = shouldExtractListItem(list, lastItem, listItems);
    
    if (shouldExtract) {
      // Get all children from the last item (clone them)
      const children = Array.from(lastItem.childNodes).map(child => child.cloneNode(true));
      
      // Block-level elements that should be inserted directly (not wrapped)
      const blockElements = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'UL', 'OL', 'DIV', 'BLOCKQUOTE', 'TABLE', 'HR']);
      
      // Remove the last item from the list
      lastItem.remove();

      // Insert content immediately after the list, preserving original structure
      if (list.parentNode) {
        // Insert point is right after the list
        let insertReference = list.nextSibling;
        
        // Group children into block elements and inline content
        // Strategy:
        // - Block elements (H1-H6, P, UL, OL, etc.) are inserted directly as separate elements
        // - Inline content (text nodes, <em>, <a>, etc.) is grouped into paragraphs
        // - Each block element causes a new paragraph to start for subsequent inline content
        // - Multiple <p> tags (if they exist) are preserved as separate paragraphs
        let currentParagraph = null;
        
        children.forEach(child => {
          const isBlockElement = child.nodeType === Node.ELEMENT_NODE && blockElements.has(child.tagName);
          const isInlineContent = !isBlockElement && (
            child.nodeType === Node.TEXT_NODE || 
            (child.nodeType === Node.ELEMENT_NODE && !blockElements.has(child.tagName))
          );
          
          if (isBlockElement) {
            // If we have accumulated inline content, close and insert the paragraph first
            // Keep it separate from block elements (including <p> tags)
            if (currentParagraph && currentParagraph.textContent.trim()) {
              if (insertReference) {
                list.parentNode.insertBefore(currentParagraph, insertReference);
              } else {
                list.parentNode.appendChild(currentParagraph);
              }
              insertReference = currentParagraph.nextSibling;
              currentParagraph = null;
            }
            
            // Insert block element directly (preserves existing <p> tags as separate paragraphs)
            if (insertReference) {
              list.parentNode.insertBefore(child, insertReference);
            } else {
              list.parentNode.appendChild(child);
            }
            insertReference = child.nextSibling;
          } else if (isInlineContent) {
            // Group inline content into paragraphs
            // Each section of inline content (separated by block elements) becomes its own paragraph
            // Check if this child has meaningful content (not just whitespace)
            const hasContent = child.nodeType === Node.TEXT_NODE 
              ? child.textContent.trim().length > 0
              : child.tagName || child.textContent.trim().length > 0;
            
            if (hasContent) {
              // Check if this content should start a new paragraph (e.g., "Alt Image Text:")
              const shouldStartNewParagraph = shouldStartNewParagraphForInlineContent(child, currentParagraph);
              
              if (shouldStartNewParagraph && currentParagraph && currentParagraph.textContent.trim()) {
                // Close current paragraph and start a new one
                if (insertReference) {
                  list.parentNode.insertBefore(currentParagraph, insertReference);
                } else {
                  list.parentNode.appendChild(currentParagraph);
                }
                insertReference = currentParagraph.nextSibling;
                currentParagraph = null;
              }
              
              // Create a new paragraph if we don't have one for this section
              if (!currentParagraph) {
                currentParagraph = document.createElement('p');
              }
              
              // Append inline content to current paragraph
              currentParagraph.appendChild(child);
            }
          }
        });
        
        // Insert any remaining paragraph (from the last section of inline content)
        if (currentParagraph && currentParagraph.textContent.trim()) {
          if (insertReference) {
            list.parentNode.insertBefore(currentParagraph, insertReference);
          } else {
            list.parentNode.appendChild(currentParagraph);
          }
        }

        // If list is now empty or has no items, remove it
        const remainingItems = list.querySelectorAll(':scope > li');
        if (remainingItems.length === 0) {
          list.remove();
        }
      }
    }
  });
}

/**
 * Check if list items are homogeneous (similar structure/content)
 * Homogeneous lists are legitimate and should not have items extracted
 * @param {HTMLElement[]} allItems - All list items
 * @returns {boolean} - True if items are homogeneous
 */
function isHomogeneousList(allItems) {
  if (allItems.length < 2) {
    return true; // Single item or empty - consider homogeneous
  }

  // Check if all items have similar structure (all links, all paragraphs, etc.)
  const itemStructures = allItems.map(item => {
    const hasLink = item.querySelector('a') !== null;
    const hasParagraph = item.querySelector('p') !== null;
    const hasHeading = item.querySelector('h1, h2, h3, h4, h5, h6') !== null;
    const textLength = item.textContent.trim().length;
    const linkCount = item.querySelectorAll('a').length;
    
    return {
      hasLink,
      hasParagraph,
      hasHeading,
      textLength,
      linkCount,
      structure: hasLink ? 'link' : hasParagraph ? 'paragraph' : hasHeading ? 'heading' : 'text'
    };
  });

  // Check if all items have the same structure type
  const firstStructure = itemStructures[0].structure;
  const allSameStructure = itemStructures.every(s => s.structure === firstStructure);
  
  // Check if all items are links (very common for legitimate lists)
  const allAreLinks = itemStructures.every(s => s.hasLink && s.linkCount === 1);
  
  // Check length similarity (if items are similar in length, likely homogeneous)
  const lengths = itemStructures.map(s => s.textLength);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const lengthVariance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
  const lengthStdDev = Math.sqrt(lengthVariance);
  const isLengthSimilar = lengthStdDev < avgLength * 0.5; // Items within 50% of average

  // List is homogeneous if:
  // 1. All items have same structure type, OR
  // 2. All items are single links, OR
  // 3. Items have similar lengths (low variance)
  return allSameStructure || allAreLinks || isLengthSimilar;
}

/**
 * Determine if a list item should be extracted as a paragraph
 * @param {HTMLElement} list - The list element
 * @param {HTMLElement} lastItem - The last list item to check
 * @param {HTMLElement[]} allItems - All list items in the list
 * @returns {boolean} - True if the item should be extracted
 */
function shouldExtractListItem(list, lastItem, allItems) {
  const lastItemText = lastItem.textContent.trim();
  
  // Must have content
  if (!lastItemText) {
    return false;
  }

  // Check if this is label/introductory text (e.g., "Read also:", "Read more:", "See also:")
  // These should ALWAYS be extracted, even from homogeneous lists
  // Case-insensitive: normalize text to lowercase before matching
  const normalizedText = lastItemText.toLowerCase().replace(/:\s*$/, '');
  const isLabelText = /^(read\s+(also|more)|related\s+(articles?|posts?|content|topics?|resources?|links?|information)|see\s+also|further\s+reading|additional\s+(resources?|information|reading|links?)|more\s+(information|resources?|reading)|explore\s+(more|further)|continue\s+reading|you\s+may\s+(also\s+)?(like|enjoy|find\s+interesting)|sources?|references?|bibliography)$/.test(normalizedText) ||
                      /^(related|additional|more|further|explore)\s+(content|resources?|information|reading|links?|topics?)/.test(normalizedText);
  
  if (isLabelText) {
    return true; // Always extract label text, regardless of list structure
  }

  // NEVER extract from homogeneous lists - these are legitimate lists
  // Homogeneous lists have similar structure/content across all items
  if (isHomogeneousList(allItems)) {
    return false;
  }

  // Use ONLY structural/heuristic detection - no pattern matching
  // This makes the system completely general and language-agnostic
  // It relies purely on structural differences, not keywords or patterns
  return shouldExtractByHeuristics(list, lastItem, allItems);
}

/**
 * Check if the list item matches common extraction patterns
 * Uses general structural patterns instead of hardcoded keywords
 * @param {HTMLElement} item - The list item to check
 * @returns {boolean} - True if it matches a pattern
 */
function matchesExtractionPattern(item) {
  const text = item.textContent.trim();

  // General pattern: label-like text ending with colon at the start
  // This catches "Note:", "Important:", "FYI:", "Consider:", etc. without hardcoding
  // Pattern: 1-5 words (allowing hyphens and apostrophes) followed by colon, at the start of the text
  // More flexible: allows for phrases like "Important Note:", "Key Point:", "FYI:", etc.
  const labelPattern = /^([A-Za-z]+(?:['-]?[A-Za-z]+)*(?:\s+[A-Za-z]+(?:['-]?[A-Za-z]+)*){0,4})\s*:/;
  
  // Check if text starts with a label pattern (short phrase ending with colon)
  const labelMatch = labelPattern.exec(text);
  if (labelMatch) {
    const labelText = labelMatch[1].toLowerCase();
    // More permissive: allow longer labels (< 50 chars instead of 40) and shorter content (> 5 chars instead of 10)
    const afterLabel = text.substring(labelMatch[0].length).trim();
    // Match if: short label with any content, OR longer label with substantial content
    if ((labelText.length < 50 && afterLabel.length > 5) || (labelText.length < 40 && afterLabel.length > 10)) {
      return true;
    }
  }

  // Also check if pattern appears within <strong> tags at the start
  // This handles cases like: <strong>Note:</strong> followed by text
  const strongElements = item.querySelectorAll('strong');
  for (const strong of strongElements) {
    const strongText = strong.textContent.trim();
    // Check if strong element is at the start of the list item
    const beforeStrong = strong.previousSibling;
    const isAtStart = !beforeStrong || 
                      (beforeStrong.nodeType === Node.TEXT_NODE && 
                       beforeStrong.textContent.trim() === '');
    
    if (isAtStart) {
      const strongLabelMatch = labelPattern.exec(strongText);
      if (strongLabelMatch) {
        const labelText = strongLabelMatch[1].toLowerCase();
        // More accurate: find the position of the strong element in the full text
        // Get all text nodes before the strong element to calculate accurate position
        let textBeforeStrong = '';
        let node = item.firstChild;
        while (node && node !== strong) {
          if (node.nodeType === Node.TEXT_NODE) {
            textBeforeStrong += node.textContent;
          } else if (node.nodeType === Node.ELEMENT_NODE && node !== strong) {
            textBeforeStrong += node.textContent;
          }
          node = node.nextSibling;
        }
        // Calculate remaining text after the strong element
        const textAfterStrong = text.substring(textBeforeStrong.length + strongText.length).trim();
        // More permissive: allow longer labels and shorter content (same as main pattern)
        if ((labelText.length < 50 && textAfterStrong.length > 5) || (labelText.length < 40 && textAfterStrong.length > 10)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Use heuristics to determine if item should be extracted
 * @param {HTMLElement} list - The list element
 * @param {HTMLElement} lastItem - The last list item
 * @param {HTMLElement[]} allItems - All list items
 * @returns {boolean} - True if heuristics suggest extraction
 */
function shouldExtractByHeuristics(list, lastItem, allItems) {
  const lastItemText = lastItem.textContent.trim();
  
  // Get other items (excluding the last one)
  const otherItems = allItems.slice(0, -1);
  
  if (otherItems.length === 0) {
    return false;
  }

  // Simplified approach: Is the last item structurally different from the others?
  // Use a simple "outlier detection" approach - if it's significantly different, extract it
  
  // Calculate basic statistics for comparison
  const otherItemLengths = otherItems.map(item => item.textContent.trim().length);
  const avgLength = otherItemLengths.reduce((a, b) => a + b, 0) / otherItemLengths.length;
  const lastItemLength = lastItemText.length;
  
  const otherItemSentences = otherItems.map(item => {
    const text = item.textContent.trim();
    return (text.match(/[.!?]+/g) || []).length;
  });
  const avgSentences = otherItemSentences.reduce((a, b) => a + b, 0) / otherItemSentences.length;
  const lastItemSentences = (lastItemText.match(/[.!?]+/g) || []).length;
  
  // Simple outlier detection: extract if item is an outlier in multiple dimensions
  // This is more general - doesn't rely on specific thresholds, just relative differences
  
  let outlierScore = 0;
  
  // Dimension 1: Length (is it much longer?)
  if (avgLength > 0 && lastItemLength > avgLength * 1.3) {
    outlierScore += 2; // Strong indicator
  } else if (avgLength > 0 && lastItemLength > avgLength * 1.1) {
    outlierScore += 1; // Weak indicator
  }
  
  // Dimension 2: Sentence count (does it have more sentences?)
  if (avgSentences > 0 && lastItemSentences > avgSentences * 1.5) {
    outlierScore += 2;
  } else if (avgSentences > 0 && lastItemSentences > avgSentences * 1.2) {
    outlierScore += 1;
  } else if (lastItemSentences >= 2 && avgSentences <= 1) {
    outlierScore += 2; // Has sentences when others don't
  }
  
  // Dimension 3: Punctuation complexity (does it have more complex punctuation?)
  const hasComplexPunctuation = /[,;:—–-]/.test(lastItemText);
  const otherItemsHaveComplexPunctuation = otherItems.some(item => /[,;:—–-]/.test(item.textContent.trim()));
  if (hasComplexPunctuation && !otherItemsHaveComplexPunctuation) {
    outlierScore += 1; // Has complex punctuation when others don't
  }
  
  // Dimension 4: Relative size (is it much larger than typical items?)
  const medianLength = otherItemLengths.sort((a, b) => a - b)[Math.floor(otherItemLengths.length / 2)];
  if (medianLength > 0 && lastItemLength > medianLength * 1.5) {
    outlierScore += 1;
  }

  // Extract if it's an outlier in multiple dimensions AND other items are similar to each other
  // This is more general - doesn't require specific thresholds, just "is it different?"
  // Also require minimum length to avoid extracting very short items
  
  // Check if other items are similar to each other (homogeneous group)
  // If other items vary a lot, the last item might not be an outlier
  const otherItemLengthsSorted = otherItemLengths.sort((a, b) => a - b);
  const otherLengthRange = otherItemLengthsSorted[otherItemLengthsSorted.length - 1] - otherItemLengthsSorted[0];
  const otherLengthVariance = otherItemLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / otherItemLengths.length;
  const otherItemsAreSimilar = otherLengthVariance < avgLength * 0.3; // Other items within 30% variance
  
  // Only extract if:
  // 1. Item is a clear outlier (score >= 4, more strict than before)
  // 2. Other items are similar to each other (homogeneous group)
  // 3. Item is long enough to be meaningful (>= 50 chars, more strict)
  if (outlierScore >= 4 && otherItemsAreSimilar && lastItemLength >= 50) {
    return true;
  }

  return false;
}

