// Mode Utility: Sources Normalization
// Normalizes Sources section formatting for Blogs and Shoppables modes
// Ensures Sources: is in <p><strong><em>Sources:</em></strong></p> format
// Ensures all list items in the Sources <ol> are wrapped in <em> tags

(function() {
    'use strict';

    /**
     * Normalize Sources section formatting
     * @param {string} html - HTML string
     * @returns {string} - Modified HTML string
     */
    function normalizeSources(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        if (typeof DOMParser !== 'undefined') {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Find all paragraphs
                const paragraphs = doc.querySelectorAll('p');
                
                paragraphs.forEach(p => {
                    const text = p.textContent.trim();
                    const lowerText = text.toLowerCase();
                    
                    // Check if paragraph contains "Sources:" (case-insensitive, with or without colon)
                    if (lowerText === 'sources' || lowerText === 'sources:') {
                        // Normalize the Sources paragraph
                        normalizeSourcesParagraph(p, doc);
                        
                        // Find the next <ol> after this paragraph
                        let nextSibling = p.nextElementSibling;
                        while (nextSibling && nextSibling.tagName.toLowerCase() !== 'ol') {
                            nextSibling = nextSibling.nextElementSibling;
                        }
                        
                        if (nextSibling && nextSibling.tagName.toLowerCase() === 'ol') {
                            // Normalize all list items in the Sources <ol>
                            normalizeSourcesListItems(nextSibling, doc);
                        }
                    }
                });
                
                return doc.body.innerHTML;
            } catch (e) {
                console.warn('Sources normalization failed, using original HTML:', e);
                return html;
            }
        }
        
        return html;
    }

    /**
     * Normalize Sources paragraph to <p><strong><em>Sources:</em></strong></p>
     * @param {Element} paragraph - The paragraph element containing "Sources:"
     * @param {Document} doc - The document object
     */
    function normalizeSourcesParagraph(paragraph, doc) {
        if (!paragraph) return;
        
        // Clear the paragraph content
        paragraph.innerHTML = '';
        
        // Create <strong> tag
        const strong = doc.createElement('strong');
        
        // Create <em> tag
        const em = doc.createElement('em');
        em.textContent = 'Sources:';
        
        // Nest: strong > em
        strong.appendChild(em);
        
        // Add to paragraph
        paragraph.appendChild(strong);
    }

    /**
     * Normalize all list items in Sources <ol> to wrap content in <em> tags
     * @param {Element} olElement - The <ol> element
     * @param {Document} doc - The document object
     */
    function normalizeSourcesListItems(olElement, doc) {
        if (!olElement || !doc) return;
        
        const listItems = olElement.querySelectorAll('li');
        
        listItems.forEach(li => {
            // Check if the list item already has <em> wrapping all content
            // If it has exactly one child and that child is an <em>, it's already normalized
            if (li.children.length === 1 && li.children[0].tagName.toLowerCase() === 'em') {
                // Check if there are any text nodes outside the <em>
                const hasTextOutside = Array.from(li.childNodes).some(node => 
                    node.nodeType === Node.TEXT_NODE && 
                    node !== li.children[0] && 
                    node.textContent.trim()
                );
                if (!hasTextOutside) {
                    return; // Already properly wrapped
                }
            }
            
            // Need to wrap all content in a single <em> tag
            // Collect all child nodes first (before clearing)
            const children = Array.from(li.childNodes);
            
            // Clear the list item
            li.innerHTML = '';
            
            // Create a new <em> element
            const em = doc.createElement('em');
            
            // Move all children into the <em> element
            children.forEach(child => {
                em.appendChild(child);
            });
            
            // Add the <em> to the list item
            li.appendChild(em);
        });
    }

    // Export for use in other modules
    if (typeof window !== 'undefined') {
        window.ModeSourcesNormalize = {
            normalize: normalizeSources
        };
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { normalize: normalizeSources };
    }
})();

