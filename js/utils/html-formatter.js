// HTML Formatter
// Formats HTML in a compact style with nested tags on the same line

(function() {
    'use strict';

    // Inline elements that should stay on the same line
    const INLINE_ELEMENTS = [
        'a', 'em', 'i', 'strong', 'b', 'span', 'code', 'sup', 'sub',
        'small', 'mark', 'del', 'ins', 'u', 'abbr', 'cite', 'q', 'samp', 'var'
    ];

    // Block elements that should start on a new line
    const BLOCK_ELEMENTS = [
        'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
        'blockquote', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'dl', 'dt', 'dd', 'section', 'article', 'aside', 'header', 'footer',
        'nav', 'main', 'figure', 'figcaption'
    ];

    // Self-closing elements
    const SELF_CLOSING = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];

    /**
     * Format a DOM element recursively
     * @param {Element} element - DOM element to format
     * @param {boolean} insideLi - Whether we're inside an <li> tag
     * @param {number} indentLevel - Current indentation level (0 = no indent)
     * @returns {string} - Formatted HTML string
     */
    /**
     * Check if a node is a spacing element (<p>&nbsp;</p>)
     * @param {Element} node - Element to check
     * @returns {boolean} - True if it's a spacing element
     */
    function isSpacingParagraph(node) {
        if (!node || node.tagName.toLowerCase() !== 'p') return false;
        const html = (node.innerHTML || '').trim();
        const text = node.textContent || '';
        // Check for &nbsp; entity or non-breaking space character
        return html === '&nbsp;' || 
               html === '\u00A0' ||
               (text.trim() === '' && (html.includes('&nbsp;') || html === '\u00A0')) ||
               text === '\u00A0' ||
               text.trim() === '\u00A0';
    }
    
    function formatElement(element, insideLi = false, indentLevel = 0) {
        const tagName = element.tagName.toLowerCase();
        const isBlock = BLOCK_ELEMENTS.includes(tagName);
        const isInline = INLINE_ELEMENTS.includes(tagName);
        const isSelfClosing = SELF_CLOSING.includes(tagName);
        const isLi = tagName === 'li';
        
        // Check if this element itself is a spacing paragraph - handle it specially
        if (isSpacingParagraph(element)) {
            const indent = '  '.repeat(indentLevel);
            return '\n' + indent + '<p>&nbsp;</p>';
        }
        
        // Calculate indentation string (2 spaces per level)
        const indent = '  '.repeat(indentLevel);
        const childIndent = '  '.repeat(indentLevel + 1);
        
        // Handle self-closing tags
        if (isSelfClosing) {
            let tag = `<${tagName}`;
            if (element.attributes && element.attributes.length > 0) {
                for (let i = 0; i < element.attributes.length; i++) {
                    const attr = element.attributes[i];
                    tag += ` ${attr.name}="${attr.value}"`;
                }
            }
            tag += '>';
            return tag;
        }
        
        // Build opening tag
        let openingTag = `<${tagName}`;
        // Add attributes (if any)
        if (element.attributes && element.attributes.length > 0) {
            for (let i = 0; i < element.attributes.length; i++) {
                const attr = element.attributes[i];
                openingTag += ` ${attr.name}="${attr.value}"`;
            }
        }
        openingTag += '>';
        
                // Process children
        let content = '';
        let hasBlockChildren = false;
        let hasOnlyInlineContent = true;
        let hasContent = false;
        let blockChildTags = [];
        
        for (let i = 0; i < element.childNodes.length; i++) {
            const node = element.childNodes[i];
            
            if (node.nodeType === Node.ELEMENT_NODE) {
                const childTag = node.tagName.toLowerCase();
                
                // Skip empty inline elements
                if (INLINE_ELEMENTS.includes(childTag) && !node.textContent.trim() && node.children.length === 0) {
                    continue;
                }
                
                // Skip empty block elements (like empty <p></p>), but preserve spacing elements
                const isSpacingElement = isSpacingParagraph(node);
                if (BLOCK_ELEMENTS.includes(childTag) && !node.textContent.trim() && node.children.length === 0 && !isSpacingElement) {
                    continue;
                }
                
                if (BLOCK_ELEMENTS.includes(childTag)) {
                    hasBlockChildren = true;
                    hasOnlyInlineContent = false;
                    blockChildTags.push(childTag);
                }
                
                // Pass context: inside <li> if current element is <li> or we're already inside one
                // Increment indent level for block children
                const childInsideLi = isLi || insideLi;
                const childIndentLevel = BLOCK_ELEMENTS.includes(childTag) ? indentLevel + 1 : indentLevel;
                const formattedChild = formatElement(node, childInsideLi, childIndentLevel);
                if (formattedChild) {
                    // For block children, the child already includes its own newline and indentation
                    // So we just add it directly (the child's formatElement already added the indent)
                    if (BLOCK_ELEMENTS.includes(childTag) && isBlock) {
                        content += formattedChild; // Child already has \n + indent
                    } else {
                        content += formattedChild;
                    }
                    hasContent = true;
                }
            } else if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                // Preserve text nodes that contain spaces, even if they're only whitespace
                // This is important for normalization (e.g., space after </strong>)
                // Check if this is a space-only text node between elements
                const isSpaceOnly = text.trim() === '' && text.length > 0 && /^\s+$/.test(text);
                const prevSibling = node.previousSibling;
                const nextSibling = node.nextSibling;
                const isBetweenElements = (prevSibling && prevSibling.nodeType === Node.ELEMENT_NODE) ||
                                         (nextSibling && nextSibling.nodeType === Node.ELEMENT_NODE);
                
                if (text.trim() || (isSpaceOnly && isBetweenElements)) {
                    content += text;
                    hasContent = true;
                }
            }
        }
        
        // Skip empty elements (both inline and block), but preserve spacing elements
        // Check if this element itself is a spacing paragraph
        const isThisSpacingElement = isSpacingParagraph(element);
        if (!hasContent && !isThisSpacingElement) {
            return '';
        }
        
        // If this is a spacing element, ensure it's formatted correctly
        if (isThisSpacingElement) {
            const indent = '  '.repeat(indentLevel);
            return '\n' + indent + '<p>&nbsp;</p>';
        }
        
        const closingTag = `</${tagName}>`;
        
        // Formatting logic:
        // - Block elements: always on new line with indentation
        // - If block element has only inline content, keep opening and closing on same line
        // - Inline elements: always on same line
        // - Special: <p> inside <li> should be formatted compactly (no line breaks)
        
        if (isBlock) {
            // Special handling for <p> inside <li> - format compactly
            if (tagName === 'p' && insideLi) {
                // <p> inside <li> - keep on one line
                return openingTag + content + closingTag;
            }
            
            // Special handling for <li> - keep compact if it only contains <p> with inline content
            if (tagName === 'li') {
                // If it only has <p> children (which are block but should be treated as inline for <li>)
                const onlyHasP = hasBlockChildren && blockChildTags.length > 0 && 
                    blockChildTags.every(tag => tag === 'p');
                
                if (onlyHasP || (!hasBlockChildren && content.trim())) {
                    // Keep <li> on one line with indentation
                    return '\n' + indent + openingTag + content + closingTag;
                }
            }
            
            if (hasOnlyInlineContent && !hasBlockChildren && content.trim()) {
                // Block element with only inline content - keep on one line with indentation
                return '\n' + indent + openingTag + content + closingTag;
            } else {
                // Block element with block children - format with line breaks and indentation
                return '\n' + indent + openingTag + content + '\n' + indent + closingTag;
            }
        } else {
            // Inline element - always on same line
            return openingTag + content + closingTag;
        }
    }
    
    /**
     * Format HTML in compact style
     * @param {string} html - Raw HTML string
     * @returns {string} - Formatted HTML with nested tags on same line
     */
    function formatCompact(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }
        
        // Try to use DOM parser if available (browser environment)
        if (typeof DOMParser !== 'undefined') {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Format the body content
                let result = '';
                for (let i = 0; i < doc.body.childNodes.length; i++) {
                    const node = doc.body.childNodes[i];
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const formatted = formatElement(node, false, 0); // Start with indent level 0
                        result += formatted;
                    } else if (node.nodeType === Node.TEXT_NODE) {
                        const text = node.textContent.trim();
                        if (text) {
                            result += '\n' + text;
                        }
                    }
                }
                
                // Clean up: remove leading newline, trim trailing whitespace only (preserve indentation)
                result = result.split('\n')
                    .map(line => line.replace(/\s+$/, '')) // Remove trailing whitespace only
                    .filter(line => line.length > 0)
                    .join('\n');
                
                // Fix self-closing tags that were incorrectly serialized (e.g., <br></br> -> <br>)
                result = result.replace(/<(br|hr|img|input|meta|link|area|base|col|embed|source|track|wbr)><\/\1>/gi, '<$1>');
                
                // Remove empty inline elements
                result = result.replace(/<(em|i|strong|b|span|code|sup|sub|small|mark|del|ins|u|abbr|cite|q|samp|var)><\/\1>/g, '');
                
                // Remove empty block elements (like empty <p></p>), but preserve spacing elements
                // Don't remove <p>&nbsp;</p> or <p> with only non-breaking space
                result = result.replace(/<p><\/p>/g, '');
                result = result.replace(/<p>(\s|&nbsp;|\u00A0)*<\/p>/g, (match) => {
                    // Check if it contains &nbsp; or non-breaking space - preserve spacing elements
                    if (match.includes('&nbsp;') || match.includes('\u00A0')) {
                        return '<p>&nbsp;</p>'; // Normalize to &nbsp; entity
                    }
                    return ''; // Remove truly empty paragraphs
                });
                
                return result.replace(/\n{3,}/g, '\n\n').trim();
            } catch (e) {
                // Fall through to regex-based approach if DOM parsing fails
                console.warn('DOM parsing failed, using regex fallback:', e);
            }
        }
        
        // Fallback: regex-based approach (for Node.js or if DOM parsing fails)
        let formatted = html.trim();
        formatted = formatted.replace(/>\s+</g, '><');
        
        // Add line breaks before opening block elements
        formatted = formatted.replace(/(<)([^<]+?)(>)/g, (match, open, tagContent, close) => {
            const tagMatch = tagContent.match(/^(\w+)/);
            if (!tagMatch) return match;
            
            const tagName = tagMatch[1].toLowerCase();
            const isClosing = tagContent.trim().startsWith('/');
            const isSelfClosing = tagContent.trim().endsWith('/') || SELF_CLOSING.includes(tagName);
            
            if (isSelfClosing) return match;
            if (!isClosing && BLOCK_ELEMENTS.includes(tagName)) {
                return '\n' + match;
            }
            return match;
        });
        
        // Post-process to merge closing tags
        const lines = formatted.split('\n');
        const processed = [];
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) continue;
            
            const openingMatch = line.match(/^(<(\w+)[^>]*>)(.*)$/);
            if (openingMatch) {
                const [, openingTag, tagName] = openingMatch;
                const rest = openingMatch[3];
                const tag = tagName.toLowerCase();
                
                if (BLOCK_ELEMENTS.includes(tag)) {
                    const closingTag = `</${tagName}>`;
                    const closingIndex = rest.indexOf(closingTag);
                    
                    if (closingIndex !== -1) {
                        const content = rest.substring(0, closingIndex);
                        const afterClosing = rest.substring(closingIndex + closingTag.length);
                        
                        if (isInlineOnly(content) || !content.trim()) {
                            processed.push(line);
                            if (afterClosing.trim()) {
                                lines[i + 1] = (lines[i + 1] || '') + afterClosing;
                            }
                            continue;
                        }
                    } else if (i + 1 < lines.length && lines[i + 1].trim() === closingTag) {
                        if (isInlineOnly(rest) || !rest.trim()) {
                            processed.push(line + rest + closingTag);
                            i++;
                            continue;
                        }
                    }
                }
            }
            
            processed.push(line);
        }
        
        const result = processed
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
        
        return result.replace(/\n{3,}/g, '\n\n').trim();
    }

    /**
     * Check if HTML contains only inline elements
     * @param {string} html - HTML string to check
     * @returns {boolean} - True if only inline elements
     */
    function isInlineOnly(html) {
        // Extract all tag names
        const tagMatches = html.match(/<\/?(\w+)[\s>]/g);
        if (!tagMatches) return true;
        
        for (const match of tagMatches) {
            const tagName = match.replace(/[<\/\s>]/g, '').toLowerCase();
            if (BLOCK_ELEMENTS.includes(tagName)) {
                return false;
            }
        }
        
        return true;
    }

    // Export for use in other modules
    if (typeof window !== 'undefined') {
        window.HTMLFormatter = {
            formatCompact: formatCompact
        };
    }

    // Also export for Node.js/CommonJS if needed
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { formatCompact: formatCompact };
    }
})();

