/**
 * Converter UI
 * Handles the main converter interface: input, output, debouncing
 */

import { debounce } from '../utils/debounce.js';
import { showError, clearError } from './error-handler.js';
import { updateStatus } from './status-handler.js';
import { formatHTML, applySyntaxHighlighting } from '../utils/html-formatter.js';
import { fixOrphanedListItems } from '../features/fix-orphaned-list-items.js';
import { isPreviewModeActive } from './preview-toggle.js';
import {
  LARGE_DOCUMENT_THRESHOLD,
  PERFORMANCE_WARNING_THRESHOLD_MS,
  DEFAULT_INDENT_SIZE,
} from '../utils/constants.js';
import { handleProcessingError, logWarning } from '../utils/error-handler.js';
import { setSafeHTML } from '../utils/safe-html.js';

let processCallback = null;
let currentMode = 'regular';
let currentOptions = {};
let lastCleanedHTML = ''; // Store last cleaned HTML for lazy preview loading
let isOptionChange = false; // Track if reprocess is due to option change

// Cache for frequently accessed DOM elements
let cachedElements = null;

/**
 * Get cached DOM elements
 * @returns {Object} - Object with cached element references
 */
function getCachedElements() {
  if (!cachedElements) {
    cachedElements = {
      outputCode: document.getElementById('output-html'),
      previewFrame: document.getElementById('preview-frame'),
      outputView: document.getElementById('output-code-view'),
      codeView: document.getElementById('output-code-view'),
      spinner: document.getElementById('processing-spinner'),
    };
  }
  return cachedElements;
}

/**
 * Clear cached DOM elements (useful if DOM structure changes)
 */
function clearCachedElements() {
  cachedElements = null;
}

/**
 * Set up the converter UI
 * @param {Object} config - Configuration
 * @param {Function} config.onProcess - Callback function to process HTML
 */
