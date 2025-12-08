// Mode Utility: H1 Removal
// Removes H1 tags that appear immediately after Key Takeaways section

(function() {
    'use strict';

    /**
     * Remove H1 tags that appear immediately after Key Takeaways section
     * @param {string} html - HTML string
     * @returns {string} - Modified HTML string
     */
    function removeH1AfterKeyTakeaways(html) {
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
                    // Find the next <ul> after the heading
                    let nextSibling = keyTakeawaysHeading.nextElementSibling;
                    while (nextSibling && nextSibling.tagName.toLowerCase() !== 'ul') {
                        nextSibling = nextSibling.nextElementSibling;
                    }
                    
                    if (nextSibling && nextSibling.tagName.toLowerCase() === 'ul') {
                        // Find the element immediately after the <ul>
                        let elementAfterUl = nextSibling.nextElementSibling;
                        
                        // Skip whitespace text nodes
                        while (elementAfterUl && 
                               elementAfterUl.nodeType === Node.TEXT_NODE && 
                               !elementAfterUl.textContent.trim()) {
                            elementAfterUl = elementAfterUl.nextElementSibling;
                        }
                        
                        // If it's an H1, remove it
                        if (elementAfterUl && elementAfterUl.tagName.toLowerCase() === 'h1') {
                            elementAfterUl.remove();
                        }
                    }
                }
                
                return doc.body.innerHTML;
            } catch (e) {
                console.warn('H1 removal failed, using original HTML:', e);
                return html;
            }
        }
        
        return html;
    }

    // Export for use in other modules
    if (typeof window !== 'undefined') {
        window.ModeH1Removal = {
            remove: removeH1AfterKeyTakeaways
        };
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { remove: removeH1AfterKeyTakeaways };
    }
})();

