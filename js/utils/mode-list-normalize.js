// Mode Utility: List Normalization
// Normalizes list items with colons in <strong> tags
// Removes space before </strong> when colon is present and ensures space after </strong>

(function() {
    'use strict';

    /**
     * Normalize list items with colons in <strong> tags
     * @param {string} html - HTML string
     * @returns {string} - Modified HTML string
     */
    function normalizeLists(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        if (typeof DOMParser !== 'undefined') {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Find all <li> elements
                const listItems = doc.querySelectorAll('li');
                
                listItems.forEach(li => {
                    // Find <strong> tags within this list item
                    const strongTags = li.querySelectorAll('strong');
                    
                    strongTags.forEach(strong => {
                        // Get the text content of the strong tag
                        const strongText = strong.textContent || '';
                        
                        // Check if the text ends with a colon (with or without trailing space)
                        if (strongText.trim().endsWith(':')) {
                            // Step 1: Remove trailing space from innerHTML if present
                            let strongHTML = strong.innerHTML;
                            strongHTML = strongHTML.replace(/:\s+$/, ':');
                            strong.innerHTML = strongHTML;
                            
                            // Step 2: Ensure there's exactly one space after </strong>
                            let nextNode = strong.nextSibling;
                            
                            if (nextNode && nextNode.nodeType === Node.TEXT_NODE) {
                                // There's a text node after strong - normalize it
                                let text = nextNode.textContent || '';
                                text = text.trim();
                                if (text) {
                                    // Ensure it starts with exactly one space
                                    nextNode.textContent = ' ' + text;
                                } else {
                                    // Text node exists but is empty/whitespace, replace with single space
                                    nextNode.textContent = ' ';
                                }
                            } else {
                                // No text node after strong, or next node is an element
                                // Insert a text node with a space
                                const spaceNode = doc.createTextNode(' ');
                                if (nextNode) {
                                    li.insertBefore(spaceNode, nextNode);
                                } else {
                                    li.appendChild(spaceNode);
                                }
                            }
                        }
                    });
                });
                
                return doc.body.innerHTML;
            } catch (e) {
                console.warn('List normalization failed, using original HTML:', e);
                return html;
            }
        }
        
        return html;
    }

    // Export for use in other modules
    if (typeof window !== 'undefined') {
        window.ModeListNormalize = {
            normalize: normalizeLists
        };
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { normalize: normalizeLists };
    }
})();

