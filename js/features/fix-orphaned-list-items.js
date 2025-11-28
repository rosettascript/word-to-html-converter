/**
 * Fix Orphaned List Items
 * Detects content immediately after a list that looks like it should be a list item
 * VERY CONSERVATIVE: Only checks immediate next sibling, strict criteria
 */

/**
 * Fix orphaned list items (content that should be in the list but is outside)
 * @param {HTMLElement} root - Root element to process
 */
export function fixOrphanedListItems(root) {
  const lists = root.querySelectorAll('ul, ol');

  lists.forEach(list => {
    // Check both element siblings AND text nodes
    // Text nodes can contain orphaned content (e.g., raw text after </ol>)
    // Skip whitespace-only text nodes to find the first meaningful sibling
    let nextSibling = list.nextSibling;
    let nextElementSibling = list.nextElementSibling;
    
    // Skip whitespace-only text nodes to find meaningful content
    while (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
      const textContent = nextSibling.textContent.trim();
      if (textContent.length > 0) {
        // Found meaningful text node - wrap it in a paragraph
        const p = document.createElement('p');
        p.textContent = textContent;
        // Replace the text node with the paragraph
        list.parentNode.replaceChild(p, nextSibling);
        // Update references - the paragraph is now the next sibling
        nextSibling = p;
        nextElementSibling = p;
        break; // Found and wrapped, exit loop
      } else {
        // Whitespace-only text node - skip to next sibling
        nextSibling = nextSibling.nextSibling;
        if (nextSibling && nextSibling.nodeType === Node.ELEMENT_NODE) {
          nextElementSibling = nextSibling;
        }
      }
    }
    
    // If no next sibling or it's not em/p, skip
    // Now nextSibling should be an element (we wrapped text nodes)
    if (!nextSibling || nextSibling.nodeType !== Node.ELEMENT_NODE || 
        (nextSibling.tagName !== 'EM' && nextSibling.tagName !== 'P')) {
      return;
    }

    // CRITICAL: Be more conservative - only convert if paragraph structure closely matches list items
    // Check if the paragraph is inside a container that suggests it's not an orphan
    // (e.g., table cells, divs with specific structure, etc.)
    const orphanContainer = nextSibling.closest('td, th, div, section, article, aside, header, footer, main, nav');
    const listContainer = list.closest('td, th, div, section, article, aside, header, footer, main, nav');
    // If both are in the same container, they're likely part of the same content block
    // This doesn't necessarily mean it's an orphan - it could just be a normal paragraph
    const sameContainer = orphanContainer && listContainer && orphanContainer === listContainer;

    // Collect elements that should be grouped together (em + link, etc.)
    const orphanGroup = [nextSibling];

    // For citations/references (OL lists), collect ALL following paragraphs/em elements
    // until we hit a non-citation element or heading
    // This handles cases where citations are split across multiple elements
    if (list.tagName === 'OL') {
      let checkNext = nextSibling.nextElementSibling;
      // Collect all related citation content
      while (checkNext) {
        const tagName = checkNext.tagName;
        const text = checkNext.textContent.trim();
        
        // Always collect paragraphs, em, and links (common in citations)
        // This is critical for split citations where journal name is in <em> and
        // author info is in a following <p>
        if (tagName === 'P' || tagName === 'EM' || tagName === 'A') {
          orphanGroup.push(checkNext);
          checkNext = checkNext.nextElementSibling;
          continue;
        }
        
        // Stop at headings (new section)
        if (tagName && /^H[1-6]$/.test(tagName)) {
          break;
        }
        
        // Stop at other lists
        if (tagName === 'UL' || tagName === 'OL') {
          break;
        }
        
        // For other elements, check if they look like citation content
        // Check for citation patterns: years, DOIs, author names, journal names
        const hasCitationPattern = /\d{4}|doi\.org|doi:|DOI:|https?:\/\//i.test(text) ||
                                   /^[A-Z][a-zA-Z\s,.&]+(?:,\s*[A-Z][a-zA-Z\s,.&]+)*\s*\(?\d{4}/.test(text) ||
                                   /Journal|Proceedings|Conference|Volume|Vol\.|pp\.|pages/i.test(text);
        
        // If it has citation-like patterns and reasonable length, include it
        if (hasCitationPattern && text.length > 0 && text.length < 1000) {
          orphanGroup.push(checkNext);
          checkNext = checkNext.nextElementSibling;
        } else if (text.length === 0) {
          // Empty element - skip it
          checkNext = checkNext.nextElementSibling;
        } else {
          // Non-citation content - stop collecting
          break;
        }
      }
      
      // Also check if the collected group looks like a complete citation
      // If the first element is just an <em> with journal name and there's a paragraph after,
      // it's likely a split citation that should be combined
      const combinedText = orphanGroup.map(el => el.textContent).join(' ').trim();
      const hasCompleteCitation = /[A-Z][a-zA-Z\s,.&]+(?:,\s*[A-Z][a-zA-Z\s,.&]+)*\s*\(?\d{4}/.test(combinedText) ||
                                   /https?:\/\/[^\s]+|doi\.org|doi:|DOI:/i.test(combinedText);
    } else {
      // For UL lists, be more conservative (original behavior)
      // Check the next 1-2 siblings for related content (like a link right after em)
      let checkNext = nextSibling.nextElementSibling;
      let checked = 0;
      while (checkNext && checked < 2) {
        // If it's a link or another em/p, it might belong to the orphan
        if (checkNext.tagName === 'A' || checkNext.tagName === 'EM' || checkNext.tagName === 'P') {
          orphanGroup.push(checkNext);
          checkNext = checkNext.nextElementSibling;
          checked++;
        } else {
          break; // Stop if we hit something else
        }
      }
    }

    // STRICT CRITERIA: Only consider it orphaned if it matches list item patterns
    const orphanText = orphanGroup.map(el => el.textContent).join(' ').trim().substring(0, 150);
    const looksLikeOrphan = looksLikeOrphanedListItem(list, orphanGroup);
    
    if (looksLikeOrphan) {
      // Check if this orphan completes the last list item (special case for incomplete citations)
      const listItems = Array.from(list.querySelectorAll('li'));
      const lastListItem = listItems.length > 0 ? listItems[listItems.length - 1] : null;
      const lastItemText = lastListItem ? lastListItem.textContent.trim() : '';
      // Check if last item structure suggests it might be incomplete
      const lastItemHasOnlyEm = lastListItem && 
                                lastListItem.children.length === 1 && 
                                lastListItem.children[0].tagName === 'EM';
      const lastItemHasAuthorPattern = /[A-Z][a-zA-Z\s,.&]+(?:,\s*[A-Z][a-zA-Z\s,.&]+)*\s*\(?\d{4}/.test(lastItemText);
      // Expanded publication pattern to include more types (books, magazines, newspapers, etc.)
      // Works for any citation format: academic journals, books, articles, etc.
      const lastItemHasPublicationPattern = /Journal|Proceedings|Conference|Volume|Vol\.|Book|Magazine|Newspaper|Press|Publisher|Ed\.|Edition|Series|Chapter|ISBN/i.test(lastItemText);
      // Check if last item is incomplete: has publication info but missing page numbers/DOI/volume
      const lastItemHasPageNumbers = /\d+[‑–-]\d+|pp\.|pages|p\./i.test(lastItemText);
      const lastItemHasDOI = /doi\.org|doi:|DOI:|https?:\/\/[^\s]+/i.test(lastItemText);
      const lastItemHasVolume = /Volume|Vol\.|v\.\d+/i.test(lastItemText) && /\d+/.test(lastItemText.match(/Volume|Vol\.|v\.\d+/i)?.[0] || '');
      // Incomplete detection: has only <em> with publication pattern but lacks completion details
      // This works for any citation format and any section name (Sources, References, Bibliography, etc.)
      const lastItemIsIncomplete = lastItemHasOnlyEm &&
                                   lastItemHasPublicationPattern &&
                                   !lastItemHasPageNumbers &&
                                   !lastItemHasDOI &&
                                   !lastItemHasVolume;
      const orphanText = orphanGroup.length > 0 ? orphanGroup[0].textContent.trim() : '';
      // Check if orphan is a continuation (page numbers, DOI, volume) OR starts with authors
      const orphanIsContinuation = /^\(?\d+\)?[,\s]|^\d+[‑–-]\d+|^pp\.|^pages|^p\.|^doi\.org|^doi:|^DOI:|^https?:\/\/|^Volume|^Vol\.|^v\.\d+/i.test(orphanText);
      const orphanStartsWithAuthors = /^[A-Z][a-zA-Z\s,.&]+(?:,\s*[A-Z][a-zA-Z\s,.&]+)*\s*\(?\d{4}/.test(orphanText);
      const orphanIsValidForAppend = orphanIsContinuation || orphanStartsWithAuthors;
      const orphanGroupLengthCheck = orphanGroup.length === 1;
      const orphanGroupTagCheck = orphanGroup[0]?.tagName === 'P';
      const shouldAppendToLastItem = lastItemIsIncomplete &&
                                     orphanGroupLengthCheck &&
                                     orphanGroupTagCheck &&
                                     orphanIsValidForAppend;
      
      if (shouldAppendToLastItem && lastListItem) {
        // Append orphan content to the last list item (completes incomplete citation)
        // Add a space before appending
        const space = document.createTextNode(' ');
        lastListItem.appendChild(space);
        
        // Extract and append content from orphan elements as inline content
        // This prevents nested block elements (like <p> inside <li>)
        orphanGroup.forEach(orphan => {
          // Clone the orphan to preserve its structure
          const cloned = orphan.cloneNode(true);
          
          // If it's a paragraph, extract its content and append inline
          if (cloned.tagName === 'P') {
            // Move all child nodes from the paragraph to the list item
            while (cloned.firstChild) {
              lastListItem.appendChild(cloned.firstChild);
            }
          } else {
            // For other elements (like <em>), append directly
            lastListItem.appendChild(cloned);
          }
        });
        
        // Remove the original orphan elements
        orphanGroup.forEach(orphan => orphan.remove());
      } else {
        // Create a new list item
        const li = document.createElement('li');

        // Clone each orphan element with all its content and append to the new <li>
        orphanGroup.forEach(orphan => {
          li.appendChild(orphan.cloneNode(true));
        });

        // Add the new list item to the list
        list.appendChild(li);

        // Remove the original orphan elements
        orphanGroup.forEach(orphan => orphan.remove());
      }
    }
  });
}

/**
 * Check if a group of elements looks like an orphaned list item
 * @param {HTMLElement} list - The list element
 * @param {HTMLElement[]} orphanGroup - Array of potential orphan elements
 * @returns {boolean}
 */
function looksLikeOrphanedListItem(list, orphanGroup) {
  // Combine text from all elements in the group
  const text = orphanGroup
    .map(el => el.textContent)
    .join(' ')
    .trim();

  // Must have some content
  if (!text) {
    return false;
  }

  // Check if any element in the group has a link
  const hasLink = orphanGroup.some(el => el.tagName === 'A' || el.querySelector('a'));

  // Check if any element in the group has italics
  const hasItalics = orphanGroup.some(el => el.tagName === 'EM' || el.querySelector('em'));

  // Check if list items have similar structure (e.g., all contain links)
  const listItems = Array.from(list.querySelectorAll('li'));
  const mostItemsHaveLinks =
    listItems.filter(li => li.querySelector('a')).length > listItems.length / 2;

  // If most list items have links, orphan should too
  if (mostItemsHaveLinks && !hasLink) {
    return false;
  }

  // For OL (numbered lists), check if it looks like a citation/reference
  // Use more general patterns to detect various citation formats
  if (list.tagName === 'OL') {
    // General citation patterns:
    // 1. Author name followed by year in parentheses: "Name (Year" or "Name, Year"
    // 2. Author name followed by publication info
    // 3. Structured text with italics (often book/journal titles)
    // 4. Academic citation format with multiple authors, years, journal names
    // 5. More lenient patterns to catch edge cases
    const citationPatterns = [
      /^[A-Z][a-zA-Z\s,.]+[,\s]?\s*\(?\d{4}/,  // Name (Year or Name, Year
      /^[A-Z][a-zA-Z\s,.]+[,\s]+\d{4}/,        // Name, Year
      /^[A-Z][a-zA-Z\s,.]+\.\s*[A-Z]/,          // Name. Title (author. title format)
      /^[A-Z][a-zA-Z\s,.&]+(?:,\s*[A-Z][a-zA-Z\s,.&]+)*\s*\(?\d{4}/, // Multiple authors, Year
      /\.\s*[A-Z][a-zA-Z\s]+\s*\(?\d{4}/,      // ...Journal Name (Year
      /https?:\/\/[^\s]+/,                       // Has URL (DOI, etc.)
      /doi\.org|doi:|DOI:/i,                     // Has DOI reference
      /[A-Z][a-zA-Z\s,.&]+(?:,\s*[A-Z][a-zA-Z\s,.&]+)*\s*\(?\d{4}/, // Multiple authors anywhere in text
      /\d{4}\)?\s*\.\s*[A-Z]/,                   // Year). Title
      /Journal|Proceedings|Conference|Volume|Vol\.|pp\.|pages/i, // Academic terms
    ];
    
    // Check if text matches any citation pattern (more lenient - check anywhere in text, not just start)
    const looksLikeCitation = citationPatterns.some(pattern => {
      // Try matching at start first (more strict)
      if (pattern.test(text)) return true;
      // Then try matching anywhere in text (more lenient for citations)
      if (pattern.source.startsWith('^')) {
        // Remove ^ anchor and try again
        const lenientPattern = new RegExp(pattern.source.replace('^', ''), pattern.flags);
        return lenientPattern.test(text);
      }
      return false;
    });

    // Check if existing list items have similar structure (citations/references)
    const listItems = Array.from(list.querySelectorAll('li'));
    const existingItemsHaveItalics = listItems.filter(li => li.querySelector('em, i')).length > listItems.length / 2;
    const existingItemsHaveLinks = listItems.filter(li => li.querySelector('a')).length > listItems.length / 2;
    const existingItemsMatchCitationPattern = listItems.some(li => {
      const liText = li.textContent.trim();
      return citationPatterns.some(pattern => pattern.test(liText));
    });

    // Citation indicators: 
    // 1. Has italics (for titles) AND (has link OR matches citation pattern), OR
    // 2. Matches citation pattern AND existing items also match citation patterns, OR
    // 3. Has italics AND existing items have italics (consistent structure), OR
    // 4. Has DOI/URL pattern (common in academic citations), OR
    // 5. Has year pattern (4 digits) AND existing items have years (very common in citations)
    const hasDoiOrUrl = /https?:\/\/[^\s]+|doi\.org|doi:|DOI:/i.test(text);
    const hasYear = /\d{4}/.test(text);
    const existingItemsHaveYears = listItems.some(li => /\d{4}/.test(li.textContent));
    
    // Special case 1: Check if this is a split citation where:
    // - First element is <em> with journal name
    // - Followed by paragraph with author names and full citation
    // This pattern: <em>Journal Name</em> + <p>Author, A., Author, B. (Year)...
    const isSplitCitation = orphanGroup.length >= 2 && 
                           orphanGroup[0].tagName === 'EM' &&
                           orphanGroup[1].tagName === 'P' &&
                           /^[A-Z][a-zA-Z\s,.&]+(?:,\s*[A-Z][a-zA-Z\s,.&]+)*\s*\(?\d{4}/.test(orphanGroup[1].textContent.trim());
    
    // Special case 2: Last list item is incomplete (just <em> with journal name) and orphan completes it
    // Pattern: Last <li><em>Journal Name</em></li> + <p>Author, A., ... (Year)...
    const lastListItem = listItems.length > 0 ? listItems[listItems.length - 1] : null;
    const lastItemText = lastListItem ? lastListItem.textContent.trim() : '';
    const lastItemHasOnlyEm = lastListItem && 
                              lastListItem.children.length === 1 && 
                              lastListItem.children[0].tagName === 'EM';
    const lastItemIsIncomplete = lastItemHasOnlyEm &&
                                 !/[A-Z][a-zA-Z\s,.&]+(?:,\s*[A-Z][a-zA-Z\s,.&]+)*\s*\(?\d{4}/.test(lastItemText) &&
                                 /Journal|Proceedings|Conference|Volume|Vol\./i.test(lastItemText);
    
    // Check if orphan paragraph starts with author names (citation pattern)
    const orphanText = orphanGroup.length > 0 ? orphanGroup[0].textContent.trim() : '';
    const orphanStartsWithAuthors = /^[A-Z][a-zA-Z\s,.&]+(?:,\s*[A-Z][a-zA-Z\s,.&]+)*\s*\(?\d{4}/.test(orphanText);
    
    const orphanCompletesLastItem = lastItemIsIncomplete &&
                                    orphanGroup.length === 1 &&
                                    orphanGroup[0].tagName === 'P' &&
                                    orphanStartsWithAuthors;
    
    // More lenient detection: if it has multiple citation indicators, it's likely a citation
    let citationScore = 0;
    if (hasItalics) citationScore += 2; // Strong indicator
    if (hasLink) citationScore += 1;
    if (looksLikeCitation) citationScore += 2; // Strong indicator
    if (hasDoiOrUrl) citationScore += 2; // Strong indicator
    if (hasYear && existingItemsHaveYears) citationScore += 1; // Year pattern matches
    if (existingItemsMatchCitationPattern) citationScore += 1; // Existing items are citations
    if (isSplitCitation) citationScore += 3; // Very strong indicator for split citations
    if (orphanCompletesLastItem) citationScore += 4; // Very strong indicator - completes incomplete citation
    
    // If score is high enough (>= 3) OR matches strict criteria, it's a citation
    // Also accept split citations and completion cases even with lower scores if existing items are citations
    if (citationScore >= 3 ||
        isSplitCitation ||
        orphanCompletesLastItem ||
        (hasItalics && (hasLink || looksLikeCitation || hasDoiOrUrl)) ||
        (looksLikeCitation && existingItemsMatchCitationPattern) ||
        (hasItalics && existingItemsHaveItalics && text.length > 50) ||
        (hasDoiOrUrl && existingItemsMatchCitationPattern) ||
        (hasYear && hasItalics && existingItemsHaveYears && existingItemsHaveItalics && text.length > 100)) {
      return true; // Likely an orphaned citation
    }
  }

  // For UL (bullet lists), use STRUCTURAL similarity checks, not pattern matching
  // Only convert if the orphan's structure closely matches the list items' structure
  if (list.tagName === 'UL') {
    const listItems = Array.from(list.querySelectorAll('li'));

    // If no list items, can't determine structure
    if (listItems.length === 0) {
      return false;
    }

    // Analyze STRUCTURAL properties of list items (not content patterns)
    const listItemStructures = listItems.map(li => {
      const hasLink = li.querySelector('a') !== null;
      const hasParagraph = li.querySelector('p') !== null;
      const hasHeading = li.querySelector('h1, h2, h3, h4, h5, h6') !== null;
      const hasStrong = li.querySelector('strong') !== null;
      const hasEm = li.querySelector('em') !== null;
      const textLength = li.textContent.trim().length;
      const linkCount = li.querySelectorAll('a').length;
      const childElementCount = li.children.length;
      
      return {
        hasLink,
        hasParagraph,
        hasHeading,
        hasStrong,
        hasEm,
        textLength,
        linkCount,
        childElementCount,
        // Structural type: what kind of content does this list item contain?
        structure: hasLink ? 'link' : hasParagraph ? 'paragraph' : hasHeading ? 'heading' : 'text'
      };
    });

    // Analyze STRUCTURAL properties of orphan
    const orphanHasLink = orphanGroup.some(el => el.tagName === 'A' || el.querySelector('a'));
    const orphanHasParagraph = orphanGroup.some(el => el.tagName === 'P');
    const orphanHasHeading = orphanGroup.some(el => /^H[1-6]$/.test(el.tagName));
    const orphanHasStrong = orphanGroup.some(el => el.tagName === 'STRONG' || el.querySelector('strong'));
    const orphanHasEm = orphanGroup.some(el => el.tagName === 'EM' || el.querySelector('em'));
    const orphanTextLength = text.length;
    const orphanLinkCount = orphanGroup.filter(el => el.tagName === 'A' || el.querySelector('a')).length;
    const orphanChildElementCount = orphanGroup.reduce((sum, el) => sum + (el.children ? el.children.length : 0), 0);
    const orphanStructure = orphanHasLink ? 'link' : orphanHasParagraph ? 'paragraph' : orphanHasHeading ? 'heading' : 'text';

    // STRUCTURAL SIMILARITY CHECKS:
    
    // 1. Structure type match: Does orphan have the same structural type as list items?
    const allItemsSameStructure = listItemStructures.every(s => s.structure === listItemStructures[0].structure);
    const orphanMatchesStructure = orphanStructure === listItemStructures[0].structure;
    
    // If all list items have the same structure type, orphan must match
    if (allItemsSameStructure && !orphanMatchesStructure) {
      return false; // Different structure = not an orphan
    }

    // 2. Length similarity: Is orphan similar in length to list items?
    const listItemLengths = listItemStructures.map(s => s.textLength);
    const avgLength = listItemLengths.reduce((a, b) => a + b, 0) / listItemLengths.length;
    const lengthVariance = listItemLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / listItemLengths.length;
    const lengthStdDev = Math.sqrt(lengthVariance);
    const isListLengthSimilar = lengthStdDev < avgLength * 0.5; // List items are similar in length
    
    // If list items are similar in length, orphan should be too
    let lengthRatio = 0;
    if (isListLengthSimilar && avgLength > 0) {
      const lengthDifference = Math.abs(orphanTextLength - avgLength);
      lengthRatio = lengthDifference / avgLength;
      // If orphan is more than 2x different in length, it's probably not an orphan
      if (lengthRatio > 2.0) {
        return false; // Too different in length = not an orphan
      }
    }

    // 3. Element presence: Do list items consistently have certain elements?
    const mostItemsHaveLinks = listItemStructures.filter(s => s.hasLink).length > listItems.length / 2;
    const mostItemsHaveStrong = listItemStructures.filter(s => s.hasStrong).length > listItems.length / 2;
    const mostItemsHaveEm = listItemStructures.filter(s => s.hasEm).length > listItems.length / 2;
    
    // If most list items have links, orphan should too (structural consistency)
    if (mostItemsHaveLinks && !orphanHasLink) {
      return false; // Missing structural element = not an orphan
    }
    
    // If most list items have strong, orphan should too (structural consistency)
    if (mostItemsHaveStrong && !orphanHasStrong) {
      return false; // Missing structural element = not an orphan
    }
    
    // If most list items have em, orphan should too (structural consistency)
    if (mostItemsHaveEm && !orphanHasEm) {
      return false; // Missing structural element = not an orphan
    }

    // 4. Link count consistency: If list items have consistent link counts, orphan should match
    const allItemsHaveOneLink = listItemStructures.every(s => s.linkCount === 1);
    if (allItemsHaveOneLink && orphanLinkCount !== 1) {
      return false; // Different link count = not an orphan
    }

    // 5. Sentence count: List items are usually short (1-2 sentences max)
    const sentenceCount = (text.match(/[.!?]+/g) || []).length;
    if (sentenceCount > 2) {
      return false; // Too many sentences = likely not a list item
    }

    // Check if orphan is a label/introductory text (e.g., "Read also:", "Read more:", "See also:")
    // These should NOT be converted to list items, even if they match structural similarity
    // Case-insensitive: normalize text to lowercase before matching
    const normalizedOrphanText = text.trim().toLowerCase().replace(/:\s*$/, '');
    const isLabelText = /^(read\s+(also|more)|related\s+(articles?|posts?|content|topics?|resources?|links?|information)|see\s+also|further\s+reading|additional\s+(resources?|information|reading|links?)|more\s+(information|resources?|reading)|explore\s+(more|further)|continue\s+reading|you\s+may\s+(also\s+)?(like|enjoy|find\s+interesting)|sources?|references?|bibliography)$/.test(normalizedOrphanText) ||
                        /^(related|additional|more|further|explore)\s+(content|resources?|information|reading|links?|topics?)/.test(normalizedOrphanText);
    
    if (isLabelText) {
      return false; // Label text should not be converted to list item
    }

    // 6. Final check: Only convert if orphan has STRONG structural similarity
    // It must match the structure type AND have similar length AND have consistent elements
    const hasStructuralSimilarity = orphanMatchesStructure || 
                                    (isListLengthSimilar && lengthRatio <= 1.5) ||
                                    (mostItemsHaveLinks && orphanHasLink) ||
                                    (mostItemsHaveStrong && orphanHasStrong);
    
    if (!hasStructuralSimilarity) {
      return false; // No structural similarity = not an orphan
    }

    // If we get here, the orphan has strong structural similarity to list items
    return true;
  }

  // Default: don't assume it's orphaned
  return false;
}