export function setupConverterUI({ onProcess }) {
  processCallback = onProcess;

  const inputDiv = document.getElementById('input-html');
  const outputCode = document.getElementById('output-html');
  const clearButton = document.getElementById('clear-input');
  const charCount = document.getElementById('input-char-count');

  if (!inputDiv || !outputCode) {
    handleProcessingError(new Error('Required elements not found'), 'UI setup');
    return;
  }

  // Initialize cached elements
  getCachedElements();

  // Function to update placeholder visibility
  function updatePlaceholder() {
    const hasContent = inputDiv.innerHTML.trim() !== '' && inputDiv.textContent.trim() !== '';
    if (hasContent) {
      inputDiv.classList.remove('has-placeholder');
    } else {
      inputDiv.classList.add('has-placeholder');
    }
  }

  // Set up paste handling
  inputDiv.addEventListener('paste', e => {
    e.preventDefault();

    try {
      // Get HTML from clipboard
      const html = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');

      if (html) {
        // Strip all inline styles from the HTML for display
        const cleanedForDisplay = stripInlineStyles(html);

        // Display the cleaned HTML rendered in the input
        setSafeHTML(inputDiv, cleanedForDisplay);

        // Update placeholder visibility
        updatePlaceholder();

        // Clean whitespace from anchor tags in the input display
        const anchors = inputDiv.querySelectorAll('a');
        anchors.forEach(anchor => {
          const originalText = anchor.textContent;
          const trimmedText = originalText.trim();

          if (!trimmedText) return;

          // Check if original had leading/trailing spaces
          const hadLeadingSpace = /^\s/.test(originalText);
          const hadTrailingSpace = /\s$/.test(originalText);

          // Set the cleaned text (no spaces inside anchor)
          anchor.textContent = trimmedText;

          // Move leading space OUTSIDE to previous sibling or create new text node
          if (hadLeadingSpace) {
            const prevSibling = anchor.previousSibling;
            if (prevSibling && prevSibling.nodeType === Node.TEXT_NODE) {
              // Add space to end of previous text node if it doesn't have one
              if (!/\s$/.test(prevSibling.textContent)) {
                prevSibling.textContent = prevSibling.textContent + ' ';
              }
            } else {
              // Create a new text node with space before the anchor
              anchor.parentNode.insertBefore(document.createTextNode(' '), anchor);
            }
          }

          // Move trailing space OUTSIDE to next sibling or create new text node
          if (hadTrailingSpace) {
            const nextSibling = anchor.nextSibling;
            if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
              // Add space to start of next text node if it doesn't have one
              if (!/^\s/.test(nextSibling.textContent)) {
                nextSibling.textContent = ' ' + nextSibling.textContent;
              }
            } else {
              // Create a new text node with space after the anchor
              anchor.parentNode.insertBefore(document.createTextNode(' '), anchor.nextSibling);
            }
          }
        });

        // Remove <br> tags inside list items (invalid HTML)
        const listItems = inputDiv.querySelectorAll('li');
        listItems.forEach(li => {
          const brTags = li.querySelectorAll('br');
          brTags.forEach(br => br.remove());
        });

        // Fix orphaned list items in input display
        fixOrphanedListItems(inputDiv);

        // Update character count (text only)
        const textContent = inputDiv.textContent || inputDiv.innerText || '';
        updateCharCount(textContent, charCount);

        // Process the ORIGINAL HTML (with styles) for output
        isOptionChange = false; // New content, not option change
        processInputHTML(html);
      }
    } catch (error) {
      handleProcessingError(error, 'Paste handling error');
      showError('Unable to process pasted content. Please try again or check the HTML format.');
      updateStatus('Paste failed', 'error');
    }
  });

  // Set up manual input detection (in case user types or content changes)
  const debouncedProcess = debounce(() => {
    const html = inputDiv.innerHTML;
    if (html && html.trim() !== '') {
      isOptionChange = false; // New content, not option change
      processInputHTML(html);
    }
  }, 500);

  // Listen for any content changes
  const observer = new MutationObserver(() => {
    const textContent = inputDiv.textContent || inputDiv.innerText || '';
    updateCharCount(textContent, charCount);

    // Update placeholder visibility
    updatePlaceholder();

    // Check if instant processing is disabled
    const disableInstant = document.getElementById('disable-instant')?.checked;

    if (!disableInstant && inputDiv.innerHTML.trim() !== '') {
      updateStatus('Processing...', 'processing');
      debouncedProcess();
    }
  });

  observer.observe(inputDiv, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Clear button
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      setSafeHTML(inputDiv, '');
      if (outputCode) outputCode.textContent = '';
      updateCharCount('', charCount);
      clearError();
      updateStatus('', 'idle');
      updatePlaceholder();

      // Clear preview frame
      const elements = getCachedElements();
      if (elements.previewFrame) {
        elements.previewFrame.srcdoc = '';
      }

      // Clear stored cleaned HTML
      lastCleanedHTML = '';
    });
  }

  // Initial state
  updateCharCount('', charCount);
  updatePlaceholder();

  // Toolbar collapse toggle (mobile)
  const toolbar = document.querySelector('.converter-toolbar');
  const toolbarToggle = document.getElementById('toolbar-toggle');
  if (toolbar && toolbarToggle) {
    // Start collapsed on small screens
    function setInitialToolbarState() {
      if (window.matchMedia('(max-width: 1023px)').matches) {
        toolbar.classList.add('collapsed');
        toolbarToggle.setAttribute('aria-expanded', 'false');
      } else {
        toolbar.classList.remove('collapsed');
        toolbarToggle.setAttribute('aria-expanded', 'true');
      }
    }

    setInitialToolbarState();
    window.addEventListener('resize', setInitialToolbarState);

    toolbarToggle.addEventListener('click', () => {
      const isCollapsed = toolbar.classList.toggle('collapsed');
      // Toggle explicit expanded state for accessibility
      toolbarToggle.setAttribute('aria-expanded', (!isCollapsed).toString());
      // Mark toolbar expanded class when open
      if (!isCollapsed) toolbar.classList.add('expanded');
      else toolbar.classList.remove('expanded');
    });
  }

  // Listen for preview-requested event (when user switches to preview mode)
  document.addEventListener('preview-requested', () => {
    if (lastCleanedHTML) {
      renderPreview(lastCleanedHTML);
    }
  });

  // Listen for theme changes to update preview if active
  document.addEventListener('theme-changed', () => {
    if (isPreviewModeActive() && lastCleanedHTML) {
      renderPreview(lastCleanedHTML);
    }
  });
}

/**
 * Render preview with cleaned HTML
 * @param {string} cleanedHTML - Cleaned HTML to render
 */
