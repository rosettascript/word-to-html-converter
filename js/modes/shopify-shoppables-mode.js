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
import { addExternalLinkAttributes } from '../features/external-link-attributes.js';
import { fixOrphanedListItems } from '../features/fix-orphaned-list-items.js';
import { extractMisplacedListItems } from '../features/extract-misplaced-list-items.js';
import { convertListsToNumberedHeadings } from '../features/convert-lists-to-numbered-headings.js';
import { removeEmptyP } from '../features/remove-empty-p.js';
import { cleanLinkUrls } from '../features/clean-link-urls.js';
import { addShoppablesSpacers } from '../features/add-shoppables-spacers.js';
import { splitSectionMarkers } from '../features/split-section-markers.js';
import { isValidOptions } from '../utils/validation.js';

/**
 * Process HTML in Shopify Shoppables mode
 * @param {HTMLElement} element - Sanitized HTML element
 * @param {Object} options - Optional features
 * @returns {HTMLElement} - Processed element
 */
export function processShopifyShoppablesMode(element, options = {}) {
  // Validate and normalize options
  options = isValidOptions(options);

  // Clone to avoid mutations
  const processed = element.cloneNode(true);

  // Fix orphaned list items FIRST (before other processing)
  fixOrphanedListItems(processed);

  // Extract misplaced list items (items that should be paragraphs, not list items)
  extractMisplacedListItems(processed);

  // Convert sequential single-item ordered lists to numbered headings
  convertListsToNumberedHeadings(processed);

  // Replace <br> tags with empty <p></p> tags
  replaceBrWithParagraph(processed);

  // Split paragraphs containing section markers (Read also, Sources, etc.)
  splitSectionMarkers(processed);

  // Remove empty <p></p> tags
  removeEmptyP(processed);

  // Apply safe minification (aggressive whitespace removal)
  normalizeWhitespace(processed, 'minify');

  // Combine adjacent lists (remove <p>&nbsp;</p> spacers in Shoppables mode)
  combineLists(processed, 'shopify-shoppables');

  // Fix orphaned list items AGAIN after lists are combined
  // This catches orphans that appear after combined lists
  fixOrphanedListItems(processed);

  // Clean link URLs (normalize special hyphen characters)
  cleanLinkUrls(processed);

  // Add target="_blank" and rel="noopener noreferrer" to ALL links (internal and external)
  addExternalLinkAttributes(processed, options.baseDomain, true);

  // Clean whitespace from anchor tags
  cleanAnchorWhitespace(processed);

  // Apply strong in headers (default: enabled for Shopify Shoppables)
  const enableStrong = options.strongInHeaders !== false;
  applyStrongInHeaders(processed, enableStrong);

  // Apply optional features
  if (options.removeDomain) {
    removeDomainFromLinks(processed);
  }

  // Add shoppables spacers (if enabled)
  addShoppablesSpacers(processed, options);

  return processed;
}
