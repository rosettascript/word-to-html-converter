// Mode Utility: Spacing Rules
// Adds <p>&nbsp;</p> spacing elements in specific locations

(function() {
    'use strict';

    /**
     * Add spacing elements according to Blogs mode rules
     * @param {string} html - HTML string
     * @returns {string} - Modified HTML string
     */
    function addSpacing(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        if (typeof DOMParser !== 'undefined') {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Process in reverse order to avoid issues with NodeList becoming stale
                // 6. Add spacing before "Alt Image Text:" paragraphs (process first)
                addSpacingBeforeAltImageText(doc);
                
                // 5. Add spacing before "Disclaimer:" section
                addSpacingBeforeDisclaimer(doc);
                
                // 4. Add spacing before "Sources:" section
                addSpacingBeforeSources(doc);
                
                // 3. Add spacing before "Read also:" / "Read more:" / "See more:" sections
                addSpacingBeforeReadSection(doc);
                
                // 2. Add spacing before headings (except Key Takeaways and first FAQ question)
                addSpacingBeforeHeadings(doc);
                
                // 1. Add spacing after Key Takeaways section (process last to avoid interfering)
                addSpacingAfterKeyTakeaways(doc);
                
                const result = doc.body.innerHTML;
                return result;
            } catch (e) {
                console.warn('Spacing addition failed, using original HTML:', e);
                return html;
            }
        }
        
        return html;
    }

    /**
     * Check if an element is a spacing element (<p>&nbsp;</p>)
     * @param {Element} element - Element to check
     * @returns {boolean} - True if element is a spacing paragraph
     */
    function isSpacingElement(element) {
        if (!element || element.tagName.toLowerCase() !== 'p') {
            return false;
        }
        // Get text content (this will convert &nbsp; to actual space character)
        const text = (element.textContent || element.innerText || '').trim();
        const html = element.innerHTML.trim();
        
        // A spacing element must contain ONLY a non-breaking space (no other content)
        // Check if HTML is exactly &nbsp; or contains only the non-breaking space character
        const isOnlyNbsp = (html === '&nbsp;' || html === '\u00A0');
        const isOnlySpaceChar = (text === '\u00A0' || text === '');
        
        // Must be both: HTML is only &nbsp; AND text is only space character
        // This ensures we don't match paragraphs that contain &nbsp; along with other content
        return isOnlyNbsp && isOnlySpaceChar;
    }

    /**
     * Add spacing after Key Takeaways section
     */
    function addSpacingAfterKeyTakeaways(doc) {
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
            let nextSibling = keyTakeawaysHeading.nextElementSibling;
            while (nextSibling && nextSibling.tagName.toLowerCase() !== 'ul') {
                nextSibling = nextSibling.nextElementSibling;
            }
            
            if (nextSibling && nextSibling.tagName.toLowerCase() === 'ul') {
                // Check if spacing already exists
                let elementAfterUl = nextSibling.nextElementSibling;
                const hasExistingSpacing = elementAfterUl && isSpacingElement(elementAfterUl);
                if (hasExistingSpacing) {
                    return; // Spacing already exists
                }
                
                // Create spacing element
                const spacing = doc.createElement('p');
                spacing.innerHTML = '&nbsp;';
                nextSibling.parentNode.insertBefore(spacing, elementAfterUl);
            }
        }
    }

    /**
     * Add spacing before headings (except Key Takeaways and first FAQ question)
     */
    function addSpacingBeforeHeadings(doc) {
        const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let isFirstFaqQuestion = false;
        let foundFaqSection = false;
        
        headings.forEach((heading, index) => {
            const text = heading.textContent.trim().toLowerCase();
            
            // Skip Key Takeaways heading
            if (text.includes('key takeaways')) {
                return;
            }
            
            // Check if we're in FAQ section (but don't skip the FAQ heading itself - it needs spacing)
            if (text.includes('frequently asked questions') || text.includes('faq')) {
                foundFaqSection = true;
                isFirstFaqQuestion = true;
                // Don't return - continue to add spacing before the FAQ heading
            }
            
            // Skip first question in FAQ section (only h3 questions, not the FAQ heading itself)
            if (foundFaqSection && isFirstFaqQuestion && heading.tagName.toLowerCase() === 'h3') {
                isFirstFaqQuestion = false;
                return;
            }
            
            // Check if spacing already exists before this heading
            // Check previous element sibling first
            let prevSibling = heading.previousElementSibling;
            const hasExistingSpacing = prevSibling && isSpacingElement(prevSibling);
            if (hasExistingSpacing) {
                return; // Spacing already exists
            }
            
            // Also check if there's a text node with only whitespace before the heading
            // and if the previous element is a spacing paragraph
            let node = heading.previousSibling;
            while (node && node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
                node = node.previousSibling;
            }
            if (node && node.nodeType === Node.ELEMENT_NODE && isSpacingElement(node)) {
                return; // Spacing already exists
            }
            
            // Create spacing element
            const spacing = doc.createElement('p');
            spacing.innerHTML = '&nbsp;';
            heading.parentNode.insertBefore(spacing, heading);
        });
    }

    /**
     * Add spacing before "Read also:" / "Read more:" / "See more:" sections
     */
    function addSpacingBeforeReadSection(doc) {
        const paragraphs = doc.querySelectorAll('p');
        
        paragraphs.forEach(p => {
            const text = p.textContent.trim().toLowerCase();
            // Check if paragraph contains "read also:", "read more:", or "see more:"
            if ((text.includes('read also:') || 
                 text.includes('read more:') || 
                 text.includes('see more:'))) {
                
                // Check if spacing already exists
                let prevSibling = p.previousElementSibling;
                if (prevSibling && isSpacingElement(prevSibling)) {
                    return; // Spacing already exists
                }
                
                // Check previous sibling (could be text node)
                let node = p.previousSibling;
                while (node && node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
                    node = node.previousSibling;
                }
                if (node && node.nodeType === Node.ELEMENT_NODE && isSpacingElement(node)) {
                    return; // Spacing already exists
                }
                
                // Create spacing element
                const spacing = doc.createElement('p');
                spacing.innerHTML = '&nbsp;';
                p.parentNode.insertBefore(spacing, p);
            }
        });
    }

    /**
     * Add spacing before "Sources:" section
     */
    function addSpacingBeforeSources(doc) {
        const paragraphs = doc.querySelectorAll('p');
        
        paragraphs.forEach(p => {
            const text = p.textContent.trim().toLowerCase();
            if (text.startsWith('sources:') &&
                p.previousElementSibling &&
                p.previousElementSibling.tagName.toLowerCase() === 'p' &&
                p.previousElementSibling.innerHTML.trim() !== '&nbsp;') {
                
                // Create spacing element
                const spacing = doc.createElement('p');
                spacing.innerHTML = '&nbsp;';
                p.parentNode.insertBefore(spacing, p);
            }
        });
    }

    /**
     * Add spacing before "Disclaimer:" section
     */
    function addSpacingBeforeDisclaimer(doc) {
        const paragraphs = doc.querySelectorAll('p');
        
        paragraphs.forEach(p => {
            const text = p.textContent.trim().toLowerCase();
            if (text.startsWith('disclaimer:')) {
                
                // Check if spacing already exists
                let prevSibling = p.previousElementSibling;
                const hasExistingSpacing = prevSibling && isSpacingElement(prevSibling);
                if (hasExistingSpacing) {
                    return; // Spacing already exists
                }
                
                // Check previous sibling (could be text node)
                let node = p.previousSibling;
                while (node && node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
                    node = node.previousSibling;
                }
                if (node && node.nodeType === Node.ELEMENT_NODE && isSpacingElement(node)) {
                    return; // Spacing already exists
                }
                
                // Create spacing element
                const spacing = doc.createElement('p');
                spacing.innerHTML = '&nbsp;';
                p.parentNode.insertBefore(spacing, p);
            }
        });
    }

    /**
     * Add spacing before "Alt Image Text:" paragraphs
     */
    function addSpacingBeforeAltImageText(doc) {
        const paragraphs = doc.querySelectorAll('p');
        
        paragraphs.forEach(p => {
            const text = p.textContent.trim().toLowerCase();
            // Check if paragraph contains "alt image text:" (not just starts with)
            if (text.includes('alt image text:')) {
                
                // Check if spacing already exists
                let prevSibling = p.previousElementSibling;
                const hasExistingSpacing = prevSibling && isSpacingElement(prevSibling);
                if (hasExistingSpacing) {
                    return; // Spacing already exists
                }
                
                // Check previous sibling (could be text node)
                let node = p.previousSibling;
                while (node && node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
                    node = node.previousSibling;
                }
                if (node && node.nodeType === Node.ELEMENT_NODE && isSpacingElement(node)) {
                    return; // Spacing already exists
                }
                
                // Create spacing element
                const spacing = doc.createElement('p');
                spacing.innerHTML = '&nbsp;';
                p.parentNode.insertBefore(spacing, p);
            }
        });
    }

    // Export for use in other modules
    if (typeof window !== 'undefined') {
        window.ModeSpacing = {
            add: addSpacing
        };
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { add: addSpacing };
    }
})();

