/**
 * Whitespace Normalization Feature
 * Two levels: basic normalization and safe minification
 */

/**
 * Normalize whitespace in HTML
 * @param {HTMLElement} root - Root element to process
 * @param {string} level - 'basic' or 'minify'
 */
export function normalizeWhitespace(root, level = 'basic') {
  if (level === 'minify') {
    safeMinification(root);
  } else {
    basicNormalization(root);
  }
}

/**
 * Basic normalization: standardize whitespace without changing visual appearance
 * @param {HTMLElement} root - Root element to process
 */
function basicNormalization(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);

  let textNode;
  while ((textNode = walker.nextNode())) {
    // Collapse multiple spaces to single space
    let text = textNode.textContent;
    text = text.replace(/\s+/g, ' ');

    // Trim leading/trailing whitespace in block contexts
    const parent = textNode.parentElement;
    if (parent && isBlockElement(parent)) {
      if (textNode === parent.firstChild) {
        text = text.trimStart();
      }
      if (textNode === parent.lastChild) {
        text = text.trimEnd();
      }
    }

    textNode.textContent = text;
  }
}

/**
 * Safe minification: aggressive whitespace removal while preserving semantics
 * @param {HTMLElement} root - Root element to process
 */
function safeMinification(root) {
  // First, apply basic normalization
  basicNormalization(root);

  // Remove whitespace-only text nodes between block elements
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);

  const nodesToRemove = [];
  let textNode;

  while ((textNode = walker.nextNode())) {
    // Check if text node is whitespace-only
    if (/^\s+$/.test(textNode.textContent)) {
      const prev = textNode.previousSibling;
      const next = textNode.nextSibling;

      // Only remove if between two block elements
      if (prev && next && isBlockElement(prev) && isBlockElement(next)) {
        nodesToRemove.push(textNode);
      }
    }
  }

  nodesToRemove.forEach(node => node.remove());

  // Remove empty <p>&nbsp;</p> spacers
  root.querySelectorAll('p').forEach(p => {
    if (p.innerHTML.trim() === '&nbsp;' && !p.hasAttributes()) {
      p.remove();
    }
  });
}

/**
 * Check if node is a block element
 * @param {Node} node - Node to check
 * @returns {boolean}
 */
function isBlockElement(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const blockTags = [
    'p',
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'table',
    'tr',
  ];
  return blockTags.includes(node.tagName.toLowerCase());
}
