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

  // For UL (bullet lists), be more conservative
  // Check if the orphan matches the pattern of existing list items
  if (list.tagName === 'UL') {
    const listItems = Array.from(list.querySelectorAll('li'));

    // If no list items, can't determine pattern
    if (listItems.length === 0) {
      return false;
    }

    // Check if orphan starts with strong (like most list items do)
    const firstOrphanEl = orphanGroup[0];
    let orphanStartsWithStrong = false;

    if (firstOrphanEl) {
      // Check if the element itself is STRONG
      if (firstOrphanEl.tagName === 'STRONG') {
        orphanStartsWithStrong = true;
      } else {
        // For P or other elements, check if first element child is STRONG
        // or if first child is STRONG (handles text nodes before STRONG)
        const firstChild = firstOrphanEl.firstElementChild || firstOrphanEl.firstChild;
        if (firstChild && firstChild.tagName === 'STRONG') {
          orphanStartsWithStrong = true;
        } else {
          // Check if there's a STRONG element and it's the first significant element
          const strongEl = firstOrphanEl.querySelector('strong');
          if (strongEl) {
            // Check if STRONG is at the start (no significant content before it)
            const beforeStrong = strongEl.previousSibling;
            if (
              !beforeStrong ||
              (beforeStrong.nodeType === Node.TEXT_NODE && beforeStrong.textContent.trim() === '')
            ) {
              orphanStartsWithStrong = true;
            }
          }
        }
      }
    }

    // Check how many list items start with strong
    const itemsStartWithStrong = listItems.filter(li => {
      const firstChild = li.firstElementChild || li.firstChild;
      if (firstChild && firstChild.tagName === 'STRONG') {
        return true;
      }
      // Check if STRONG is at the start of the list item
      const strongEl = li.querySelector('strong');
      if (strongEl) {
        const beforeStrong = strongEl.previousSibling;
        return (
          !beforeStrong ||
          (beforeStrong.nodeType === Node.TEXT_NODE && beforeStrong.textContent.trim() === '')
        );
      }
      return false;
    }).length;

    const mostItemsStartWithStrong = itemsStartWithStrong > listItems.length / 2;

    // If most list items start with strong, orphan should too
    if (mostItemsStartWithStrong && !orphanStartsWithStrong) {
      return false;
    }

    // Check if orphan is too long (multiple sentences) - list items are usually shorter
    const sentenceCount = (text.match(/[.!?]+/g) || []).length;
    if (sentenceCount > 2) {
      return false; // Too long to be a list item
    }

    // Check if orphan is a paragraph that's clearly continuation/summary text
    // (not a list item) - paragraphs that start with full sentences and don't match
    // the list item pattern are likely not list items
    if (firstOrphanEl && firstOrphanEl.tagName === 'P') {
      // If it doesn't start with strong and has multiple sentences, it's likely not a list item
      if (!orphanStartsWithStrong && sentenceCount >= 2) {
        return false;
      }
      // If it's a long paragraph (more than ~150 chars) without strong, likely not a list item
      if (text.length > 150 && !orphanStartsWithStrong) {
        return false;
      }
    }

    // Check if orphan has strong OR link (but only if it matches the pattern)
    const hasStrong = orphanGroup.some(el => el.tagName === 'STRONG' || el.querySelector('strong'));

    if (hasStrong || (hasLink && orphanStartsWithStrong)) {
      return true;
    }
  }

  // Default: don't assume it's orphaned
  return false;
}
