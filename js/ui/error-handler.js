/**
 * Error Handler UI
 * Displays error messages to users
 */

/**
 * Show error message
 * @param {string} message - Error message to display
 */
export function showError(message) {
  const errorDisplay = document.getElementById('error-display');

  if (errorDisplay) {
    errorDisplay.textContent = message;
    errorDisplay.style.display = 'block';

    // Announce to screen readers
    errorDisplay.setAttribute('role', 'alert');
  }
}

/**
 * Clear error message
 */
export function clearError() {
  const errorDisplay = document.getElementById('error-display');

  if (errorDisplay) {
    errorDisplay.textContent = '';
    errorDisplay.style.display = 'none';
  }
}
