// Mode Utility: Heading Strong Tags
// Wraps all heading content in <strong> tags for Blogs and Shoppables modes

(function() {
    'use strict';

    /**
     * Wrap all heading content in <strong> tags
     * @param {string} html - HTML string
     * @returns {string} - Modified HTML string
     */
    function wrapHeadingsInStrong(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        if (typeof DOMParser !== 'undefined') {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Process all headings (h1 through h6)
                const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
                
                headings.forEach(heading => {
                    // Check if content is already wrapped in <strong>
                    // If the heading has only one child element and it's a <strong> tag, skip
                    const children = Array.from(heading.children);
                    if (children.length === 1 && children[0].tagName.toLowerCase() === 'strong') {
                        // Already wrapped, skip
                        return;
                    }
                    
                    // Get all child nodes (text and elements)
                    const childNodes = Array.from(heading.childNodes);
                    
                    if (childNodes.length === 0) {
                        // Empty heading, skip
                        return;
                    }
                    
                    // Create a <strong> element
                    const strong = doc.createElement('strong');
                    
                    // Move all child nodes into the <strong> element
                    childNodes.forEach(node => {
                        strong.appendChild(node.cloneNode(true));
                    });
                    
                    // Clear the heading and add the <strong> element
                    heading.innerHTML = '';
                    heading.appendChild(strong);
                });
                
                return doc.body.innerHTML;
            } catch (e) {
                console.warn('Heading strong tag wrapping failed, using original HTML:', e);
                return html;
            }
        }
        
        return html;
    }

    // Export for use in other modules
    if (typeof window !== 'undefined') {
        window.ModeHeadingStrong = {
            wrap: wrapHeadingsInStrong
        };
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { wrap: wrapHeadingsInStrong };
    }
})();

