// Mode Utility: Key Takeaways Formatting
// Removes <em> tags from Key Takeaways section for Blogs mode

(function() {
    'use strict';

    /**
     * Remove <em> tags from Key Takeaways section
     * @param {string} html - HTML string
     * @returns {string} - Modified HTML string
     */
    function formatKeyTakeaways(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        if (typeof DOMParser !== 'undefined') {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Find Key Takeaways heading (h2 containing "Key Takeaways")
                const headings = doc.querySelectorAll('h2');
                let keyTakeawaysHeading = null;
                
                for (let heading of headings) {
                    const text = heading.textContent.trim();
                    if (text.toLowerCase().includes('key takeaways')) {
                        keyTakeawaysHeading = heading;
                        break;
                    }
                }
                
                if (keyTakeawaysHeading) {
                    // Format the heading: ensure it ends with colon (strong tags are handled by mode-heading-strong.js)
                    formatKeyTakeawaysHeading(keyTakeawaysHeading);
                    
                    // Find the next <ul> after the heading
                    let nextSibling = keyTakeawaysHeading.nextElementSibling;
                    while (nextSibling && nextSibling.tagName.toLowerCase() !== 'ul') {
                        nextSibling = nextSibling.nextElementSibling;
                    }
                    
                    if (nextSibling && nextSibling.tagName.toLowerCase() === 'ul') {
                        // Remove <em> tags from all <li> elements in the list
                        const listItems = nextSibling.querySelectorAll('li');
                        listItems.forEach(li => {
                            removeEmTags(li);
                        });
                    }
                }
                
                return doc.body.innerHTML;
            } catch (e) {
                console.warn('Key Takeaways formatting failed, using original HTML:', e);
                return html;
            }
        }
        
        return html;
    }

    /**
     * Format Key Takeaways heading: ensure it ends with colon
     * Note: Strong tag wrapping is handled by mode-heading-strong.js
     * @param {Element} heading - The h2 heading element
     */
    function formatKeyTakeawaysHeading(heading) {
        if (!heading) return;
        
        // Get the text content (preserving any existing strong tags)
        let text = heading.textContent.trim();
        
        // Remove any existing <em> tags first
        removeEmTags(heading);
        
        // Get clean text again after removing em tags
        text = heading.textContent.trim();
        
        // Ensure it ends with colon
        if (!text.endsWith(':')) {
            // Check if heading already has strong tags (from mode-heading-strong.js)
            const strongTag = heading.querySelector('strong');
            if (strongTag) {
                // If strong tag exists, update its text content
                strongTag.textContent = text + ':';
            } else {
                // If no strong tag, just update the heading text
                heading.textContent = text + ':';
            }
        }
    }

    /**
     * Remove <em> tags from an element while preserving content
     * @param {Element} element - DOM element to process
     */
    function removeEmTags(element) {
        if (!element) return;
        
        // Find all <em> tags within the element
        const emTags = element.querySelectorAll('em');
        
        emTags.forEach(em => {
            // Move all children of <em> to its parent
            const parent = em.parentNode;
            while (em.firstChild) {
                parent.insertBefore(em.firstChild, em);
            }
            // Remove the empty <em> tag
            parent.removeChild(em);
        });
        
        // Also check if the element itself is an <em> tag
        if (element.tagName.toLowerCase() === 'em') {
            const parent = element.parentNode;
            while (element.firstChild) {
                parent.insertBefore(element.firstChild, element);
            }
            parent.removeChild(element);
        }
    }

    // Export for use in other modules
    if (typeof window !== 'undefined') {
        window.ModeKeyTakeaways = {
            format: formatKeyTakeaways
        };
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { format: formatKeyTakeaways };
    }
})();

