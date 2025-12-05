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
import { addParagraphSpacers, scoreReadAlsoSection } from '../features/add-paragraph-spacers.js';
import { splitSectionMarkers } from '../features/split-section-markers.js';
import { fixOrphanedListItems } from '../features/fix-orphaned-list-items.js';
import { extractMisplacedListItems } from '../features/extract-misplaced-list-items.js';
import { convertListsToNumberedHeadings } from '../features/convert-lists-to-numbered-headings.js';
import { cleanLinkUrls } from '../features/clean-link-urls.js';
import { removeEmptyHeaders } from '../features/remove-empty-headers.js';
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
    const normalizedHeadingText = headingText.replace(/:\s*$/, '');

    // Match reference/bibliography sections more generally
    const isReferenceSection = 
      normalizedHeadingText.includes('sources') ||
      normalizedHeadingText.includes('references') ||
      normalizedHeadingText.includes('bibliography') ||
      normalizedHeadingText === 'works cited' ||
      normalizedHeadingText === 'citations' ||
      normalizedHeadingText === 'further reading' ||
      /^(sources?|references?|bibliography|works?\s+cited|citations?)$/i.test(normalizedHeadingText);

    // Check if element is a reference section
    if (isReferenceSection) {
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
        // Structural check: Skip if previous sibling is a header
        const prevSibling = heading.previousElementSibling;
        if (prevSibling && /^H[1-6]$/.test(prevSibling.tagName)) {
          return; // Don't add spacer between consecutive headers
        }
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

  // Extract misplaced list items (items that should be paragraphs, not list items)
  extractMisplacedListItems(processed);

  // Convert sequential single-item ordered lists to numbered headings
  convertListsToNumberedHeadings(processed);

  // Process Key Takeaways sections (remove <em>, normalize headings)
  // Explicitly pass mode to ensure it only runs in Shopify Blogs mode
  processKeyTakeaways(processed, 'shopify-blogs');

  // Remove any h1 elements after Key Takeaways sections
  // Explicitly pass mode to ensure it only runs in Shopify Blogs mode
  removeH1AfterKeyTakeaways(processed, 'shopify-blogs');

  // Remove <br> tags and empty <p> tags completely
  removeBrAndEmptyP(processed);

  // Remove empty headers (headers with no text content)
  removeEmptyHeaders(processed);

  // Split paragraphs containing section markers (Read also, Sources, etc.)
  splitSectionMarkers(processed);

  // Remove spaces/br after FAQ h2 headers
  // Explicitly pass mode to ensure it only runs in Shopify Blogs mode
  removeSpaceAfterFAQHeaders(processed, 'shopify-blogs');

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
  // Explicitly pass mode to ensure it only runs in Shopify Blogs mode
  if (!options.removeParagraphSpacers) {
    addParagraphSpacers(processed, 'shopify-blogs');
  }

  // Apply strong in headers (default: enabled for Shopify Blogs)
  const enableStrong = options.strongInHeaders !== false;
  applyStrongInHeaders(processed, enableStrong);

  // Handle spacer before sources section based on removeParagraphSpacers option
  handleSourcesSpacer(processed, options);

  // Remove spacers between consecutive paragraphs in ALL sections
  // This fixes the issue where spacers appear between paragraphs from input HTML
  // BUT preserve spacers before "Read also:" sections and before headers
  const allParagraphs = Array.from(processed.querySelectorAll('p'));
  
  allParagraphs.forEach(paragraph => {
    // Check if this is a spacer paragraph
    if (!isSpacerParagraph(paragraph)) {
      return; // Not a spacer, skip
    }
    
    // Get previous and next siblings
    const prevSibling = paragraph.previousElementSibling;
    const nextSibling = paragraph.nextElementSibling;
    
    // PRESERVE spacers before headers (structural purpose)
    if (nextSibling && /^H[1-6]$/.test(nextSibling.tagName)) {
      return; // Keep spacer before headers
    }
    
    // PRESERVE spacers before lists (structural purpose)
    if (nextSibling && (nextSibling.tagName === 'UL' || nextSibling.tagName === 'OL')) {
      return; // Keep spacer before lists
    }
    
    // PRESERVE spacers after lists (structural purpose - separates list from following content)
    if (prevSibling && (prevSibling.tagName === 'UL' || prevSibling.tagName === 'OL')) {
      return; // Keep spacer after lists
    }
    
    // PRESERVE spacers before tables (structural purpose)
    if (nextSibling && nextSibling.tagName === 'TABLE') {
      return; // Keep spacer before tables
    }
    
    // PRESERVE spacers after tables (structural purpose - separates table from following content)
    if (prevSibling && prevSibling.tagName === 'TABLE') {
      return; // Keep spacer after tables
    }
    
    // REMOVE spacers between two consecutive paragraphs (from input HTML)
    // BUT first check if the next paragraph is a special section label
    if (prevSibling && prevSibling.tagName === 'P' && !isSpacerParagraph(prevSibling) &&
        nextSibling && nextSibling.tagName === 'P' && !isSpacerParagraph(nextSibling)) {
      
      // Before removing, check if next paragraph is a special section label
      const nextText = nextSibling.textContent.trim();
      const normalizedNextText = nextText.toLowerCase().replace(/:\s*$/, '');
      
      // Check for "Read also:" type sections using scoring system (min score: 3)
      const readAlsoScore = scoreReadAlsoSection(nextSibling);
      const isReadSection = readAlsoScore >= 3;
      
      // Check for "Sources:", "References:", "Bibliography:" sections
      // Use STRICT regex only - .includes() is too broad and matches "resources", "reference" in regular text
      const isSourcesSection =
        /^(sources?|references?|bibliography|works?\s+cited|citations?|notes?|endnotes?|footnotes?)$/i.test(normalizedNextText);
      
      // Check for "Alt Image Text:" paragraphs
      // Pattern: starts with "alt" + whitespace + "image" + whitespace + "text" + optional ":"
      const isAltImageText = /^alt\s+image\s+text\s*:/i.test(nextText);
      
      // PRESERVE if next paragraph is a section label or Alt Image Text
      if (isReadSection || isSourcesSection || isAltImageText) {
        return; // Keep spacer before Read/Sources/Alt Image Text
      }
      
      // REMOVE spacer between two regular paragraphs
      paragraph.remove();
    }
  });

  // Apply optional features
  if (options.removeDomain) {
    removeDomainFromLinks(processed);
  }

  return processed;
}
