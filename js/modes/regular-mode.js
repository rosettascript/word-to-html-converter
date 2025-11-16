/**
 * Regular Mode Processor
 * Basic HTML cleaning - removes inline styles and preserves structure
 */

import { applyStrongInHeaders } from '../features/strong-in-headers.js';
import { removeDomainFromLinks } from '../features/remove-domain-links.js';
import { normalizeWhitespace } from '../features/whitespace-normalize.js';
import { replaceBrWithParagraph } from '../features/br-to-paragraph.js';
import { cleanAnchorWhitespace } from '../features/clean-anchor-whitespace.js';
import { unwrapPInList } from '../features/unwrap-p-in-list.js';
import { removeBrInLists } from '../features/remove-br-in-lists.js';
import { fixOrphanedListItems } from '../features/fix-orphaned-list-items.js';
import { combineSequentialOrderedLists } from '../features/combine-sequential-ordered-lists.js';

/**
 * Process HTML in Regular mode
 * @param {HTMLElement} element - Sanitized HTML element
 * @param {Object} options - Optional features
 * @returns {HTMLElement} - Processed element
 */
export function processRegularMode(element, options = {}) {
  // Clone to avoid mutations
  const processed = element.cloneNode(true);
  
  // Fix orphaned list items FIRST (before other processing)
  fixOrphanedListItems(processed);
  
  // Combine sequential single-item ordered lists (after orphaned items fixed)
  combineSequentialOrderedLists(processed);
  
  // Replace <br> tags with empty <p></p> tags
  replaceBrWithParagraph(processed);
  
  // Clean whitespace from anchor tags
  cleanAnchorWhitespace(processed);
  
  // Unwrap unnecessary <p> tags inside list items
  unwrapPInList(processed);
  
  // Remove <br> tags inside list items (invalid HTML)
  removeBrInLists(processed);
  
  // Apply strong in headers (default: disabled for Regular mode)
  const enableStrong = options.strongInHeaders === true;
  applyStrongInHeaders(processed, enableStrong);
  
  // Apply optional features
  if (options.removeDomain) {
    removeDomainFromLinks(processed);
  }
  
  if (options.normalizeWhitespace) {
    normalizeWhitespace(processed, 'basic');
  }
  
  return processed;
}
