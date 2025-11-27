/**
 * Shopify Blogs Mode Processor
 * Optimized for Shopify blog posts with special handling for Key Takeaways
 */

import { applyStrongInHeaders } from '../features/strong-in-headers.js';
import { removeDomainFromLinks } from '../features/remove-domain-links.js';
import { normalizeWhitespace } from '../features/whitespace-normalize.js';
import { combineLists } from '../features/list-combiner.js';
import { addExternalLinkAttributes } from '../features/external-link-attributes.js';
import { processKeyTakeaways } from '../features/key-takeaways.js';
import { removeBrAndEmptyP } from '../features/remove-br-and-empty-p.js';
import { removeH1AfterKeyTakeaways } from '../features/remove-h1-after-key-takeaways.js';
import { removeSpaceAfterFAQHeaders } from '../features/remove-space-after-faq-headers.js';
import { cleanAnchorWhitespace } from '../features/clean-anchor-whitespace.js';
import { addParagraphSpacers } from '../features/add-paragraph-spacers.js';
import { fixOrphanedListItems } from '../features/fix-orphaned-list-items.js';
import { convertListsToNumberedHeadings } from '../features/convert-lists-to-numbered-headings.js';
import { cleanLinkUrls } from '../features/clean-link-urls.js';
import { isValidOptions, isSpacerParagraph } from '../utils/validation.js';
import { setSafeHTML } from '../utils/safe-html.js';

/**
 * Handle spacer before sources section based on removeParagraphSpacers option
 * @param {HTMLElement} root - Root element to process
 * @param {Object} options - Options object
 */
function handleSourcesSpacer(root, options) {
  const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6, p');

  headings.forEach(heading => {
    const headingText = heading.textContent.trim().toLowerCase();

    // Check if element contains "sources" (case-insensitive)
    if (headingText.includes('sources')) {
      // Check if there's already a spacer before this element
      const previousElement = heading.previousElementSibling;
      const hasSpacer = isSpacerParagraph(previousElement);

      if (options.removeParagraphSpacers) {
        // Remove paragraph spacers option is enabled - remove any existing spacer
        if (hasSpacer) {
          previousElement.remove();
        }
      } else {
        // Remove paragraph spacers option is disabled - add spacer if missing
        if (!hasSpacer) {
          const spacer = document.createElement('p');
          setSafeHTML(spacer, '&nbsp;');
          heading.parentNode.insertBefore(spacer, heading);
        }
      }
    }
  });
}

/**
 * Process HTML in Shopify Blogs mode
 * @param {HTMLElement} element - Sanitized HTML element
 * @param {Object} options - Optional features
 * @returns {HTMLElement} - Processed element
 */
export function processShopifyBlogsMode(element, options = {}) {
  // Validate and normalize options
  options = isValidOptions(options);

  // Clone to avoid mutations
  const processed = element.cloneNode(true);

  // Fix orphaned list items FIRST (before other processing)
  fixOrphanedListItems(processed);

  // Convert sequential single-item ordered lists to numbered headings
  convertListsToNumberedHeadings(processed);

  // Process Key Takeaways sections (remove <em>, normalize headings)
  processKeyTakeaways(processed);

  // Remove any h1 elements after Key Takeaways sections
  removeH1AfterKeyTakeaways(processed);

  // Remove <br> tags and empty <p> tags completely
  removeBrAndEmptyP(processed);

  // Remove spaces/br after FAQ h2 headers
  removeSpaceAfterFAQHeaders(processed);

  // Combine adjacent lists (don't combine if separated by <p>&nbsp;</p>)
  combineLists(processed, 'shopify-blogs');

  // Clean link URLs (normalize special hyphen characters)
  cleanLinkUrls(processed);

  // Add target="_blank" and rel="noopener noreferrer" to ALL links (internal and external)
  addExternalLinkAttributes(processed, options.baseDomain, true);

  // Clean whitespace from anchor tags
  cleanAnchorWhitespace(processed);

  // Apply basic whitespace normalization (always on for Shopify Blogs)
  normalizeWhitespace(processed, 'basic');

  // Add paragraph spacers (if not disabled by "Remove paragraph spacers" option)
  // Default: spacers are kept (removeParagraphSpacers = false - unchecked)
  // When checked: spacers are removed (removeParagraphSpacers = true)
  if (!options.removeParagraphSpacers) {
    addParagraphSpacers(processed);
  }

  // Apply strong in headers (default: enabled for Shopify Blogs)
  const enableStrong = options.strongInHeaders !== false;
  applyStrongInHeaders(processed, enableStrong);

  // Handle spacer before sources section based on removeParagraphSpacers option
  handleSourcesSpacer(processed, options);

  // Apply optional features
  if (options.removeDomain) {
    removeDomainFromLinks(processed);
  }

  return processed;
}
