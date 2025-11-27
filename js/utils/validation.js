/**
 * Validation Utilities
 * Centralized validation functions for input and data validation
 */

import { VALID_MODES } from './constants.js';

/**
 * Check if input is a valid non-empty HTML string
 * @param {*} input - Input to validate
 * @returns {boolean} - True if input is a non-empty string
 */
export function isValidHTMLString(input) {
  return typeof input === 'string' && input.trim().length > 0;
}

/**
 * Check if element is a valid HTMLElement
 * @param {*} element - Element to validate
 * @returns {boolean} - True if element is an HTMLElement
 */
export function isValidHTMLElement(element) {
  return element && element instanceof HTMLElement;
}

/**
 * Validate processing mode
 * @param {string} mode - Mode to validate
 * @returns {boolean} - True if mode is valid
 */
export function isValidMode(mode) {
  return typeof mode === 'string' && VALID_MODES.includes(mode);
}

/**
 * Validate options object structure
 * @param {*} options - Options object to validate
 * @returns {Object} - Validated and normalized options object
 */
export function isValidOptions(options) {
  // Ensure options is an object
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    return {};
  }

  // Return normalized options with defaults
  return {
    strongInHeaders: options.strongInHeaders === true,
    removeDomain: options.removeDomain === true,
    normalizeWhitespace: options.normalizeWhitespace === true,
    displayImages: options.displayImages === true,
    removeParagraphSpacers: options.removeParagraphSpacers === true,
    addSpacerBeforeReadSections: options.addSpacerBeforeReadSections === true,
    addSpacerBeforeSources: options.addSpacerBeforeSources === true,
    baseDomain: typeof options.baseDomain === 'string' ? options.baseDomain : null,
  };
}

/**
 * Check if element is a spacer paragraph (<p>&nbsp;</p>)
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} - True if element is a spacer paragraph
 */
export function isSpacerParagraph(element) {
  return (
    element &&
    element.tagName === 'P' &&
    element.innerHTML.trim() === '&nbsp;' &&
    !element.hasAttributes()
  );
}

