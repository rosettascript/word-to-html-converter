/**
 * Toast Notification UI
 * Shows temporary notification messages
 */

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast: 'success', 'error', 'warning'
 * @param {number} duration - Duration in milliseconds (default: 2000)
 */
export function showToast(message, type = 'success', duration = 2000) {
  const toast = document.getElementById('toast');

  if (!toast) {
    console.warn('Toast element not found');
    return;
  }

  // Set message
  toast.textContent = message;

  // Set background color based on type
  if (type === 'error') {
    toast.style.background = '#D4A574'; // error color
  } else if (type === 'warning') {
    toast.style.background = '#D4B5A8'; // warning color
  } else {
    toast.style.background = '#9FB8AD'; // success color
  }

  // Show toast
  toast.classList.add('show');

  // Hide after duration
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}
