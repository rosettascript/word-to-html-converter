/**
 * HTML Sanitizer
 * Removes dangerous elements, inline styles, and unnecessary attributes
 */

/**
 * Allowed HTML tags (semantic elements only)
 */
const ALLOWED_TAGS = new Set([
  'a', 'p', 'ul', 'ol', 'li', 
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'em', 'strong', 'sup', 'sub', 'code',
  'blockquote', 'br',
  'table', 'thead', 'tbody', 'tr', 'th', 'td'
]);

/**
 * Allowed attributes per tag
 */
const ALLOWED_ATTRIBUTES = {
  'a': ['href'],
  'th': ['scope', 'colspan', 'rowspan'],
  'td': ['colspan', 'rowspan']
};

/**
 * Sanitize HTML element by removing dangerous content and styles
 * @param {HTMLElement} element - The element to sanitize
 * @returns {HTMLElement} - Sanitized element
 */
export function sanitizeHTML(element) {
  // Clone the element to avoid mutating the original
  const cloned = element.cloneNode(true);
  
  // Remove all images (PRD requirement: images never in output)
  const images = cloned.querySelectorAll('img');
  images.forEach(img => img.remove());
  
  // Remove dangerous elements
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'style', 'base', 'form', 'input', 'button', 'select', 'textarea'];
  dangerousTags.forEach(tag => {
    const elements = cloned.querySelectorAll(tag);
    elements.forEach(el => el.remove());
  });
  
  // Process all elements
  const allElements = cloned.querySelectorAll('*');
  allElements.forEach(el => {
    const tagName = el.tagName.toLowerCase();
    
    // Remove disallowed tags (replace with their content)
    if (!ALLOWED_TAGS.has(tagName)) {
      replaceWithChildren(el);
      return;
    }
    
    // Remove all inline styles
    el.removeAttribute('style');
    
    // Remove class, id, data-* attributes
    el.removeAttribute('class');
    el.removeAttribute('id');
    
    // Remove data-* attributes
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('data-')) {
        el.removeAttribute(attr.name);
      }
      // Remove event handlers (on* attributes)
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
    
    // Remove attributes not in allowlist
    const allowedAttrs = ALLOWED_ATTRIBUTES[tagName] || [];
    Array.from(el.attributes).forEach(attr => {
      if (!allowedAttrs.includes(attr.name)) {
        el.removeAttribute(attr.name);
      }
    });
    
    // Validate and sanitize href attributes
    if (tagName === 'a' && el.hasAttribute('href')) {
      const href = el.getAttribute('href');
      // Remove javascript: and data: protocol links
      if (href.startsWith('javascript:') || href.startsWith('data:')) {
        el.setAttribute('href', '#');
      }
    }
  });
  
  // Remove empty spans
  removeEmptySpans(cloned);
  
  return cloned;
}

/**
 * Replace an element with its children
 * @param {HTMLElement} element - Element to replace
 */
function replaceWithChildren(element) {
  const parent = element.parentNode;
  if (!parent) return;
  
  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);
}

/**
 * Remove empty span elements
 * @param {HTMLElement} root - Root element to process
 */
function removeEmptySpans(root) {
  const spans = root.querySelectorAll('span');
  spans.forEach(span => {
    // Remove if empty or whitespace-only
    if (span.textContent.trim() === '' && !span.hasAttributes()) {
      span.remove();
    } else if (!span.hasAttributes()) {
      // If no attributes, replace with content
      replaceWithChildren(span);
    }
  });
}


