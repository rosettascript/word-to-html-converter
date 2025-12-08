// Mode Utility: OL Header Conversion
// Converts single <ol> elements containing headers into manually numbered headers
// Only applies if the header list is not followed by another header list

(function() {
    'use strict';

    /**
     * Check if an <ol> element contains only headers wrapped in <li><strong><hX>...</hX></strong></li>
     * @param {HTMLElement} olElement - The <ol> element to check
     * @returns {boolean} - True if it contains only headers
     */
    function isHeaderList(olElement) {
        const listItems = olElement.querySelectorAll(':scope > li');
        
        if (listItems.length === 0) {
            return false;
        }

        // Check if all <li> elements contain only a <strong> tag with a single heading inside
        for (const li of listItems) {
            const children = Array.from(li.childNodes);
            
            // Should have only one child element (the <strong> tag)
            const elementChildren = children.filter(node => node.nodeType === 1); // Element nodes
            if (elementChildren.length !== 1) {
                return false;
            }

            const strongTag = elementChildren[0];
            if (strongTag.tagName.toLowerCase() !== 'strong') {
                return false;
            }

            // The <strong> should contain only a single heading
            const headingChildren = Array.from(strongTag.children).filter(
                node => /^h[1-6]$/i.test(node.tagName)
            );
            
            if (headingChildren.length !== 1) {
                return false;
            }

            // Check for any text nodes that aren't just whitespace
            const textNodes = Array.from(strongTag.childNodes).filter(
                node => node.nodeType === 3 && node.textContent.trim() !== ''
            );
            if (textNodes.length > 0) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if the next sibling element is another header list
     * @param {HTMLElement} element - The element to check from
     * @returns {boolean} - True if next sibling is a header list
     */
    function isFollowedByHeaderList(element) {
        let nextSibling = element.nextElementSibling;
        
        // Skip text nodes and spacing elements
        while (nextSibling) {
            // Check if it's a spacing paragraph
            if (nextSibling.tagName.toLowerCase() === 'p') {
                const text = nextSibling.textContent.trim();
                if (text === '' || text === '\u00A0' || text === '&nbsp;') {
                    nextSibling = nextSibling.nextElementSibling;
                    continue;
                }
            }
            
            // Check if it's an <ol> with headers
            if (nextSibling.tagName.toLowerCase() === 'ol' && isHeaderList(nextSibling)) {
                return true;
            }
            
            break;
        }
        
        return false;
    }

    /**
     * Convert <ol> containing headers to manually numbered headers
     * @param {string} html - HTML string
     * @returns {string} - Modified HTML string
     */
    function convertOlHeaders(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        if (typeof DOMParser !== 'undefined') {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Find all <ol> elements
                const olElements = doc.querySelectorAll('ol');
                const olsToProcess = [];

                // First pass: identify which <ol> elements to process
                olElements.forEach(ol => {
                    if (isHeaderList(ol) && !isFollowedByHeaderList(ol)) {
                        olsToProcess.push(ol);
                    }
                });

                // Second pass: process elements in document order, grouping by parent h2 section
                // Get all body children in document order
                const bodyChildren = Array.from(doc.body.children);
                
                // Map to track counters per h2 section (using h2 element as key)
                const sectionCounters = new Map();
                
                // Process each OL in document order
                olsToProcess.forEach(ol => {
                    // Find the position of this OL in the document
                    const olIndex = bodyChildren.indexOf(ol);
                    
                    // Find the most recent h2 heading before this OL
                    let parentH2 = null;
                    for (let i = olIndex - 1; i >= 0; i--) {
                        const element = bodyChildren[i];
                        if (!element) continue;
                        
                        const tagName = element.tagName.toLowerCase();
                        if (tagName === 'h2') {
                            parentH2 = element;
                            break;
                        }
                        // If we encounter an h1, stop looking (h1 is a new top-level section)
                        if (tagName === 'h1') {
                            break;
                        }
                    }
                    
                    // Get or create counter for this h2 section
                    // Use null as key if no h2 found (for content before first h2)
                    const sectionKey = parentH2 || null;
                    if (!sectionCounters.has(sectionKey)) {
                        sectionCounters.set(sectionKey, 1);
                    }
                    
                    const counter = sectionCounters.get(sectionKey);
                    
                    const listItems = ol.querySelectorAll(':scope > li');
                    const newElements = [];

                    listItems.forEach((li) => {
                        const strongTag = li.querySelector(':scope > strong');
                        if (!strongTag) return;

                        const heading = strongTag.querySelector('h1, h2, h3, h4, h5, h6');
                        if (!heading) return;

                        // Clone the heading to preserve its structure (including any <strong> tags inside)
                        const newHeading = heading.cloneNode(true);
                        
                        // Find the <strong> tag inside the heading (from mode-heading-strong.js)
                        // We don't create <strong> tags here - let the heading strong feature handle that
                        const innerStrong = newHeading.querySelector(':scope > strong');
                        
                        if (innerStrong) {
                            // Heading already has <strong> tag (from heading strong feature), add number prefix to text inside
                            const originalText = innerStrong.textContent.trim();
                            innerStrong.textContent = `${counter}. ${originalText}`;
                        } else {
                            // No <strong> tag (heading strong feature is disabled), just add number prefix to heading text
                            // Prepend the number to the heading's text content
                            const headingText = newHeading.textContent.trim();
                            // Clear and set text content with number prefix
                            newHeading.textContent = `${counter}. ${headingText}`;
                        }
                        
                        // Increment the counter for this section
                        sectionCounters.set(sectionKey, counter + 1);
                        
                        newElements.push(newHeading);
                    });

                    // Replace the <ol> with the new headings
                    if (newElements.length > 0) {
                        // Insert all new headings before the <ol>
                        newElements.forEach((heading, index) => {
                            if (index === 0) {
                                ol.parentNode.insertBefore(heading, ol);
                            } else {
                                // Insert after the previous heading
                                const previousHeading = newElements[index - 1];
                                previousHeading.parentNode.insertBefore(heading, previousHeading.nextSibling);
                            }
                        });
                        
                        // Remove the original <ol>
                        ol.remove();
                    }
                });

                return doc.body.innerHTML;
            } catch (e) {
                console.warn('OL header conversion failed, using original HTML:', e);
                return html;
            }
        }

        return html;
    }

    // Export for use in other modules
    if (typeof window !== 'undefined') {
        window.ModeOlHeaderConversion = {
            convert: convertOlHeaders
        };
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { convert: convertOlHeaders };
    }
})();

