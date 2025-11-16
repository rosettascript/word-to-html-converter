/**
 * Mode Selector UI
 * Handles mode selection (Regular, Shopify Blogs, Shopify Shoppables)
 */

import { updateMode } from './converter-ui.js';
import { updateFeatureVisibility } from './feature-toggles.js';

/**
 * Set up mode selector
 */
export function setupModeSelector() {
  const modeSelect = document.getElementById('mode-select');
  
  if (!modeSelect) {
    console.error('Mode selector not found');
    return;
  }
  
  modeSelect.addEventListener('change', (e) => {
    const selectedMode = e.target.value;
    updateMode(selectedMode);
    
    // Update feature visibility based on mode
    updateFeatureVisibility(selectedMode);
  });
  
  // Set initial visibility for default mode
  updateFeatureVisibility(modeSelect.value);
}


