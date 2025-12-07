// HTML Sanitizer
// Removes all styling and unsafe attributes while preserving semantic structure

(function() {
    'use strict';

    // Allowed semantic HTML elements
    const ALLOWED_ELEMENTS = [
        // Headings
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        // Text structure
        'p', 'br', 'hr',
        // Lists
        'ul', 'ol', 'li',
        // Emphasis
        'em', 'i', 'strong', 'b',
        // Superscript/Subscript
        'sup', 'sub',
        // Links
        'a',
        // Images (optional)
        'img',
        // Block elements
        'blockquote', 'pre', 'code',
        // Tables
        'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ];

    // Allowed attributes per element
    const ALLOWED_ATTRIBUTES = {
        'a': ['href'],
        'img': ['src', 'alt'],
        // All other elements get no attributes
        '*': []
    };

    // Safe URL protocols
    const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:'];

    /**
     * Sanitize HTML by removing styling and unsafe attributes
     * @param {string} html - Raw HTML input
     * @returns {string} - Clean, semantic HTML
     */
    function sanitize(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        // Create a temporary container to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Sanitize the DOM tree
        sanitizeElement(tempDiv);

        // Return the sanitized HTML
        // If tempDiv has only one child and it's a non-semantic wrapper, unwrap it
        if (tempDiv.children.length === 1) {
            const onlyChild = tempDiv.children[0];
            const tagName = onlyChild.tagName.toLowerCase();
            if (!ALLOWED_ELEMENTS.includes(tagName) || 
                (tagName === 'span' && !onlyChild.hasAttributes())) {
                // Unwrap the root wrapper
                const fragment = document.createDocumentFragment();
                while (onlyChild.firstChild) {
                    fragment.appendChild(onlyChild.firstChild);
                }
                tempDiv.innerHTML = '';
                tempDiv.appendChild(fragment);
            }
        }

        return tempDiv.innerHTML;
    }

    /**
     * Recursively sanitize an element and its children
     * @param {Node} element - DOM element to sanitize
     */
    function sanitizeElement(element) {
        // Process all child nodes (including text nodes)
        const nodesToProcess = Array.from(element.childNodes);

        nodesToProcess.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();

                // Check if element is allowed
                if (!ALLOWED_ELEMENTS.includes(tagName)) {
                    // Element not allowed - unwrap it (move children to parent, remove element)
                    unwrapElement(node, element);
                    return;
                }

                // Sanitize attributes
                sanitizeAttributes(node, tagName);

                // Recursively sanitize children
                sanitizeElement(node);
            }
            // Text nodes are preserved as-is
        });
    }

    /**
     * Sanitize attributes of an element
     * @param {Element} element - Element to sanitize
     * @param {string} tagName - Tag name of the element
     */
    function sanitizeAttributes(element, tagName) {
        const allowedAttrs = ALLOWED_ATTRIBUTES[tagName] || ALLOWED_ATTRIBUTES['*'] || [];
        const attrsToRemove = [];

        // Check all attributes
        Array.from(element.attributes).forEach(attr => {
            const attrName = attr.name.toLowerCase();

            // Always remove these attributes
            if (attrName === 'style' || 
                attrName === 'class' || 
                attrName.startsWith('data-') ||
                attrName.startsWith('on') || // Event handlers (onclick, onload, etc.)
                attrName === 'id' ||
                attrName === 'dir' ||
                attrName === 'role' ||
                attrName === 'aria-level') {
                attrsToRemove.push(attr.name);
                return;
            }

            // Check if attribute is in allowed list
            if (!allowedAttrs.includes(attrName)) {
                attrsToRemove.push(attr.name);
                return;
            }

            // Special validation for href and src
            if (attrName === 'href' || attrName === 'src') {
                if (!isSafeUrl(attr.value)) {
                    attrsToRemove.push(attr.name);
                }
            }
        });

        // Remove disallowed attributes
        attrsToRemove.forEach(attrName => {
            element.removeAttribute(attrName);
        });
    }

    /**
     * Check if a URL is safe
     * @param {string} url - URL to check
     * @returns {boolean} - True if URL is safe
     */
    function isSafeUrl(url) {
        if (!url || typeof url !== 'string') {
            return false;
        }

        // Try to parse as URL
        try {
            // Handle relative URLs (they're safe)
            if (url.startsWith('/') || url.startsWith('#')) {
                return true;
            }

            const urlObj = new URL(url, window.location.href);
            return SAFE_PROTOCOLS.includes(urlObj.protocol);
        } catch (e) {
            // If URL parsing fails, check if it's a relative URL
            return url.startsWith('/') || url.startsWith('#');
        }
    }

    /**
     * Unwrap an element (move its children to parent, then remove element)
     * @param {Element} element - Element to unwrap
     * @param {Element} parent - Parent element
     */
    function unwrapElement(element, parent) {
        // Move all children to parent before this element
        const fragment = document.createDocumentFragment();
        while (element.firstChild) {
            fragment.appendChild(element.firstChild);
        }
        
        // Insert fragment before the element, then remove element
        if (element.parentNode) {
            element.parentNode.insertBefore(fragment, element);
            element.remove();
        }
    }

    // Export sanitize function
    if (typeof window !== 'undefined') {
        window.HTMLSanitizer = {
            sanitize: sanitize
        };
    }

    // Also export for Node.js/CommonJS if needed
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { sanitize: sanitize };
    }
})();

