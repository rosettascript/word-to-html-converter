/**
 * Main Entry Point
 * Initializes the Word to HTML Converter application
 */

import { setupConverterUI } from './ui/converter-ui.js';
import { setupModeSelector } from './ui/mode-selector.js';
import { setupFeatureToggles } from './ui/feature-toggles.js';
import { setupPreviewToggle } from './ui/preview-toggle.js';
import { setupCopyDownload } from './ui/copy-download.js';
import { processHTML } from './core/processor.js';

/**
 * Initialize the application
 */
function init() {
  console.log('🚀 Word to HTML Converter initialized');
  
  // Set up UI components
  setupConverterUI({ onProcess: handleProcess });
  setupModeSelector();
  setupFeatureToggles();
  setupPreviewToggle();
  setupCopyDownload();
  
  // Set up FAQ accordion interactions
  setupFAQAccordion();
  
  console.log('✅ All components ready');
}

/**
 * Handle HTML processing
 * @param {string} inputHTML - The HTML to process
 * @param {string} mode - The output mode (regular, shopify-blogs, shopify-shoppables)
 * @param {Object} options - Optional feature flags
 * @returns {string} - Cleaned HTML
 */
function handleProcess(inputHTML, mode, options) {
  try {
    // Call the main processor
    const cleanedHTML = processHTML(inputHTML, mode, options);
    return cleanedHTML;
  } catch (error) {
    console.error('Processing error:', error);
    throw error;
  }
}

/**
 * Set up FAQ accordion interactions
 * (Optional enhancement for smooth animations)
 */
function setupFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    item.addEventListener('toggle', (e) => {
      if (e.target.open) {
        // Close other open items (optional: accordion behavior)
        // faqItems.forEach(other => {
        //   if (other !== e.target && other.open) {
        //     other.open = false;
        //   }
        // });
      }
    });
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
