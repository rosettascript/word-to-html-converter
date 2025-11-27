/**
 * Debounce Utility
 * Delays function execution until after a specified delay
 */

import { DEBOUNCE_DELAY_MS } from './constants.js';

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds (defaults to DEBOUNCE_DELAY_MS)
 * @returns {Function} - Debounced function with cancel method
 */
export function debounce(func, delay = DEBOUNCE_DELAY_MS) {
  let timeoutId;

  const debounced = function debouncedFunction(...args) {
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = null;
    }, delay);
  };

  /**
   * Cancel the debounced function
   * Clears any pending timeout
   */
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}