function renderPreview(cleanedHTML) {
  const elements = getCachedElements();
  const previewFrame = elements.previewFrame;
  if (previewFrame && isPreviewModeActive()) {
    // Capture isOptionChange in closure (before it might be reset)
    const shouldPreserveScroll = isOptionChange;
    
    // Capture preview scroll position before updating (for option changes)
    let savedPreviewScrollTop = 0;
    let savedPreviewScrollLeft = 0;
    if (shouldPreserveScroll && previewFrame.contentWindow) {
      try {
        savedPreviewScrollTop = previewFrame.contentWindow.scrollY || previewFrame.contentWindow.pageYOffset || 0;
        savedPreviewScrollLeft = previewFrame.contentWindow.scrollX || previewFrame.contentWindow.pageXOffset || 0;
      } catch (e) {
        // Cross-origin or not accessible
      }
    }
    
    const styledHTML = addPreviewStyles(cleanedHTML);
    previewFrame.srcdoc = styledHTML;
    // Scroll to top when content loads (only if NOT an option change)
    previewFrame.onload = () => {
      if (previewFrame.contentWindow) {
        if (shouldPreserveScroll) {
          // Restore scroll position for option changes - use setTimeout to ensure DOM is ready
          setTimeout(() => {
            previewFrame.contentWindow.scrollTo(savedPreviewScrollLeft, savedPreviewScrollTop);
          }, 0);
        } else {
          // Scroll to top for new content
          previewFrame.contentWindow.scrollTo(0, 0);
        }
      }
    };
  }
}

/**
 * Process input HTML
 * @param {string} inputHTML - Input HTML to process
 */
function processInputHTML(inputHTML) {
  const elements = getCachedElements();
  const { outputCode, previewFrame, outputView, spinner } = elements;

  if (!inputHTML || inputHTML.trim() === '') {
    if (outputView) outputView.removeAttribute('aria-busy');
    if (outputCode) outputCode.textContent = '';
    if (previewFrame) {
      previewFrame.srcdoc = '';
    }
    clearError();
    updateStatus('', 'idle');
    return;
  }

  // Show DOM spinner (if present)
  if (spinner) spinner.classList.add('show');

  try {
    // Mark output as busy for screen readers and show processing status
    if (outputView) outputView.setAttribute('aria-busy', 'true');
    updateStatus('Processing...', 'processing');

    // Call the processor
    const cleanedHTML = processCallback(inputHTML, currentMode, currentOptions);

    // Performance monitoring for large content
    const startTime = performance.now();

    // Format HTML with proper indentation
    const formattedHTML = formatHTML(cleanedHTML, DEFAULT_INDENT_SIZE);

    // Escape HTML for display
    const escapedHTML = escapeHTML(formattedHTML);

    // Apply syntax highlighting (with performance optimization)
    const highlightedHTML = applySyntaxHighlighting(escapedHTML);

    // Log performance for large content
    const duration = performance.now() - startTime;
    if (cleanedHTML.length > LARGE_DOCUMENT_THRESHOLD && duration > PERFORMANCE_WARNING_THRESHOLD_MS) {
      logWarning(
        `Syntax highlighting took ${duration.toFixed(2)}ms for ${(cleanedHTML.length / 1024).toFixed(2)}KB content`
      );
    }

    // Capture scroll position BEFORE DOM update (for option changes)
    const codeView = elements.codeView;
    const savedScrollTop = codeView && isOptionChange ? codeView.scrollTop : 0;
    const savedScrollLeft = codeView && isOptionChange ? codeView.scrollLeft : 0;

    // Update output (use safe innerHTML for syntax highlighting)
    if (outputCode) {
      setSafeHTML(outputCode, highlightedHTML);
    }

    // Scroll code view to top after content is rendered (only if NOT an option change)
    if (codeView) {
      if (isOptionChange) {
        // Preserve scroll position for option changes
        // Use double requestAnimationFrame to ensure DOM is fully updated and layout is complete
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            codeView.scrollTop = savedScrollTop;
            codeView.scrollLeft = savedScrollLeft;
          });
        });
      } else {
        // Scroll to top for new content
        // Use double requestAnimationFrame to ensure DOM is fully updated and layout is complete
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            codeView.scrollTop = 0;
            codeView.scrollLeft = 0;
          });
        });
      }
    }

    // Store cleaned HTML for lazy preview loading
    lastCleanedHTML = cleanedHTML;

    // Update preview only if preview mode is currently active
    if (previewFrame && isPreviewModeActive()) {
      // Capture isOptionChange in closure (before it might be reset)
      const shouldPreserveScroll = isOptionChange;
      
      // Capture preview scroll position before updating (for option changes)
      let savedPreviewScrollTop = 0;
      let savedPreviewScrollLeft = 0;
      if (shouldPreserveScroll && previewFrame.contentWindow) {
        try {
          savedPreviewScrollTop = previewFrame.contentWindow.scrollY || previewFrame.contentWindow.pageYOffset || 0;
          savedPreviewScrollLeft = previewFrame.contentWindow.scrollX || previewFrame.contentWindow.pageXOffset || 0;
        } catch (e) {
          // Cross-origin or not accessible
        }
      }
      
      const styledHTML = addPreviewStyles(cleanedHTML);
      previewFrame.srcdoc = styledHTML;
      // Scroll to top when content loads (only if NOT an option change)
      previewFrame.onload = () => {
        if (previewFrame.contentWindow) {
          if (shouldPreserveScroll) {
            // Restore scroll position for option changes - use setTimeout to ensure DOM is ready
            setTimeout(() => {
              previewFrame.contentWindow.scrollTo(savedPreviewScrollLeft, savedPreviewScrollTop);
            }, 0);
          } else {
            // Scroll to top for new content
            previewFrame.contentWindow.scrollTo(0, 0);
          }
        }
      };
    }

    clearError();
    updateStatus('HTML cleaned successfully', 'success');
    if (outputView) outputView.removeAttribute('aria-busy');
    if (spinner) spinner.classList.remove('show');
    
    // Reset flag after processing
    isOptionChange = false;
  } catch (error) {
    handleProcessingError(error, 'HTML processing');
    showError(error.message || 'Unable to parse HTML. Please check your input for errors.');
    updateStatus('Processing failed', 'error');
    if (outputView) outputView.removeAttribute('aria-busy');
    if (spinner) spinner.classList.remove('show');
  }
}

