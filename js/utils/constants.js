/**
 * Constants
 * Centralized configuration values and magic numbers
 */

/**
 * Debounce delay for input processing (milliseconds)
 */
export const DEBOUNCE_DELAY_MS = 500;

/**
 * Threshold for large document warnings (bytes)
 * Documents larger than this may take longer to process
 */
export const LARGE_DOCUMENT_THRESHOLD = 100 * 1024; // 100KB

/**
 * Maximum size for syntax highlighting (bytes)
 * Content larger than this will skip highlighting to prevent UI freezing
 */
export const MAX_HIGHLIGHT_SIZE = 500 * 1024; // 500KB

/**
 * Default indentation size for HTML formatting (spaces)
 */
export const DEFAULT_INDENT_SIZE = 4;

/**
 * Performance warning threshold (milliseconds)
 * Operations taking longer than this will log a warning
 */
export const PERFORMANCE_WARNING_THRESHOLD_MS = 100;

/**
 * Valid processing modes
 */
export const VALID_MODES = ['regular', 'shopify-blogs', 'shopify-shoppables'];

