// HTML Cleaner
// Cleans HTML structure by removing unnecessary tags and unwrapping elements

(function() {
    'use strict';

    // Block elements that don't need <br> tags after them
    const BLOCK_ELEMENTS = [
        'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
        'blockquote', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'dl', 'dt', 'dd', 'section', 'article', 'aside', 'header', 'footer',
        'nav', 'main', 'figure', 'figcaption'
    ];

    /**
     * Clean HTML by removing unnecessary tags and unwrapping elements
     * @param {string} html - Raw HTML string
     * @returns {string} - Cleaned HTML string
     */
    function cleanHtml(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        // Try to use DOM parser if available (browser environment)
        if (typeof DOMParser !== 'undefined') {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Clean the DOM
                cleanElement(doc.body, false);
                
                // Post-process: Remove <br> tags that are siblings after block elements
                removeBrAfterBlockElements(doc.body);
                
                // Post-process: Trim whitespace from anchor tags
                trimAnchorWhitespace(doc.body);
                
                // Serialize back to HTML
                return doc.body.innerHTML;
            } catch (e) {
                // Fall through to regex-based approach if DOM parsing fails
                console.warn('DOM parsing failed, using regex fallback:', e);
            }
        }
        
        // Fallback: return original HTML if DOM parsing not available
        return html;
    }

    /**
     * Clean a DOM element recursively
     * Handles any nesting order inside <li> elements dynamically
     * Examples:
     * - <li><p>...</p></li> → <li>...</li>
     * - <li><em><p>...</p></em></li> → <li><em>...</em></li>
     * - <li><p><em>...</em></p></li> → <li><em>...</em></li>
     * - <li><strong><em><p>...</p></em></strong></li> → <li><strong><em>...</em></strong></li>
     * 
     * @param {Element} element - DOM element to clean
     * @param {boolean} insideLi - Whether we're inside an <li> tag
     */
    function cleanElement(element, insideLi = false) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        const tagName = element.tagName.toLowerCase();
        const isLi = tagName === 'li';
        const isBlock = BLOCK_ELEMENTS.includes(tagName);
        const nowInsideLi = isLi || insideLi;

        // Process children - need to use a while loop because we're modifying the DOM
        // This ensures we handle all children even as the list changes
        let node = element.firstChild;
        
        while (node) {
            // Get next sibling before we potentially remove the node
            const nextSibling = node.nextSibling;
            
            if (node.nodeType === Node.ELEMENT_NODE) {
                const childTag = node.tagName.toLowerCase();
                
                // Remove <br> tags that are:
                // 1. Inside <li> (any nesting level)
                // 2. Direct children of block elements (unnecessary spacing)
                // 3. Siblings after block elements (unnecessary spacing)
                if (childTag === 'br') {
                    if (nowInsideLi || isBlock) {
                        element.removeChild(node);
                        node = nextSibling;
                        continue;
                    }
                }
                
                // Unwrap <p> tags that are inside <li> (any nesting level)
                // This works for any nesting order because we unwrap relative to immediate parent
                if (childTag === 'p' && nowInsideLi) {
                    unwrapParagraph(node, element);
                    node = nextSibling;
                    continue;
                }
                
                // Recursively clean child elements (preserves nesting structure)
                cleanElement(node, nowInsideLi);
            } else if (node.nodeType === Node.TEXT_NODE) {
                // Check if this text node is followed by a <br> after a block element
                // This handles cases like: </p><br> or </ul><br>
                if (isBlock && nextSibling && nextSibling.nodeType === Node.ELEMENT_NODE) {
                    const nextTag = nextSibling.tagName.toLowerCase();
                    if (nextTag === 'br') {
                        element.removeChild(nextSibling);
                        // Continue with current node
                    }
                }
            }
            
            // Move to next sibling
            node = nextSibling;
        }
        
        // After processing children, check for <br> tags that are siblings after this block element
        // This handles cases where <br> is a sibling, not a child
        if (isBlock && element.parentNode) {
            let sibling = element.nextSibling;
            while (sibling) {
                const nextSibling = sibling.nextSibling;
                if (sibling.nodeType === Node.ELEMENT_NODE && 
                    sibling.tagName.toLowerCase() === 'br') {
                    element.parentNode.removeChild(sibling);
                }
                sibling = nextSibling;
            }
        }
        
        // Normalize strong/em nesting order inside <li> elements
        // Standard format: <em><strong>label</strong> rest of content</em>
        if (nowInsideLi) {
            normalizeStrongEmNesting(element);
            mergeAdjacentEmTags(element);
        }
    }
    
    /**
     * Normalize the nesting order of <strong> and <em> tags inside list items
     * Standard format: <em><strong>label</strong> rest of content</em>
     * - <em> wraps the entire list item content (makes everything italic)
     * - <strong> wraps only the label/heading part (makes it bold + italic)
     * 
     * Converts:
     * - <strong><em>...</em></strong> → <em><strong>...</strong></em>
     * - Keeps <em><strong>...</strong></em> as is (already correct)
     * 
     * @param {Element} element - Element to normalize
     */
    function normalizeStrongEmNesting(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return;
        }
        
        // Process direct children first to avoid processing already-normalized nested elements
        const children = Array.from(element.childNodes);
        
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            
            if (child.nodeType === Node.ELEMENT_NODE) {
                const childTag = child.tagName.toLowerCase();
                
                // Check if this is <strong> that directly contains <em>
                // Need to convert <strong><em>...</em></strong> to <em><strong>...</strong></em>
                if (childTag === 'strong') {
                    const directEm = Array.from(child.childNodes).find(
                        node => node.nodeType === Node.ELEMENT_NODE && 
                                node.tagName.toLowerCase() === 'em' &&
                                node.parentNode === child
                    );
                    
                    if (directEm) {
                        // We have <strong><em>content</em></strong>
                        // Need to convert to <em><strong>content</strong></em>
                        
                        // Get the content of the <em> element
                        const emContent = Array.from(directEm.childNodes);
                        
                        // Create new structure: <em><strong>content</strong></em>
                        const newEm = document.createElement('em');
                        const newStrong = document.createElement('strong');
                        
                        // Move content from <em> to new <strong>
                        for (let j = 0; j < emContent.length; j++) {
                            newStrong.appendChild(emContent[j]);
                        }
                        
                        // Put <strong> inside <em>
                        newEm.appendChild(newStrong);
                        
                        // Get any other content in <strong> (text nodes, other elements after <em>)
                        const otherContent = [];
                        let foundEm = false;
                        for (let j = 0; j < child.childNodes.length; j++) {
                            const strongChild = child.childNodes[j];
                            if (strongChild === directEm) {
                                foundEm = true;
                            } else if (foundEm) {
                                // Content after <em>
                                otherContent.push(strongChild);
                            }
                        }
                        
                        // Replace <strong> with <em>
                        if (child.parentNode) {
                            child.parentNode.insertBefore(newEm, child);
                            
                            // Add any other content after <em>
                            for (let j = 0; j < otherContent.length; j++) {
                                child.parentNode.insertBefore(otherContent[j], child.nextSibling);
                            }
                            
                            // Remove the original <strong>
                            child.parentNode.removeChild(child);
                        }
                    } else {
                        // Recursively normalize nested elements
                        normalizeStrongEmNesting(child);
                    }
                } else {
                    // Recursively normalize nested elements
                    normalizeStrongEmNesting(child);
                }
            }
        }
    }

    /**
     * Unwrap a <p> tag by moving its children to the parent
     * @param {Element} pElement - The <p> element to unwrap
     * @param {Element} parent - The parent element (should be <li>)
     */
    function unwrapParagraph(pElement, parent) {
        if (!pElement || !parent) {
            return;
        }

        // Move all children of <p> to the parent, before the <p>
        const children = Array.from(pElement.childNodes);
        
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            
            if (child.nodeType === Node.ELEMENT_NODE) {
                const childTag = child.tagName.toLowerCase();
                
                // Skip <br> tags inside <p> when unwrapping
                if (childTag === 'br') {
                    continue;
                }
                
                // Move the child to parent
                parent.insertBefore(child, pElement);
            } else if (child.nodeType === Node.TEXT_NODE) {
                // Preserve text content as-is (don't trim to preserve spaces)
                // Only skip if it's completely empty/whitespace
                const text = child.textContent;
                if (text.trim()) {
                    // Create a new text node with original content (preserves spaces)
                    const textNode = document.createTextNode(text);
                    parent.insertBefore(textNode, pElement);
                }
            }
        }
        
        // Remove the empty <p> tag
        parent.removeChild(pElement);
    }
    
    /**
     * Merge adjacent <em> tags inside list items
     * Handles cases like: <strong><em>...</em></strong><em>...</em>
     * After normalization becomes: <em><strong>...</strong></em><em>...</em>
     * Converts to: <em><strong>...</strong>...</em>
     * 
     * @param {Element} element - Element to process
     */
    function mergeAdjacentEmTags(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return;
        }
        
        const children = Array.from(element.childNodes);
        
        for (let i = 0; i < children.length - 1; i++) {
            const current = children[i];
            const next = children[i + 1];
            
            if (current.nodeType === Node.ELEMENT_NODE && 
                next.nodeType === Node.ELEMENT_NODE) {
                
                const currentTag = current.tagName.toLowerCase();
                const nextTag = next.tagName.toLowerCase();
                
                // Check if both are <em> tags
                if (currentTag === 'em' && nextTag === 'em') {
                    // Merge: move all children from next <em> to current <em>
                    const nextChildren = Array.from(next.childNodes);
                    for (let j = 0; j < nextChildren.length; j++) {
                        current.appendChild(nextChildren[j]);
                    }
                    // Remove the second <em>
                    if (next.parentNode) {
                        next.parentNode.removeChild(next);
                    }
                    // Re-process to handle any new adjacent tags
                    mergeAdjacentEmTags(element);
                    return;
                }
            }
        }
    }

    /**
     * Trim leading and trailing whitespace from anchor tag text content
     * Handles cases like: <a> text </a> → <a>text</a>
     * 
     * @param {Element} element - Element to process
     */
    function trimAnchorWhitespace(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return;
        }
        
        // Process all children recursively first
        const children = Array.from(element.childNodes);
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeType === Node.ELEMENT_NODE) {
                trimAnchorWhitespace(children[i]);
            }
        }
        
        // Check if this element is an anchor tag
        const tagName = element.tagName.toLowerCase();
        if (tagName !== 'a') {
            return;
        }
        
        // Find first and last text nodes
        let firstTextNode = null;
        let lastTextNode = null;
        
        for (let i = 0; i < element.childNodes.length; i++) {
            const node = element.childNodes[i];
            if (node.nodeType === Node.TEXT_NODE) {
                if (firstTextNode === null) {
                    firstTextNode = node;
                }
                lastTextNode = node;
            }
        }
        
        // Handle edge case: no text nodes (only nested elements)
        if (firstTextNode === null && lastTextNode === null) {
            return;
        }
        
        // Trim leading whitespace from first text node
        if (firstTextNode) {
            const originalText = firstTextNode.textContent;
            const trimmedText = originalText.replace(/^\s+/, '');
            
            if (trimmedText.length === 0) {
                // Remove empty text node
                element.removeChild(firstTextNode);
            } else {
                firstTextNode.textContent = trimmedText;
            }
        }
        
        // Trim trailing whitespace from last text node (if different from first)
        if (lastTextNode && lastTextNode !== firstTextNode) {
            const originalText = lastTextNode.textContent;
            const trimmedText = originalText.replace(/\s+$/, '');
            
            if (trimmedText.length === 0) {
                // Remove empty text node
                element.removeChild(lastTextNode);
            } else {
                lastTextNode.textContent = trimmedText;
            }
        } else if (lastTextNode && lastTextNode === firstTextNode && firstTextNode) {
            // Same node, trim both ends
            const originalText = firstTextNode.textContent;
            const trimmedText = originalText.trim();
            
            if (trimmedText.length === 0) {
                // Remove empty text node
                element.removeChild(firstTextNode);
            } else {
                firstTextNode.textContent = trimmedText;
            }
        }
    }

    /**
     * Remove <br> tags that are siblings after block elements
     * Handles cases like: </p><br>, </ul><br>, </h1><br>, etc.
     * 
     * @param {Element} element - Element to process
     */
    function removeBrAfterBlockElements(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return;
        }
        
        // Process all children recursively first
        const children = Array.from(element.childNodes);
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeType === Node.ELEMENT_NODE) {
                removeBrAfterBlockElements(children[i]);
            }
        }
        
        // Then check for <br> tags after block elements
        const childNodes = Array.from(element.childNodes);
        for (let i = 0; i < childNodes.length; i++) {
            const node = childNodes[i];
            
            if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();
                
                // If this is a block element, check if next sibling is <br>
                if (BLOCK_ELEMENTS.includes(tagName)) {
                    let nextSibling = node.nextSibling;
                    // Remove consecutive <br> tags after block elements
                    while (nextSibling) {
                        const nextNextSibling = nextSibling.nextSibling;
                        if (nextSibling.nodeType === Node.ELEMENT_NODE && 
                            nextSibling.tagName.toLowerCase() === 'br') {
                            element.removeChild(nextSibling);
                        } else {
                            break; // Stop if we hit a non-<br> element
                        }
                        nextSibling = nextNextSibling;
                    }
                }
            }
        }
    }

    // Export for use in other modules
    if (typeof window !== 'undefined') {
        window.HTMLCleaner = {
            clean: cleanHtml
        };
    }

    // Also export for Node.js/CommonJS if needed
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { clean: cleanHtml };
    }
})();

