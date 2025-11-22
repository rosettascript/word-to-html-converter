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
    // Only check the IMMEDIATE next sibling (not 2nd, 3rd, etc.)
    const nextSibling = list.nextElementSibling;

    // If no next sibling or it's not em/p, skip
    if (!nextSibling || (nextSibling.tagName !== 'EM' && nextSibling.tagName !== 'P')) {
      return;
    }

    // Collect elements that should be grouped together (em + link, etc.)
    const orphanGroup = [nextSibling];

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

    // STRICT CRITERIA: Only consider it orphaned if it matches list item patterns
    if (looksLikeOrphanedListItem(list, orphanGroup)) {
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
  // Common patterns: starts with author name, year, publication
  if (list.tagName === 'OL') {
    // Check if it looks like a citation (has italics + link, or just italics with structured text)
    const looksLikeCitation = /^[A-Z][a-zA-Z\s,.]+\(\d{4}/.test(text); // Name (Year

    if (hasItalics && (hasLink || looksLikeCitation)) {
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