/**
 * Escape HTML for display
 * @param {string} html - HTML to escape
 * @returns {string} - Escaped HTML
 */
function escapeHTML(html) {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strip inline styles from HTML but preserve bold/italic formatting
 * Converts inline bold/italic styles to proper semantic tags
 * @param {string} html - HTML content with inline styles
 * @returns {string} - HTML without inline styles but with semantic tags
 */
function stripInlineStyles(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // First, convert inline styled bold/italic to semantic tags
  // Process in reverse order to handle nested elements correctly
  const allElements = Array.from(tempDiv.querySelectorAll('*')).reverse();

  allElements.forEach(el => {
    const style = el.getAttribute('style');
    if (!style) return;

    const isBold = /font-weight:\s*(bold|700|600)/i.test(style);
    const isItalic = /font-style:\s*italic/i.test(style);
    const isSuperscript = /vertical-align:\s*super/i.test(style);
    const isSubscript = /vertical-align:\s*sub/i.test(style);

    // Skip if already proper semantic tags (these should keep their tags)
    if (
      el.tagName === 'STRONG' ||
      el.tagName === 'B' ||
      el.tagName === 'EM' ||
      el.tagName === 'I' ||
      el.tagName === 'SUP' ||
      el.tagName === 'SUB'
    ) {
      return;
    }

    // Skip structural elements like headings, p, li, etc.
    // Only wrap inline elements or spans
    const structuralTags = [
      'H1',
      'H2',
      'H3',
      'H4',
      'H5',
      'H6',
      'P',
      'LI',
      'TD',
      'TH',
      'DIV',
      'BLOCKQUOTE',
    ];
    if (structuralTags.includes(el.tagName)) {
      return;
    }

    // Handle bold, italic, superscript, and subscript for inline elements (like SPAN)
    if (isBold || isItalic || isSuperscript || isSubscript) {
      let content = el.innerHTML;

      // Wrap in appropriate tags (order matters: innermost first)
      if (isSuperscript) {
        content = `<sup>${content}</sup>`;
      } else if (isSubscript) {
        content = `<sub>${content}</sub>`;
      }

      if (isBold && isItalic) {
        content = `<strong><em>${content}</em></strong>`;
      } else if (isBold) {
        content = `<strong>${content}</strong>`;
      } else if (isItalic) {
        content = `<em>${content}</em>`;
      }

      // Replace element's innerHTML with wrapped content
      el.innerHTML = content;
    }
  });

  // Now remove all style attributes and unwrap unnecessary spans
  const allElementsAgain = Array.from(tempDiv.querySelectorAll('*'));
  allElementsAgain.forEach(el => {
    el.removeAttribute('style');

    // Unwrap spans that have no purpose (they were just style carriers)
    if (el.tagName === 'SPAN' && !el.hasAttributes()) {
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) {
          parent.insertBefore(el.firstChild, el);
        }
        el.remove();
      }
    }
  });

  return tempDiv.innerHTML;
}

/**
 * Add preview styles to match INPUT font
 * @param {string} html - HTML content
 * @returns {string} - HTML with embedded styles
 */
