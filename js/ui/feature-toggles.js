/**
 * Feature Toggles UI
 * Handles optional feature checkboxes
 */

import { updateOptions } from './converter-ui.js';

/**
 * Set up feature toggles
 */
export function setupFeatureToggles() {
  const strongInHeaders = document.getElementById('strong-in-headers');
  const removeDomain = document.getElementById('remove-domain');
  const removeParagraphSpacers = document.getElementById('remove-paragraph-spacers');
  const baseDomainInput = document.getElementById('base-domain');
  const domainInputWrapper = document.querySelector('.domain-input-wrapper');
  
  // Get parent elements for show/hide control
  const strongInHeadersWrapper = strongInHeaders?.parentElement;
  const removeDomainWrapper = removeDomain?.parentElement;
  const removeParagraphSpacersWrapper = removeParagraphSpacers?.parentElement;
  
  // Strong in Headers
  if (strongInHeaders) {
    strongInHeaders.addEventListener('change', (e) => {
      updateOptions({ strongInHeaders: e.target.checked });
    });
  }
  
  // Remove Domain (automatic detection)
  if (removeDomain) {
    removeDomain.addEventListener('change', (e) => {
      updateOptions({ removeDomain: e.target.checked });
      // Domain input field stays hidden - automatic detection
    });
  }
  
  // Remove Paragraph Spacers (Shopify Blogs only)
  if (removeParagraphSpacers) {
    removeParagraphSpacers.addEventListener('change', (e) => {
      updateOptions({ removeParagraphSpacers: e.target.checked });
    });
  }
  
  // Base Domain Input (debounced)
  if (baseDomainInput) {
    let domainTimeout;
    baseDomainInput.addEventListener('input', (e) => {
      clearTimeout(domainTimeout);
      domainTimeout = setTimeout(() => {
        updateOptions({ baseDomain: e.target.value });
      }, 500);
    });
  }
  
}

/**
 * Update feature toggles visibility based on selected mode
 * @param {string} mode - Selected output mode
 */
export function updateFeatureVisibility(mode) {
  const strongInHeaders = document.getElementById('strong-in-headers');
  const removeDomain = document.getElementById('remove-domain');
  const removeParagraphSpacers = document.getElementById('remove-paragraph-spacers');
  
  const strongInHeadersWrapper = strongInHeaders?.parentElement;
  const removeDomainWrapper = removeDomain?.parentElement;
  const removeParagraphSpacersWrapper = removeParagraphSpacers?.parentElement;
  
  // Regular Mode: Hide all optional features except global ones
  if (mode === 'regular') {
    if (strongInHeadersWrapper) {
      strongInHeadersWrapper.classList.add('feature-hidden');
      strongInHeadersWrapper.classList.remove('feature-visible');
    }
    if (removeDomainWrapper) {
      removeDomainWrapper.classList.add('feature-hidden');
      removeDomainWrapper.classList.remove('feature-visible');
    }
    if (removeParagraphSpacersWrapper) {
      removeParagraphSpacersWrapper.classList.add('feature-hidden');
      removeParagraphSpacersWrapper.classList.remove('feature-visible');
    }
    
    // Uncheck all and update options
    if (strongInHeaders) {
      strongInHeaders.checked = false;
      updateOptions({ strongInHeaders: false });
    }
    if (removeDomain) {
      removeDomain.checked = false;
      updateOptions({ removeDomain: false });
    }
    if (removeParagraphSpacers) {
      removeParagraphSpacers.checked = true; // Default to true (remove spacers)
      updateOptions({ removeParagraphSpacers: true });
    }
  }
  
  // Shopify Blogs Mode: Show all Shopify Blogs features
  else if (mode === 'shopify-blogs') {
    if (strongInHeadersWrapper) {
      strongInHeadersWrapper.classList.remove('feature-hidden');
      strongInHeadersWrapper.classList.add('feature-visible');
    }
    if (removeDomainWrapper) {
      removeDomainWrapper.classList.remove('feature-hidden');
      removeDomainWrapper.classList.add('feature-visible');
    }
    if (removeParagraphSpacersWrapper) {
      removeParagraphSpacersWrapper.classList.remove('feature-hidden');
      removeParagraphSpacersWrapper.classList.add('feature-visible');
    }
    
    // Default: strong in headers ON for Shopify Blogs
    if (strongInHeaders) {
      strongInHeaders.checked = true;
      updateOptions({ strongInHeaders: true });
    }
    // Reset remove domain based on current state
    if (removeDomain) {
      updateOptions({ removeDomain: removeDomain.checked });
    }
    // Default: remove paragraph spacers OFF (unchecked) for Shopify Blogs - keep spacers
    if (removeParagraphSpacers) {
      removeParagraphSpacers.checked = false;
      updateOptions({ removeParagraphSpacers: false });
    }
  }
  
  // Shopify Shoppables Mode: Show strong in headers and remove domain only
  else if (mode === 'shopify-shoppables') {
    if (strongInHeadersWrapper) {
      strongInHeadersWrapper.classList.remove('feature-hidden');
      strongInHeadersWrapper.classList.add('feature-visible');
    }
    if (removeDomainWrapper) {
      removeDomainWrapper.classList.remove('feature-hidden');
      removeDomainWrapper.classList.add('feature-visible');
    }
    if (removeParagraphSpacersWrapper) {
      removeParagraphSpacersWrapper.classList.add('feature-hidden');
      removeParagraphSpacersWrapper.classList.remove('feature-visible');
    }
    
    // Default: strong in headers ON for Shopify Shoppables
    if (strongInHeaders) {
      strongInHeaders.checked = true;
      updateOptions({ strongInHeaders: true });
    }
    // Reset remove domain based on current state
    if (removeDomain) {
      updateOptions({ removeDomain: removeDomain.checked });
    }
    // Hide and reset paragraph spacers option
    if (removeParagraphSpacers) {
      removeParagraphSpacers.checked = true; // Default to true (remove spacers)
      updateOptions({ removeParagraphSpacers: true });
    }
  }
}


