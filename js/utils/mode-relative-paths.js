// Mode Utility: Relative Paths
// Converts absolute URLs to relative paths by removing domain

(function() {
    'use strict';

    /**
     * Convert absolute URLs to relative paths
     * @param {string} html - HTML string
     * @returns {string} - Modified HTML string
     */
    function convertToRelativePaths(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        if (typeof DOMParser !== 'undefined') {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Process all anchor tags
                const links = doc.querySelectorAll('a[href]');
                
                links.forEach(link => {
                    const href = link.getAttribute('href');
                    if (!href) return;
                    
                    // Skip if already a relative path (starts with / or ./ or ../)
                    if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../') || !href.includes('://')) {
                        return;
                    }
                    
                    try {
                        // Parse the URL
                        const url = new URL(href);
                        
                        // Extract the pathname, search, and hash (relative path)
                        const relativePath = url.pathname + url.search + url.hash;
                        
                        // Update the href attribute
                        link.setAttribute('href', relativePath);
                    } catch (e) {
                        // If URL parsing fails (e.g., malformed URL), leave as is
                        // This handles cases where href is malformed
                    }
                });
                
                return doc.body.innerHTML;
            } catch (e) {
                console.warn('Relative path conversion failed, using original HTML:', e);
                return html;
            }
        }
        
        return html;
    }

    // Export for use in other modules
    if (typeof window !== 'undefined') {
        window.ModeRelativePaths = {
            convert: convertToRelativePaths
        };
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { convert: convertToRelativePaths };
    }
})();

