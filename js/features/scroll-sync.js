/**
 * Scroll Sync Feature
 * Synchronizes scrolling between input and output panels based on content matching
 * rather than percentage to handle different content heights (e.g., images in input)
 */

export function initializeScrollSync(inputPanel, outputPanel, previewFrame) {
  let isEnabled = false;
  let isSyncing = false; // Prevent infinite loop when panels sync each other
  
  /**
   * Get the element currently visible at the top of a panel
   */
  function getElementAtTop(panel) {
    const rect = panel.getBoundingClientRect();
    const topY = rect.top + 10; // Offset slightly from the very top
    
    // Get all elements in the panel
    const elements = Array.from(panel.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote'));
    
    // Find the element at or near the top
    for (const element of elements) {
      const elementRect = element.getBoundingClientRect();
      if (elementRect.top >= topY - 50 && elementRect.top <= topY + 50) {
        return element;
      }
    }
    
    // Fallback: return first visible element
    return elements.find(el => {
      const elementRect = el.getBoundingClientRect();
      return elementRect.top >= rect.top && elementRect.bottom > rect.top;
    }) || elements[0];
  }
  
  /**
   * Find matching element in target panel by text content
   */
  function findMatchingElement(targetPanel, sourceElement) {
    if (!sourceElement) return null;
    
    const tagName = sourceElement.tagName.toLowerCase();
    const textContent = sourceElement.textContent.trim();
    
    // Strategy 1: Match by tag + exact text (for headings)
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      const candidates = targetPanel.querySelectorAll(tagName);
      for (const candidate of candidates) {
        if (candidate.textContent.trim() === textContent) {
          return candidate;
        }
      }
    }
    
    // Strategy 2: Match by text snippet (first 50 chars)
    const textSnippet = textContent.substring(0, 50);
    if (textSnippet.length > 10) {
      const candidates = targetPanel.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote');
      for (const candidate of candidates) {
        const candidateText = candidate.textContent.trim().substring(0, 50);
        if (candidateText === textSnippet) {
          return candidate;
        }
      }
    }
    
    // Strategy 3: Fuzzy match (contains similar text)
    if (textSnippet.length > 20) {
      const candidates = targetPanel.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
      for (const candidate of candidates) {
        const candidateText = candidate.textContent.trim();
        if (candidateText.includes(textSnippet.substring(0, 30))) {
          return candidate;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Get scroll percentage as fallback
   */
  function getScrollPercentage(panel) {
    if (panel.scrollHeight <= panel.clientHeight) return 0;
    return panel.scrollTop / (panel.scrollHeight - panel.clientHeight);
  }
  
  /**
   * Set scroll position by percentage
   */
  function scrollToPercentage(panel, percentage) {
    const maxScroll = panel.scrollHeight - panel.clientHeight;
    panel.scrollTop = maxScroll * percentage;
  }
  
  /**
   * Sync scroll from source to target panel
   */
  function syncScroll(sourcePanel, targetPanel) {
    if (!isEnabled || isSyncing) return;
    
    isSyncing = true;
    
    try {
      // Get visible element at top of source
      const visibleElement = getElementAtTop(sourcePanel);
      
      if (visibleElement) {
        // Try to find matching element in target
        const matchingElement = findMatchingElement(targetPanel, visibleElement);
        
        if (matchingElement) {
          // Scroll to matching element (content-based sync)
          matchingElement.scrollIntoView({ 
            block: 'start', 
            behavior: 'smooth',
            inline: 'nearest'
          });
        } else {
          // Fallback: use percentage-based sync
          const percentage = getScrollPercentage(sourcePanel);
          scrollToPercentage(targetPanel, percentage);
        }
      }
    } catch (error) {
      console.warn('Scroll sync error:', error);
    }
    
    // Reset sync flag after animation
    setTimeout(() => {
      isSyncing = false;
    }, 100);
  }
  
  /**
   * Handle scroll event for input panel
   */
  function onInputScroll() {
    if (!isEnabled) return;
    
    // Check which output view is active
    const outputCodeView = document.getElementById('output-code-view');
    const previewFrame = document.getElementById('preview-frame');
    const previewVisible = previewFrame && previewFrame.style.display !== 'none';
    
    if (previewVisible && previewFrame.contentDocument) {
      // Sync with preview frame
      const previewBody = previewFrame.contentDocument.body;
      if (previewBody) {
        syncScroll(inputPanel, previewBody);
      }
    } else if (outputCodeView) {
      // Sync with code view (limited - just use percentage)
      const percentage = getScrollPercentage(inputPanel);
      scrollToPercentage(outputCodeView.parentElement, percentage);
    }
  }
  
  /**
   * Handle scroll event for output panel
   */
  function onOutputScroll() {
    if (!isEnabled) return;
    
    const outputCodeView = document.getElementById('output-code-view');
    const previewFrame = document.getElementById('preview-frame');
    const previewVisible = previewFrame && previewFrame.style.display !== 'none';
    
    if (previewVisible && previewFrame.contentDocument) {
      // Sync from preview to input
      const previewBody = previewFrame.contentDocument.body;
      if (previewBody) {
        syncScroll(previewBody, inputPanel);
      }
    } else if (outputCodeView) {
      // Sync from code view to input (percentage-based)
      const outputContainer = outputCodeView.parentElement;
      const percentage = getScrollPercentage(outputContainer);
      scrollToPercentage(inputPanel, percentage);
    }
  }
  
  // Debounce scroll events for performance
  let inputScrollTimeout;
  let outputScrollTimeout;
  
  function debouncedInputScroll() {
    clearTimeout(inputScrollTimeout);
    inputScrollTimeout = setTimeout(onInputScroll, 50);
  }
  
  function debouncedOutputScroll() {
    clearTimeout(outputScrollTimeout);
    outputScrollTimeout = setTimeout(onOutputScroll, 50);
  }
  
  // Add scroll listeners
  inputPanel.addEventListener('scroll', debouncedInputScroll);
  
  const outputCodeView = document.getElementById('output-code-view');
  if (outputCodeView) {
    outputCodeView.parentElement.addEventListener('scroll', debouncedOutputScroll);
  }
  
  // Listen for preview frame changes
  if (previewFrame) {
    previewFrame.addEventListener('load', () => {
      if (previewFrame.contentDocument && previewFrame.contentDocument.body) {
        previewFrame.contentDocument.body.addEventListener('scroll', debouncedOutputScroll);
      }
    });
  }
  
  /**
   * Enable/disable scroll sync
   */
  function setEnabled(enabled) {
    isEnabled = enabled;
  }
  
  /**
   * Check if scroll sync is enabled
   */
  function getEnabled() {
    return isEnabled;
  }
  
  return {
    setEnabled,
    getEnabled
  };
}

