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
     * Convert formatting styles to semantic HTML tags before removing styles
     * @param {Element} element - Element that might have formatting styles
     * @returns {Element|null} - Replacement element with semantic tags, or null if no conversion needed
     */
    function convertFormattingToSemanticTags(element) {
        const style = element.getAttribute('style') || '';
        if (!style) return null;
        
        // Parse style string
        const styleObj = {};
        style.split(';').forEach(rule => {
            const parts = rule.split(':').map(s => s.trim());
            if (parts.length === 2) {
                styleObj[parts[0].toLowerCase()] = parts[1];
            }
        });
        
        // Check for formatting styles
        const isItalic = styleObj['font-style'] && styleObj['font-style'].toLowerCase().includes('italic');
        const isBold = styleObj['font-weight'] && (
            styleObj['font-weight'].toLowerCase() === 'bold' || 
            parseInt(styleObj['font-weight']) >= 700
        );
        const isSuperscript = styleObj['vertical-align'] && (
            styleObj['vertical-align'].toLowerCase() === 'super' ||
            styleObj['vertical-align'].includes('super') ||
            styleObj['vertical-align'].includes('35%') ||
            styleObj['vertical-align'].includes('0.6')
        );
        const isSubscript = styleObj['vertical-align'] && (
            styleObj['vertical-align'].toLowerCase() === 'sub' ||
            styleObj['vertical-align'].includes('sub') ||
            styleObj['vertical-align'].includes('-35%') ||
            styleObj['vertical-align'].includes('-0.6')
        );
        
        // If no formatting styles, return null
        if (!isItalic && !isBold && !isSuperscript && !isSubscript) {
            return null;
        }
        
        // Build nested structure: sup/sub (outermost) > strong > em (innermost)
        // Move children directly instead of using innerHTML to preserve already-sanitized content
        const children = Array.from(element.childNodes);
        
        let current = null;
        
        // Create innermost tag (italic)
        if (isItalic) {
            const italic = document.createElement('em');
            children.forEach(child => italic.appendChild(child));
            current = italic;
        }
        
        // Wrap with bold if needed
        if (isBold) {
            const strong = document.createElement('strong');
            if (current) {
                strong.appendChild(current);
            } else {
                children.forEach(child => strong.appendChild(child));
            }
            current = strong;
        }
        
        // Wrap with sup/sub if needed (outermost)
        if (isSuperscript) {
            const sup = document.createElement('sup');
            if (current) {
                sup.appendChild(current);
            } else {
                children.forEach(child => sup.appendChild(child));
            }
            current = sup;
        } else if (isSubscript) {
            const sub = document.createElement('sub');
            if (current) {
                sub.appendChild(current);
            } else {
                children.forEach(child => sub.appendChild(child));
            }
            current = sub;
        }
        
        // If no tags were created, return null
        if (!current) {
            return null;
        }
        
        return current;
    }

    /**
     * Recursively sanitize an element and its children
     * @param {Node} element - DOM element to sanitize
     */
    function sanitizeElement(element) {
        // Process all child nodes (including text nodes)
        // Collect all element nodes first to avoid issues with DOM modification during iteration
        const nodesToProcess = Array.from(element.childNodes).filter(
            node => node.nodeType === Node.ELEMENT_NODE
        );
        
        // Process each element node
        nodesToProcess.forEach(node => {
            const tagName = node.tagName.toLowerCase();

            // Check if element is allowed
            if (!ALLOWED_ELEMENTS.includes(tagName)) {
                // Element not allowed - recursively sanitize children FIRST to handle nested formatting
                sanitizeElement(node);
                
                // Then try to convert formatting styles to semantic tags
                const semanticReplacement = convertFormattingToSemanticTags(node);
                
                if (semanticReplacement) {
                    // Replace the element with semantic tags
                    // Note: innerHTML was already set in convertFormattingToSemanticTags,
                    // and children have already been sanitized, so we just need to replace
                    if (node.parentNode) {
                        node.parentNode.replaceChild(semanticReplacement, node);
                        // Sanitize the replacement to handle any nested elements that might have been created
                        sanitizeElement(semanticReplacement);
                    }
                } else {
                    // No formatting to preserve - unwrap
                    unwrapElement(node, element);
                }
            } else {
                // Element is allowed - check if it has formatting styles that should be converted
                const style = node.getAttribute('style') || '';
                let hasFormatting = false;
                let isItalic = false;
                let isBold = false;
                
                if (style) {
                    // Parse style to check for formatting
                    const styleObj = {};
                    style.split(';').forEach(rule => {
                        const parts = rule.split(':').map(s => s.trim());
                        if (parts.length === 2) {
                            styleObj[parts[0].toLowerCase()] = parts[1];
                        }
                    });
                    
                    isItalic = styleObj['font-style'] && styleObj['font-style'].toLowerCase().includes('italic');
                    isBold = styleObj['font-weight'] && (
                        styleObj['font-weight'].toLowerCase() === 'bold' || 
                        parseInt(styleObj['font-weight']) >= 700
                    );
                    
                    hasFormatting = isItalic || isBold;
                    
                    // If element has formatting, wrap its content with semantic tags
                    if (hasFormatting) {
                        // First, recursively sanitize children
                        sanitizeElement(node);
                        
                        // Then wrap content with formatting tags
                        const children = Array.from(node.childNodes);
                        let wrapper = null;
                        
                        if (isItalic && isBold) {
                            // Both: wrap with strong, then em inside
                            wrapper = document.createElement('strong');
                            const em = document.createElement('em');
                            children.forEach(child => em.appendChild(child));
                            wrapper.appendChild(em);
                        } else if (isItalic) {
                            wrapper = document.createElement('em');
                            children.forEach(child => wrapper.appendChild(child));
                        } else if (isBold) {
                            wrapper = document.createElement('strong');
                            children.forEach(child => wrapper.appendChild(child));
                        }
                        
                        if (wrapper) {
                            node.innerHTML = '';
                            node.appendChild(wrapper);
                        }
                    }
                }
                
                // Sanitize attributes (removes style attribute)
                sanitizeAttributes(node, tagName);
                // Recursively process children (if not already done above)
                if (!hasFormatting) {
                    sanitizeElement(node);
                }
            }
        });
        
        // Text nodes are preserved as-is (they don't need processing)
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

            // Special validation and cleaning for href and src
            if (attrName === 'href' || attrName === 'src') {
                // Clean the URL first
                const cleanedUrl = cleanUrl(attr.value);
                if (cleanedUrl !== attr.value) {
                    element.setAttribute(attr.name, cleanedUrl);
                }
                
                // Then check if it's safe
                if (!isSafeUrl(cleanedUrl)) {
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
     * Clean URL by replacing special characters with hyphens
     * @param {string} url - URL to clean
     * @returns {string} - Cleaned URL
     */
    function cleanUrl(url) {
        if (!url || typeof url !== 'string') {
            return url;
        }

        try {
            // Decode URL-encoded characters first
            let cleaned = decodeURIComponent(url);
            
            // Replace various dash/hyphen-like characters with regular hyphens
            // En-dash (U+2013), em-dash (U+2014), non-breaking hyphen (U+2011), figure dash (U+2012)
            cleaned = cleaned.replace(/[\u2011\u2012\u2013\u2014\u2015]/g, '-');
            
            // Replace other problematic characters that might appear in URLs
            // Non-breaking space (U+00A0) -> regular space -> hyphen
            cleaned = cleaned.replace(/\u00A0/g, ' ');
            // Multiple spaces -> single hyphen
            cleaned = cleaned.replace(/\s+/g, '-');
            // Multiple consecutive hyphens -> single hyphen
            cleaned = cleaned.replace(/-+/g, '-');
            // Remove leading/trailing hyphens from path segments
            cleaned = cleaned.replace(/\/-+/g, '/').replace(/-+\//g, '/');
            
            // Re-encode if needed (preserve the cleaned structure)
            // Only re-encode if the URL structure changed
            if (cleaned !== decodeURIComponent(url)) {
                // Parse and reconstruct the URL to properly encode it
                try {
                    const urlObj = new URL(cleaned, window.location.href);
                    // Clean the pathname
                    const cleanPath = urlObj.pathname
                        .split('/')
                        .map(segment => encodeURIComponent(decodeURIComponent(segment)))
                        .join('/');
                    return urlObj.origin + cleanPath + urlObj.search + urlObj.hash;
                } catch (e) {
                    // If URL parsing fails, just return the cleaned string
                    return cleaned;
                }
            }
            
            return url; // No changes needed
        } catch (e) {
            // If decoding fails, try to clean the encoded URL directly
            // Replace encoded special characters
            let cleaned = url.replace(/%E2%80%91/g, '-')  // Non-breaking hyphen
                            .replace(/%E2%80%93/g, '-')  // En-dash
                            .replace(/%E2%80%94/g, '-')  // Em-dash
                            .replace(/%E2%80%95/g, '-')  // Horizontal bar
                            .replace(/%C2%A0/g, '-');    // Non-breaking space
            
            // Clean up multiple consecutive hyphens
            cleaned = cleaned.replace(/-+/g, '-');
            
            return cleaned;
        }
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

