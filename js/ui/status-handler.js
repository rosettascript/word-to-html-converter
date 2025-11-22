/**
 * Status Handler UI
 * Displays processing status messages
 */

/**
 * Update status message
 * @param {string} message - Status message
 * @param {string} type - Status type: 'idle', 'processing', 'success', 'error'
 */
export function updateStatus(message, type = 'idle') {
  const statusElement = document.getElementById('status-message');

  if (statusElement) {
    statusElement.textContent = message;

    // Remove all status classes
    statusElement.classList.remove('processing', 'success', 'error');

    // Add current status class
    if (type !== 'idle') {
      statusElement.classList.add(type);
    }
  }
}
