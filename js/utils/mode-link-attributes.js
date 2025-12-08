// Mode Utility: Link Attributes
// Adds target="_blank" rel="noopener noreferrer" to all links

(function() {
    'use strict';

    /**
     * Add target="_blank" rel="noopener noreferrer" to all links
     * @param {string} html - HTML string
     * @returns {string} - Modified HTML string
     */
    function addLinkAttributes(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        if (typeof DOMParser !== 'undefined') {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Find all <a> tags
                const links = doc.querySelectorAll('a[href]');
                
                links.forEach(link => {
                    // Add target="_blank" if not already present
                    if (!link.hasAttribute('target')) {
                        link.setAttribute('target', '_blank');
                    }
                    
                    // Add rel="noopener noreferrer" if not already present
                    if (!link.hasAttribute('rel')) {
                        link.setAttribute('rel', 'noopener noreferrer');
                    } else {
                        // Check if rel already contains noopener and noreferrer
                        const rel = link.getAttribute('rel');
                        let newRel = rel;
                        
                        if (!rel.includes('noopener')) {
                            newRel = newRel ? newRel + ' noopener' : 'noopener';
                        }
                        if (!rel.includes('noreferrer')) {
                            newRel = newRel ? newRel + ' noreferrer' : 'noreferrer';
                        }
                        
                        if (newRel !== rel) {
                            link.setAttribute('rel', newRel);
                        }
                    }
                });
                
                return doc.body.innerHTML;
            } catch (e) {
                console.warn('Link attributes addition failed, using original HTML:', e);
                return html;
            }
        }
        
        return html;
    }

    // Export for use in other modules
    if (typeof window !== 'undefined') {
        window.ModeLinkAttributes = {
            add: addLinkAttributes
        };
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { add: addLinkAttributes };
    }
})();

