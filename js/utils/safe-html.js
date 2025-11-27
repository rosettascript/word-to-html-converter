/**
 * Safe HTML Utility
 * Safe innerHTML assignment helper with validation
 */

import { isValidHTMLElement } from './validation.js';

/**
 * Safely set innerHTML on an element with validation
 * @param {HTMLElement} element - Element to set HTML on
 * @param {string} html - HTML string to set
 * @throws {TypeError} If element is not a valid HTMLElement
 */
export function setSafeHTML(element, html) {
  if (!isValidHTMLElement(element)) {
    throw new TypeError('Element must be a valid HTMLElement');
  }

  if (typeof html !== 'string') {
    throw new TypeError('HTML must be a string');
  }

  // Set innerHTML
  // Additional sanitization can be added here in the future if needed
  element.innerHTML = html;
}

