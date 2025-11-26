/**
 * Shopify Shoppables Mode Processor
 * Compact formatting for product descriptions with aggressive whitespace minification
 */

import { applyStrongInHeaders } from '../features/strong-in-headers.js';
import { removeDomainFromLinks } from '../features/remove-domain-links.js';
import { normalizeWhitespace } from '../features/whitespace-normalize.js';
import { combineLists } from '../features/list-combiner.js';
import { replaceBrWithParagraph } from '../features/br-to-paragraph.js';
import { cleanAnchorWhitespace } from '../features/clean-anchor-whitespace.js';
import { unwrapPInList } from '../features/unwrap-p-in-list.js';
import { addExternalLinkAttributes } from '../features/external-link-attributes.js';
import { removeBrInLists } from '../features/remove-br-in-lists.js';
import { fixOrphanedListItems } from '../features/fix-orphaned-list-items.js';
import { convertListsToNumberedHeadings } from '../features/convert-lists-to-numbered-headings.js';
import { removeEmptyP } from '../features/remove-empty-p.js';
import { cleanLinkUrls } from '../features/clean-link-urls.js';

/**
 * Process HTML in Shopify Shoppables mode
 * @param {HTMLElement} element - Sanitized HTML element
 * @param {Object} options - Optional features
 * @returns {HTMLElement} - Processed element
 */
export function processShopifyShoppablesMode(element, options = {}) {
  // Clone to avoid mutations
  const processed = element.cloneNode(true);

  // Fix orphaned list items FIRST (before other processing)
  fixOrphanedListItems(processed);

  // Convert sequential single-item ordered lists to numbered headings
  convertListsToNumberedHeadings(processed);

  // Replace <br> tags with empty <p></p> tags
  replaceBrWithParagraph(processed);

  // Remove empty <p></p> tags
  removeEmptyP(processed);

  // Apply safe minification (aggressive whitespace removal)
  normalizeWhitespace(processed, 'minify');

  // Combine adjacent lists (remove <p>&nbsp;</p> spacers in Shoppables mode)
  combineLists(processed, 'shopify-shoppables');

  // Clean link URLs (normalize special hyphen characters)
  cleanLinkUrls(processed);

  // Add target="_blank" and rel="noopener noreferrer" to ALL links (internal and external)
  addExternalLinkAttributes(processed, options.baseDomain, true);

  // Clean whitespace from anchor tags
  cleanAnchorWhitespace(processed);

  // Unwrap unnecessary <p> tags inside list items
  unwrapPInList(processed);

  // Remove <br> tags inside list items (invalid HTML)
  removeBrInLists(processed);

  // Apply strong in headers (default: enabled for Shopify Shoppables)
  const enableStrong = options.strongInHeaders !== false;
  applyStrongInHeaders(processed, enableStrong);

  // Apply optional features
  if (options.removeDomain) {
    removeDomainFromLinks(processed);
  }

  return processed;
}