function addPreviewStyles(html) {
  const currentTheme = document.documentElement.getAttribute('data-theme');

  // Theme-aware colors
  const isHighContrast = currentTheme === 'high-contrast';
  const bodyColor = isHighContrast ? '#FFFFFF' : '#2C2C2C';
  const bodyBg = isHighContrast ? '#000000' : '#FFFFFF';
  const linkColor = isHighContrast ? '#FFD28A' : '#C9A88F';
  const blockquoteBorder = isHighContrast ? '#FFD28A' : '#C9A88F';
  const blockquoteColor = isHighContrast ? '#E6E6E6' : '#666666';
  const tableBorder = isHighContrast ? 'rgba(255, 210, 138, 0.4)' : '#DDDDDD';

  // Scrollbar colors
  const scrollbarTrack = isHighContrast ? 'rgba(255, 210, 138, 0.1)' : 'rgba(201, 168, 143, 0.1)';
  const scrollbarThumb = isHighContrast ? 'rgba(255, 210, 138, 0.4)' : 'rgba(201, 168, 143, 0.4)';
  const scrollbarThumbHover = isHighContrast
    ? 'rgba(255, 210, 138, 0.6)'
    : 'rgba(201, 168, 143, 0.6)';
  const scrollbarThumbActive = isHighContrast
    ? 'rgba(255, 210, 138, 0.8)'
    : 'rgba(201, 168, 143, 0.8)';

  const styles = `
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Satoshi', 'Manrope', sans-serif;
        font-size: 17px;
        font-weight: 400;
        line-height: 1.65;
        color: ${bodyColor};
        background: ${bodyBg};
        padding: 24px;
        margin: 0;
      }

      /* Custom scrollbars */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      ::-webkit-scrollbar-track {
        background: ${scrollbarTrack};
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb {
        background: ${scrollbarThumb};
        border-radius: 4px;
        transition: background 0.15s ease;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: ${scrollbarThumbHover};
      }

      ::-webkit-scrollbar-thumb:active {
        background: ${scrollbarThumbActive};
      }

      /* Firefox scrollbar */
      * {
        scrollbar-width: thin;
        scrollbar-color: ${scrollbarThumb} ${scrollbarTrack};
      }

      h1, h2, h3, h4, h5, h6 {
        font-weight: 600;
        line-height: 1.2;
        margin-bottom: 24px;
      }
      h1 { font-size: 48px; }
      h2 { font-size: 32px; }
      h3 { font-size: 22px; }
      h4, h5, h6 { font-size: 17px; }
      p { margin-bottom: 16px; font-weight: 400; }
      ul, ol { margin-bottom: 16px; padding-left: 32px; font-weight: 400; }
      li { margin-bottom: 4px; font-weight: 400; }
      strong, b { font-weight: 600; }
      em, i { font-style: italic; }
      sup { vertical-align: super; font-size: 0.75em; }
      sub { vertical-align: sub; font-size: 0.75em; }
      a { color: ${linkColor}; text-decoration: underline; }
      blockquote {
        margin: 16px 0;
        padding-left: 24px;
        border-left: 3px solid ${blockquoteBorder};
        color: ${blockquoteColor};
        font-weight: 400;
      }
      table { border-collapse: collapse; margin-bottom: 16px; }
      th, td { padding: 8px; border: 1px solid ${tableBorder}; font-weight: 400; }
      th { font-weight: 600; }
    </style>
  `;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${styles}
</head>
<body>
  ${html}
</body>
</html>`;
}

/**
 * Update character count
 * @param {string} text - Text to count
 * @param {HTMLElement} element - Element to update
 */
function updateCharCount(text, element) {
  if (element) {
    const count = text.length;
    element.textContent = `${count.toLocaleString()} characters`;

    // Show warning for large content
    if (count > 5 * 1024 * 1024) {
      // > 5MB
      element.textContent += ' ⚠️ Large document may take longer to process';
    }
  }
}

/**
 * Update current mode
 * @param {string} mode - New mode
 */
export function updateMode(mode) {
  currentMode = mode;
  reprocess();
}

/**
 * Update current options
 * @param {Object} options - New options
 */
export function updateOptions(options) {
  currentOptions = { ...currentOptions, ...options };
  isOptionChange = true; // Mark as option change
  reprocess();
}

/**
 * Reprocess current input
 */
function reprocess() {
  const inputDiv = document.getElementById('input-html');
  if (inputDiv && inputDiv.innerHTML && inputDiv.innerHTML.trim() !== '') {
    processInputHTML(inputDiv.innerHTML);
  }
}

// Export clear cache function for testing/debugging
export { clearCachedElements };
