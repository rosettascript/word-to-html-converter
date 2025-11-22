/**
 * Core HTML Processor
 * Main entry point for HTML cleaning and processing
 */

import { sanitizeHTML } from './sanitizer.js';
import { processRegularMode } from '../modes/regular-mode.js';
import { processShopifyBlogsMode } from '../modes/shopify-blogs-mode.js';
import { processShopifyShoppablesMode } from '../modes/shopify-shoppables-mode.js';

/**
 * Process HTML based on selected mode and options
 * @param {string} inputHTML - Raw HTML from Word
 * @param {string} mode - Output mode: 'regular', 'shopify-blogs', 'shopify-shoppables'
 * @param {Object} options - Optional features
 * @param {boolean} options.strongInHeaders - Wrap header content in <strong>
 * @param {boolean} options.removeDomain - Remove domain from internal links
 * @param {boolean} options.normalizeWhitespace - Normalize whitespace
 * @param {boolean} options.displayImages - Display images in preview (output never includes images)
 * @param {string} options.baseDomain - Base domain for internal link detection
 * @returns {string} - Cleaned HTML
 */
export function processHTML(inputHTML, mode = 'regular', options = {}) {
  // Return empty string if no input
  if (!inputHTML || inputHTML.trim() === '') {
    return '';
  }

  try {
    // Step 1: Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(inputHTML, 'text/html');

    // Check for parse errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Unable to parse HTML. Please check your input for errors.');
    }

    // Step 2: Base sanitization (remove dangerous elements, strip styles, etc.)
    const sanitized = sanitizeHTML(doc.body);

    // Step 3: Mode-specific processing
    let processed;
    switch (mode) {
      case 'shopify-blogs':
        processed = processShopifyBlogsMode(sanitized, options);
        break;
      case 'shopify-shoppables':
        processed = processShopifyShoppablesMode(sanitized, options);
        break;
      case 'regular':
      default:
        processed = processRegularMode(sanitized, options);
        break;
    }

    // Step 4: Return cleaned HTML
    return processed.innerHTML;
  } catch (error) {
    console.error('Processing error:', error);
    throw error;
  }
}
