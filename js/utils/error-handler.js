/**
 * Error Handler Utility
 * Standardized error handling and logging
 */

/**
 * Check if we're in development mode
 * In production, we can check for a global flag or environment variable
 */
const isDevelopment = () => {
  // Check for development mode flag
  // In a real app, this might check process.env.NODE_ENV or a global config
  // For now, we'll assume development if no production flag is set
  return typeof window !== 'undefined' && !window.PRODUCTION_MODE;
};

/**
 * Handle processing errors with consistent formatting
 * @param {Error} error - Error object
 * @param {string} context - Additional context about where error occurred
 * @returns {string} - Formatted error message
 */
export function handleProcessingError(error, context = '') {
  const message = error.message || 'An unknown error occurred';
  const fullMessage = context ? `${context}: ${message}` : message;

  if (isDevelopment()) {
    console.error(fullMessage, error);
  }

  // In production, could send to error tracking service
  // Example: errorTrackingService.log(error, { context });

  return fullMessage;
}

/**
 * Log warning message (only in development)
 * @param {string} message - Warning message
 * @param {*} data - Optional data to log with warning
 */
export function logWarning(message, data = null) {
  if (isDevelopment()) {
    if (data) {
      console.warn(message, data);
    } else {
      console.warn(message);
    }
  }
}

/**
 * Log error message (only in development)
 * @param {string} message - Error message
 * @param {Error} error - Optional error object
 */
export function logError(message, error = null) {
  if (isDevelopment()) {
    if (error) {
      console.error(message, error);
    } else {
      console.error(message);
    }
  }
}

