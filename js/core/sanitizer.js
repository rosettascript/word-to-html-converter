/**
 * HTML Sanitizer
 * Removes dangerous elements, inline styles, and unnecessary attributes
 */

/**
 * Allowed HTML tags (semantic elements only)
 */
const ALLOWED_TAGS = new Set([
  'a',
  'p',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'em',
  'strong',
  'sup',
  'sub',
  'code',
  'blockquote',
  'br',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
]);

/**
 * Allowed attributes per tag
 */
const ALLOWED_ATTRIBUTES = {
  a: ['href'],
  th: ['scope', 'colspan', 'rowspan'],
  td: ['colspan', 'rowspan'],
};

/**
 * Sanitize HTML element by removing dangerous content and styles
 * @param {HTMLElement} element - The element to sanitize
 * @returns {HTMLElement} - Sanitized element
 */
export function sanitizeHTML(element) {
  // Early return for null/undefined element
  if (!element) {
    return element;
  }
  
  // Clone the element to avoid mutating the original
  const cloned = element.cloneNode(true);
  
  // Early return for empty element
  if (!cloned.innerHTML || !cloned.innerHTML.trim()) {
    return cloned;
  }

  // Remove all images (PRD requirement: images never in output)
  const images = cloned.querySelectorAll('img');
  images.forEach(img => img.remove());

  // Remove dangerous elements
  const dangerousTags = [
    'script',
    'iframe',
    'object',
    'embed',
    'link',
    'style',
    'base',
    'form',
    'input',
    'button',
    'select',
    'textarea',
  ];
  dangerousTags.forEach(tag => {
    const elements = cloned.querySelectorAll(tag);
    elements.forEach(el => el.remove());
  });

  // Fix invalid HTML structures (run early to prevent downstream failures)
  fixInvalidListStructures(cloned);
  fixNestedParagraphs(cloned);
  fixParagraphsInLists(cloned);
  fixInvalidNesting(cloned);
  fixInvalidTableStructures(cloned);

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

    // Single-pass attribute processing: collect attributes to remove, then remove in batch
    const allowedAttrs = ALLOWED_ATTRIBUTES[tagName] || [];
    const attrsToRemove = [];

    Array.from(el.attributes).forEach(attr => {
      // Check all removal conditions in one pass
      if (
        attr.name === 'class' ||
        attr.name === 'id' ||
        attr.name.startsWith('data-') ||
        attr.name.startsWith('on') ||
        !allowedAttrs.includes(attr.name)
      ) {
        attrsToRemove.push(attr.name);
      }
    });

    // Remove all collected attributes in batch
    attrsToRemove.forEach(name => el.removeAttribute(name));

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

  // Use DocumentFragment for better performance and to handle edge cases
  const fragment = document.createDocumentFragment();
  while (element.firstChild) {
    fragment.appendChild(element.firstChild);
  }

  // Double-check parent still exists before replacement
  if (element.parentNode) {
    parent.replaceChild(fragment, element);
  }
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

/**
 * Fix invalid list structures
 * Removes <br> tags from lists, empty lists, and fixes text nodes in lists
 * @param {HTMLElement} root - Root element to process
 */
function fixInvalidListStructures(root) {
  const lists = Array.from(root.querySelectorAll('ul, ol'));

  lists.forEach(list => {
    // Remove <br> directly in list (not in <li>)
    const brInList = Array.from(list.childNodes).filter(
      node => node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR'
    );
    brInList.forEach(br => br.remove());

    // Remove <br> from inside <li> elements
    const listItems = list.querySelectorAll('li');
    listItems.forEach(li => {
      const brTags = li.querySelectorAll('br');
      brTags.forEach(br => br.remove());
    });

    // Remove empty lists or lists without <li> children
    const hasListItems = list.querySelectorAll(':scope > li').length > 0;
    if (!hasListItems) {
      list.remove();
      return;
    }

    // Fix text nodes directly in list (move to first <li> or remove)
    const textNodes = Array.from(list.childNodes).filter(
      node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
    );
    if (textNodes.length > 0) {
      const firstLi = list.querySelector(':scope > li');
      if (firstLi) {
        textNodes.forEach(textNode => {
          firstLi.insertBefore(textNode, firstLi.firstChild);
        });
      } else {
        textNodes.forEach(textNode => textNode.remove());
      }
    }
  });
}

/**
 * Fix nested paragraph tags (invalid HTML - <p> cannot contain <p>)
 * @param {HTMLElement} root - Root element to process
 */
function fixNestedParagraphs(root) {
  // Process in reverse to handle deeply nested structures correctly
  let paragraphs = Array.from(root.querySelectorAll('p'));
  
  // Keep processing until no more nested paragraphs are found
  let hasNested = true;
  while (hasNested) {
    hasNested = false;
    paragraphs = Array.from(root.querySelectorAll('p')).reverse();

    paragraphs.forEach(p => {
      // Check if this <p> contains other <p> tags
      const nestedP = p.querySelector('p');
      if (nestedP) {
        hasNested = true;
        // Unwrap nested paragraphs
        const parent = p.parentNode;
        if (!parent) return;

        // Collect all content (including nested <p> tags)
        const fragment = document.createDocumentFragment();
        const nodesToProcess = Array.from(p.childNodes);

        nodesToProcess.forEach(child => {
          if (child.nodeType === Node.ELEMENT_NODE && child.tagName === 'P') {
            // If child is a <p>, unwrap it and add its content
            while (child.firstChild) {
              fragment.appendChild(child.firstChild);
            }
            child.remove();
          } else {
            fragment.appendChild(child);
          }
        });

        // Replace current <p> with its unwrapped content
        if (p.parentNode) {
          parent.replaceChild(fragment, p);
        }
      }
    });
  }
}

/**
 * Fix paragraphs inside list items (invalid HTML structure)
 * Unwraps <p> tags that are direct children of <li> elements
 * @param {HTMLElement} root - Root element to process
 */
function fixParagraphsInLists(root) {
  const listItems = root.querySelectorAll('li');

  listItems.forEach(li => {
    // Find all direct child <p> tags
    const pTags = Array.from(li.children).filter(child => child.tagName === 'P');

    pTags.forEach(p => {
      // Move all children of <p> directly into <li>
      while (p.firstChild) {
        li.insertBefore(p.firstChild, p);
      }
      // Remove the now-empty <p> tag
      p.remove();
    });
  });
}

/**
 * Fix invalid nesting (block elements inside inline elements)
 * @param {HTMLElement} root - Root element to process
 */
function fixInvalidNesting(root) {
  // Block elements that cannot be inside inline elements
  const blockElements = ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'blockquote'];
  // Inline elements that cannot contain block elements
  const inlineElements = ['a', 'strong', 'em', 'span', 'code', 'sup', 'sub'];

  inlineElements.forEach(inlineTag => {
    const inlineEls = root.querySelectorAll(inlineTag);

    inlineEls.forEach(inline => {
      blockElements.forEach(blockTag => {
        // Find direct children that are block elements
        const blockChildren = Array.from(inline.children).filter(
          child => child.tagName.toLowerCase() === blockTag
        );

        blockChildren.forEach(block => {
          const parent = inline.parentNode;
          if (!parent) return;

          // Move block element outside inline element (after the inline element)
          parent.insertBefore(block, inline.nextSibling);
        });
      });
    });
  });
}

/**
 * Fix invalid table structures
 * Removes invalid content from tables and ensures proper structure
 * @param {HTMLElement} root - Root element to process
 */
function fixInvalidTableStructures(root) {
  const tables = root.querySelectorAll('table');

  tables.forEach(table => {
    // Remove invalid content directly in <table> (not in thead/tbody/tfoot/tr)
    const invalidChildren = Array.from(table.children).filter(
      child => !['THEAD', 'TBODY', 'TFOOT', 'TR'].includes(child.tagName)
    );
    invalidChildren.forEach(child => child.remove());

    // Fix invalid content in <tr> (only <td>/<th> allowed)
    const rows = table.querySelectorAll('tr');
    rows.forEach(tr => {
      const invalidCells = Array.from(tr.children).filter(
        child => !['TD', 'TH'].includes(child.tagName)
      );
      invalidCells.forEach(cell => cell.remove());
    });
  });
}
