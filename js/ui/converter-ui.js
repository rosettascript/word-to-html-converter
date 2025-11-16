/**
 * Converter UI
 * Handles the main converter interface: input, output, debouncing
 */

import { debounce } from '../utils/debounce.js';
import { showError, clearError } from './error-handler.js';
import { updateStatus } from './status-handler.js';
import { formatHTML, applySyntaxHighlighting } from '../utils/html-formatter.js';
import { fixOrphanedListItems } from '../features/fix-orphaned-list-items.js';

let processCallback = null;
let currentMode = 'regular';
let currentOptions = {};

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
    console.error('Required elements not found');
    return;
  }
  
  // Set up paste handling
  inputDiv.addEventListener('paste', (e) => {
    e.preventDefault();
    
    try {
      // Get HTML from clipboard
      const html = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
      
      if (html) {
        // Strip all inline styles from the HTML for display
        const cleanedForDisplay = stripInlineStyles(html);
        
        // Display the cleaned HTML rendered in the input
        inputDiv.innerHTML = cleanedForDisplay;
        
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
        processInputHTML(html);
      }
    } catch (error) {
      console.error('Paste handling error:', error);
      showError('Unable to process pasted content. Please try again or check the HTML format.');
      updateStatus('Paste failed', 'error');
    }
  });
  
  // Set up manual input detection (in case user types or content changes)
  const debouncedProcess = debounce(() => {
    const html = inputDiv.innerHTML;
    if (html && html.trim() !== '') {
      processInputHTML(html);
    }
  }, 500);
  
  // Listen for any content changes
  const observer = new MutationObserver(() => {
    const textContent = inputDiv.textContent || inputDiv.innerText || '';
    updateCharCount(textContent, charCount);
    
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
    characterData: true
  });
  
  // Clear button
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      inputDiv.innerHTML = '';
      outputCode.textContent = '';
      updateCharCount('', charCount);
      clearError();
      updateStatus('', 'idle');
      
      // Clear preview frame
      const previewFrame = document.getElementById('preview-frame');
      if (previewFrame) {
        previewFrame.srcdoc = '';
      }
    });
  }
  
  // Initial state
  updateCharCount('', charCount);
}

/**
 * Process input HTML
 * @param {string} inputHTML - Input HTML to process
 */
function processInputHTML(inputHTML) {
  const outputCode = document.getElementById('output-html');
  const previewFrame = document.getElementById('preview-frame');
  
  if (!inputHTML || inputHTML.trim() === '') {
    outputCode.textContent = '';
    if (previewFrame) {
      previewFrame.srcdoc = '';
    }
    clearError();
    updateStatus('', 'idle');
    return;
  }
  
  try {
    // Call the processor
    const cleanedHTML = processCallback(inputHTML, currentMode, currentOptions);
    
    // Format HTML with proper indentation
    const formattedHTML = formatHTML(cleanedHTML, 4); // 4 spaces indentation
    
    // Escape HTML for display
    const escapedHTML = escapeHTML(formattedHTML);
    
    // Apply syntax highlighting
    const highlightedHTML = applySyntaxHighlighting(escapedHTML);
    
    // Update output (use innerHTML for syntax highlighting)
    outputCode.innerHTML = highlightedHTML;
    
    // Update preview (if in preview mode) with custom styling
    if (previewFrame) {
      const styledHTML = addPreviewStyles(cleanedHTML);
      previewFrame.srcdoc = styledHTML;
    }
    
    clearError();
    updateStatus('HTML cleaned successfully', 'success');
    
  } catch (error) {
    console.error('Processing error:', error);
    showError(error.message || 'Unable to parse HTML. Please check your input for errors.');
    updateStatus('Processing failed', 'error');
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
    if (el.tagName === 'STRONG' || el.tagName === 'B' || el.tagName === 'EM' || el.tagName === 'I' || 
        el.tagName === 'SUP' || el.tagName === 'SUB') {
      return;
    }
    
    // Skip structural elements like headings, p, li, etc.
    // Only wrap inline elements or spans
    const structuralTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'LI', 'TD', 'TH', 'DIV', 'BLOCKQUOTE'];
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
  const styles = `
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Satoshi', 'Manrope', sans-serif;
        font-size: 17px;
        font-weight: 400;
        line-height: 1.65;
        color: #2C2C2C;
        padding: 24px;
        margin: 0;
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
      a { color: #C9A88F; text-decoration: underline; }
      blockquote {
        margin: 16px 0;
        padding-left: 24px;
        border-left: 3px solid #C9A88F;
        color: #666;
        font-weight: 400;
      }
      table { border-collapse: collapse; margin-bottom: 16px; }
      th, td { padding: 8px; border: 1px solid #ddd; font-weight: 400; }
      th { font-weight: 600; }
    </style>
  `;
  return styles + html;
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
    if (count > 5 * 1024 * 1024) {  // > 5MB
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

