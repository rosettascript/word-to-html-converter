// HTML Validator
// Validates that all features from each output format are working correctly

(function() {
    'use strict';

    const SERVER_ENDPOINT = 'http://127.0.0.1:7242/ingest/4b025f43-d5ce-4c48-b933-268d17ef9e8c';

    /**
     * Log validation result
     */
    function logValidation(location, message, data, hypothesisId) {
        try {
            fetch(SERVER_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location: location,
                    message: message,
                    data: data || {},
                    timestamp: Date.now(),
                    sessionId: 'validator-session',
                    runId: 'validation-run',
                    hypothesisId: hypothesisId || 'validation'
                })
            }).catch(() => {});
        } catch (e) {
            // Silent fail for logging
        }
    }

    /**
     * Test result structure
     */
    class TestResult {
        constructor(feature, mode, passed, message, details) {
            this.feature = feature;
            this.mode = mode;
            this.passed = passed;
            this.message = message;
            this.details = details || null;
        }
    }

    /**
     * Validation suite results
     */
    class ValidationResults {
        constructor() {
            this.results = [];
            this.summary = {
                total: 0,
                passed: 0,
                failed: 0,
                byMode: {
                    regular: { total: 0, passed: 0, failed: 0 },
                    blogs: { total: 0, passed: 0, failed: 0 },
                    shoppables: { total: 0, passed: 0, failed: 0 }
                }
            };
        }

        addResult(result) {
            this.results.push(result);
            this.summary.total++;
            this.summary.byMode[result.mode].total++;
            
            if (result.passed) {
                this.summary.passed++;
                this.summary.byMode[result.mode].passed++;
            } else {
                this.summary.failed++;
                this.summary.byMode[result.mode].failed++;
            }
        }

        getReport() {
            let report = '\n=== VALIDATION REPORT ===\n\n';
            
            // Summary
            report += `Total Tests: ${this.summary.total}\n`;
            report += `Passed: ${this.summary.passed}\n`;
            report += `Failed: ${this.summary.failed}\n\n`;
            
            // By mode
            report += 'By Mode:\n';
            ['regular', 'blogs', 'shoppables'].forEach(mode => {
                const modeStats = this.summary.byMode[mode];
                report += `  ${mode.toUpperCase()}: ${modeStats.passed}/${modeStats.total} passed\n`;
            });
            
            report += '\n=== DETAILED RESULTS ===\n\n';
            
            // Group by mode
            ['regular', 'blogs', 'shoppables'].forEach(mode => {
                const modeResults = this.results.filter(r => r.mode === mode);
                if (modeResults.length === 0) return;
                
                report += `\n${mode.toUpperCase()} MODE:\n`;
                modeResults.forEach(result => {
                    const status = result.passed ? '✓ PASS' : '✗ FAIL';
                    report += `  ${status} - ${result.feature}\n`;
                    if (result.message) {
                        report += `    ${result.message}\n`;
                    }
                    if (result.details && !result.passed) {
                        report += `    Details: ${JSON.stringify(result.details)}\n`;
                    }
                });
            });
            
            return report;
        }
    }

    /**
     * Validate Heading Strong Tags feature
     */
    function validateHeadingStrong(html, mode) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        if (mode === 'regular') {
            // Regular mode should NOT wrap headings in strong
            const hasStrongWrapped = Array.from(headings).some(h => {
                const children = Array.from(h.children);
                return children.length === 1 && children[0].tagName.toLowerCase() === 'strong';
            });
            return new TestResult(
                'Heading Strong Tags',
                mode,
                !hasStrongWrapped,
                hasStrongWrapped ? 'Headings should not be wrapped in <strong> in regular mode' : 'Headings correctly not wrapped in <strong>'
            );
        } else {
            // Blogs and Shoppables should wrap all headings in strong
            const allWrapped = Array.from(headings).every(h => {
                const children = Array.from(h.children);
                return children.length === 1 && children[0].tagName.toLowerCase() === 'strong';
            });
            return new TestResult(
                'Heading Strong Tags',
                mode,
                allWrapped,
                allWrapped ? 'All headings wrapped in <strong>' : `Found ${headings.length - Array.from(headings).filter(h => {
                    const children = Array.from(h.children);
                    return children.length === 1 && children[0].tagName.toLowerCase() === 'strong';
                }).length} headings without <strong> wrapper`
            );
        }
    }

    /**
     * Validate Key Takeaways Formatting feature
     */
    function validateKeyTakeaways(html, mode) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Find Key Takeaways heading
        const headings = doc.querySelectorAll('h2');
        let keyTakeawaysHeading = null;
        
        for (let heading of headings) {
            const text = heading.textContent.trim();
            if (text.toLowerCase().includes('key takeaways')) {
                keyTakeawaysHeading = heading;
                break;
            }
        }
        
        if (!keyTakeawaysHeading) {
            return new TestResult(
                'Key Takeaways Formatting',
                mode,
                true,
                'No Key Takeaways section found (skipped)'
            );
        }
        
        // Find the ul after the heading
        let nextSibling = keyTakeawaysHeading.nextElementSibling;
        while (nextSibling && nextSibling.tagName.toLowerCase() !== 'ul') {
            nextSibling = nextSibling.nextElementSibling;
        }
        
        if (!nextSibling || nextSibling.tagName.toLowerCase() !== 'ul') {
            return new TestResult(
                'Key Takeaways Formatting',
                mode,
                true,
                'Key Takeaways heading found but no list found (skipped)'
            );
        }
        
        const listItems = nextSibling.querySelectorAll('li');
        const hasEmTags = Array.from(listItems).some(li => li.querySelector('em'));
        
        if (mode === 'blogs') {
            // Blogs mode should NOT have <em> tags
            return new TestResult(
                'Key Takeaways Formatting',
                mode,
                !hasEmTags,
                hasEmTags ? 'Found <em> tags in Key Takeaways (should be removed)' : 'No <em> tags in Key Takeaways (correct)'
            );
        } else {
            // Regular and Shoppables can have <em> tags
            return new TestResult(
                'Key Takeaways Formatting',
                mode,
                true,
                'Key Takeaways formatting not required for this mode'
            );
        }
    }

    /**
     * Validate H1 Removal feature
     */
    function validateH1Removal(html, mode) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Find Key Takeaways heading
        const headings = doc.querySelectorAll('h2');
        let keyTakeawaysHeading = null;
        
        for (let heading of headings) {
            const text = heading.textContent.trim();
            if (text.toLowerCase().includes('key takeaways')) {
                keyTakeawaysHeading = heading;
                break;
            }
        }
        
        if (!keyTakeawaysHeading) {
            return new TestResult(
                'H1 Removal',
                mode,
                true,
                'No Key Takeaways section found (skipped)'
            );
        }
        
        // Find the ul after the heading
        let nextSibling = keyTakeawaysHeading.nextElementSibling;
        while (nextSibling && nextSibling.tagName.toLowerCase() !== 'ul') {
            nextSibling = nextSibling.nextElementSibling;
        }
        
        if (!nextSibling || nextSibling.tagName.toLowerCase() !== 'ul') {
            return new TestResult(
                'H1 Removal',
                mode,
                true,
                'Key Takeaways heading found but no list found (skipped)'
            );
        }
        
        // Find element after ul
        let elementAfterUl = nextSibling.nextElementSibling;
        while (elementAfterUl && 
               elementAfterUl.nodeType === Node.TEXT_NODE && 
               !elementAfterUl.textContent.trim()) {
            elementAfterUl = elementAfterUl.nextElementSibling;
        }
        
        const hasH1After = elementAfterUl && elementAfterUl.tagName.toLowerCase() === 'h1';
        
        if (mode === 'blogs') {
            // Blogs mode should NOT have H1 after Key Takeaways
            return new TestResult(
                'H1 Removal',
                mode,
                !hasH1After,
                hasH1After ? 'Found H1 after Key Takeaways (should be removed)' : 'No H1 after Key Takeaways (correct)'
            );
        } else {
            // Regular and Shoppables can have H1
            return new TestResult(
                'H1 Removal',
                mode,
                true,
                'H1 removal not required for this mode'
            );
        }
    }

    /**
     * Validate Link Attributes feature
     */
    function validateLinkAttributes(html, mode) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a[href]');
        
        if (links.length === 0) {
            return new TestResult(
                'Link Attributes',
                mode,
                true,
                'No links found (skipped)'
            );
        }
        
        if (mode === 'regular') {
            // Regular mode should NOT have target and rel attributes
            const hasAttributes = Array.from(links).some(link => 
                link.hasAttribute('target') || link.hasAttribute('rel')
            );
            return new TestResult(
                'Link Attributes',
                mode,
                !hasAttributes,
                hasAttributes ? 'Links should not have target/rel attributes in regular mode' : 'Links correctly without target/rel attributes'
            );
        } else {
            // Blogs and Shoppables should have target="_blank" rel="noopener noreferrer"
            const allHaveAttributes = Array.from(links).every(link => {
                const hasTarget = link.getAttribute('target') === '_blank';
                const rel = link.getAttribute('rel') || '';
                const hasRel = rel.includes('noopener') && rel.includes('noreferrer');
                return hasTarget && hasRel;
            });
            
            const missingCount = Array.from(links).filter(link => {
                const hasTarget = link.getAttribute('target') === '_blank';
                const rel = link.getAttribute('rel') || '';
                const hasRel = rel.includes('noopener') && rel.includes('noreferrer');
                return !hasTarget || !hasRel;
            }).length;
            
            return new TestResult(
                'Link Attributes',
                mode,
                allHaveAttributes,
                allHaveAttributes 
                    ? `All ${links.length} links have target="_blank" rel="noopener noreferrer"` 
                    : `${missingCount} of ${links.length} links missing required attributes`
            );
        }
    }

    /**
     * Validate Spacing Rules feature
     */
    function validateSpacing(html, mode) {
        if (mode !== 'blogs') {
            return new TestResult(
                'Spacing Rules',
                mode,
                true,
                'Spacing rules not required for this mode'
            );
        }
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Helper to check if element is spacing element
        function isSpacingElement(element) {
            if (!element || element.tagName.toLowerCase() !== 'p') return false;
            const html = element.innerHTML.trim();
            return html === '&nbsp;' || html === '\u00A0';
        }
        
        const issues = [];
        
        // 1. Check spacing after Key Takeaways
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
                const elementAfterUl = nextSibling.nextElementSibling;
                if (!isSpacingElement(elementAfterUl)) {
                    issues.push('Missing spacing after Key Takeaways section');
                }
            }
        }
        
        // 2. Check spacing before headings (except Key Takeaways and first FAQ)
        const allHeadings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let foundFaqSection = false;
        let isFirstFaqQuestion = false;
        
        allHeadings.forEach((heading, index) => {
            const text = heading.textContent.trim().toLowerCase();
            
            if (text.includes('key takeaways')) {
                return; // Skip Key Takeaways heading
            }
            
            if (text.includes('frequently asked questions') || text.includes('faq')) {
                foundFaqSection = true;
                isFirstFaqQuestion = true;
            }
            
            if (foundFaqSection && isFirstFaqQuestion && heading.tagName.toLowerCase() === 'h3') {
                isFirstFaqQuestion = false;
                return; // Skip first FAQ question
            }
            
            const prevSibling = heading.previousElementSibling;
            if (!isSpacingElement(prevSibling)) {
                issues.push(`Missing spacing before heading: "${heading.textContent.trim().substring(0, 30)}..."`);
            }
        });
        
        // 3. Check spacing before "Read also:" / "Read more:" / "See more:"
        const paragraphs = doc.querySelectorAll('p');
        paragraphs.forEach(p => {
            const text = p.textContent.trim().toLowerCase();
            if (text.includes('read also:') || text.includes('read more:') || text.includes('see more:')) {
                const prevSibling = p.previousElementSibling;
                if (!isSpacingElement(prevSibling)) {
                    issues.push(`Missing spacing before "${text.substring(0, 20)}..."`);
                }
            }
        });
        
        // 4. Check spacing before "Sources:"
        paragraphs.forEach(p => {
            const text = p.textContent.trim().toLowerCase();
            if (text.startsWith('sources:')) {
                const prevSibling = p.previousElementSibling;
                if (!isSpacingElement(prevSibling)) {
                    issues.push('Missing spacing before "Sources:" section');
                }
            }
        });
        
        // 5. Check spacing before "Disclaimer:"
        paragraphs.forEach(p => {
            const text = p.textContent.trim().toLowerCase();
            if (text.startsWith('disclaimer:')) {
                const prevSibling = p.previousElementSibling;
                if (!isSpacingElement(prevSibling)) {
                    issues.push('Missing spacing before "Disclaimer:" section');
                }
            }
        });
        
        // 6. Check spacing before "Alt Image Text:"
        paragraphs.forEach(p => {
            const text = p.textContent.trim().toLowerCase();
            if (text.includes('alt image text:')) {
                const prevSibling = p.previousElementSibling;
                if (!isSpacingElement(prevSibling)) {
                    issues.push('Missing spacing before "Alt Image Text:" paragraph');
                }
            }
        });
        
        return new TestResult(
            'Spacing Rules',
            mode,
            issues.length === 0,
            issues.length === 0 ? 'All spacing rules satisfied' : `${issues.length} spacing issues found`,
            issues.length > 0 ? issues : null
        );
    }

    /**
     * Validate OL Header Conversion feature
     */
    function validateOlHeaderConversion(html, mode) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const olElements = doc.querySelectorAll('ol');
        
        if (olElements.length === 0) {
            return new TestResult(
                'OL Header Conversion',
                mode,
                true,
                'No <ol> elements found (skipped)'
            );
        }
        
        // Check if any OL contains headers (should be converted)
        const headerLists = Array.from(olElements).filter(ol => {
            const listItems = ol.querySelectorAll(':scope > li');
            if (listItems.length === 0) return false;
            
            return Array.from(listItems).every(li => {
                const children = Array.from(li.childNodes);
                const elementChildren = children.filter(node => node.nodeType === 1);
                if (elementChildren.length !== 1) return false;
                
                const strongTag = elementChildren[0];
                if (strongTag.tagName.toLowerCase() !== 'strong') return false;
                
                const headingChildren = Array.from(strongTag.children).filter(
                    node => /^h[1-6]$/i.test(node.tagName)
                );
                return headingChildren.length === 1;
            });
        });
        
        if (headerLists.length === 0) {
            return new TestResult(
                'OL Header Conversion',
                mode,
                true,
                'No header lists found (skipped)'
            );
        }
        
        // Check if header lists were converted (should not exist as OL anymore)
        // But we need to check if they're followed by another header list
        // For simplicity, we'll check if any header lists remain that aren't followed by another
        const unconvertedLists = headerLists.filter(ol => {
            // Check if followed by another header list
            let nextSibling = ol.nextElementSibling;
            while (nextSibling) {
                if (nextSibling.tagName.toLowerCase() === 'p') {
                    const text = nextSibling.textContent.trim();
                    if (text === '' || text === '\u00A0' || text === '&nbsp;') {
                        nextSibling = nextSibling.nextElementSibling;
                        continue;
                    }
                }
                if (nextSibling.tagName.toLowerCase() === 'ol') {
                    // Check if it's a header list
                    const listItems = nextSibling.querySelectorAll(':scope > li');
                    const isHeaderList = Array.from(listItems).every(li => {
                        const children = Array.from(li.childNodes);
                        const elementChildren = children.filter(node => node.nodeType === 1);
                        if (elementChildren.length !== 1) return false;
                        const strongTag = elementChildren[0];
                        if (strongTag.tagName.toLowerCase() !== 'strong') return false;
                        const headingChildren = Array.from(strongTag.children).filter(
                            node => /^h[1-6]$/i.test(node.tagName)
                        );
                        return headingChildren.length === 1;
                    });
                    if (isHeaderList) {
                        return false; // Followed by header list, so shouldn't be converted
                    }
                }
                break;
            }
            return true; // Not followed by header list, should be converted
        });
        
        return new TestResult(
            'OL Header Conversion',
            mode,
            unconvertedLists.length === 0,
            unconvertedLists.length === 0 
                ? 'All header lists correctly converted' 
                : `${unconvertedLists.length} header list(s) should be converted but remain as <ol>`
        );
    }

    /**
     * Validate List Normalization feature
     */
    function validateListNormalize(html, mode) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const listItems = doc.querySelectorAll('li');
        
        if (listItems.length === 0) {
            return new TestResult(
                'List Normalization',
                mode,
                true,
                'No list items found (skipped)'
            );
        }
        
        const issues = [];
        
        listItems.forEach(li => {
            // Find <strong> tags within this list item
            const strongTags = li.querySelectorAll('strong');
            
            strongTags.forEach(strong => {
                // Get the text content of the strong tag
                const strongText = strong.textContent || '';
                
                // Check if the text ends with a colon (with or without trailing space)
                if (strongText.trim().endsWith(':')) {
                    // Check 1: No trailing space before </strong>
                    // Get the last text node within strong to check for trailing space
                    const strongHTML = strong.innerHTML;
                    // Check if innerHTML ends with colon followed by whitespace
                    const trimmedHTML = strongHTML.trim();
                    if (trimmedHTML.endsWith(': ') || trimmedHTML.match(/:\s+$/)) {
                        issues.push(`List item has trailing space before </strong> in "${strongText.trim().substring(0, 30)}..."`);
                    }
                    
                    // Check 2: Exactly one space after </strong>
                    let nextNode = strong.nextSibling;
                    
                    if (nextNode && nextNode.nodeType === Node.TEXT_NODE) {
                        const text = nextNode.textContent || '';
                        // Should start with exactly one space (not zero, not multiple)
                        if (text.length === 0 || !text.startsWith(' ')) {
                            issues.push(`List item missing space after </strong> in "${strongText.trim().substring(0, 30)}..."`);
                        } else if (text.startsWith('  ')) {
                            // More than one space
                            issues.push(`List item has multiple spaces after </strong> in "${strongText.trim().substring(0, 30)}..."`);
                        }
                    } else {
                        // No text node after strong - should have one with a space
                        issues.push(`List item missing text node with space after </strong> in "${strongText.trim().substring(0, 30)}..."`);
                    }
                }
            });
        });
        
        return new TestResult(
            'List Normalization',
            mode,
            issues.length === 0,
            issues.length === 0 ? 'All list items with colons are properly normalized' : `${issues.length} list normalization issue(s) found`,
            issues.length > 0 ? issues : null
        );
    }

    /**
     * Validate Relative Paths feature
     */
    function validateRelativePaths(html, mode, features) {
        if (!features.relativePaths) {
            return new TestResult(
                'Relative Paths',
                mode,
                true,
                'Relative paths feature disabled (skipped)'
            );
        }
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a[href]');
        
        if (links.length === 0) {
            return new TestResult(
                'Relative Paths',
                mode,
                true,
                'No links found (skipped)'
            );
        }
        
        const absoluteUrls = Array.from(links).filter(link => {
            const href = link.getAttribute('href');
            return href && href.includes('://');
        });
        
        return new TestResult(
            'Relative Paths',
            mode,
            absoluteUrls.length === 0,
            absoluteUrls.length === 0 
                ? 'All URLs converted to relative paths' 
                : `${absoluteUrls.length} absolute URL(s) found (should be converted)`
        );
    }

    /**
     * Validate Basic HTML Structure (for Regular mode)
     */
    function validateBasicStructure(html, mode) {
        if (mode !== 'regular') {
            return new TestResult(
                'Basic HTML Structure',
                mode,
                true,
                'Basic structure validation not required for this mode'
            );
        }
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Check if HTML is valid and contains content
        const hasContent = doc.body && doc.body.innerHTML.trim().length > 0;
        const hasValidElements = doc.body && doc.body.children.length > 0;
        
        return new TestResult(
            'Basic HTML Structure',
            mode,
            hasContent && hasValidElements,
            hasContent && hasValidElements 
                ? 'HTML structure is valid' 
                : 'HTML structure is invalid or empty'
        );
    }

    /**
     * Run validation for a specific mode
     */
    function validateMode(html, mode, features) {
        const results = new ValidationResults();
        
        logValidation('validator.js:validateMode', `Starting validation for ${mode} mode`, { mode, features }, 'validation-start');
        
        // Regular mode validations
        if (mode === 'regular') {
            results.addResult(validateBasicStructure(html, mode));
            results.addResult(validateHeadingStrong(html, mode));
            results.addResult(validateLinkAttributes(html, mode));
            results.addResult(validateListNormalize(html, mode));
        }
        
        // Blogs mode validations
        if (mode === 'blogs') {
            results.addResult(validateHeadingStrong(html, mode));
            results.addResult(validateKeyTakeaways(html, mode));
            results.addResult(validateH1Removal(html, mode));
            results.addResult(validateLinkAttributes(html, mode));
            results.addResult(validateSpacing(html, mode));
            results.addResult(validateOlHeaderConversion(html, mode));
            results.addResult(validateRelativePaths(html, mode, features));
            results.addResult(validateListNormalize(html, mode));
        }
        
        // Shoppables mode validations
        if (mode === 'shoppables') {
            results.addResult(validateHeadingStrong(html, mode));
            results.addResult(validateLinkAttributes(html, mode));
            results.addResult(validateOlHeaderConversion(html, mode));
            results.addResult(validateRelativePaths(html, mode, features));
            results.addResult(validateListNormalize(html, mode));
            // Explicitly check that Key Takeaways formatting is NOT applied
            const keyTakeawaysResult = validateKeyTakeaways(html, mode);
            results.addResult(new TestResult(
                'Key Takeaways Formatting (should NOT be applied)',
                mode,
                keyTakeawaysResult.passed || keyTakeawaysResult.message.includes('not required'),
                'Key Takeaways formatting correctly not applied in Shoppables mode'
            ));
            // Explicitly check that H1 removal is NOT applied
            const h1RemovalResult = validateH1Removal(html, mode);
            results.addResult(new TestResult(
                'H1 Removal (should NOT be applied)',
                mode,
                h1RemovalResult.passed || h1RemovalResult.message.includes('not required'),
                'H1 removal correctly not applied in Shoppables mode'
            ));
            // Explicitly check that spacing is NOT applied
            const spacingResult = validateSpacing(html, mode);
            results.addResult(new TestResult(
                'Spacing Rules (should NOT be applied)',
                mode,
                spacingResult.passed || spacingResult.message.includes('not required'),
                'Spacing rules correctly not applied in Shoppables mode'
            ));
        }
        
        logValidation('validator.js:validateMode', `Completed validation for ${mode} mode`, {
            mode,
            total: results.summary.total,
            passed: results.summary.passed,
            failed: results.summary.failed
        }, 'validation-complete');
        
        return results;
    }

    /**
     * Validate all modes with test HTML
     */
    function validateAllModes(testHtml, features) {
        const allResults = {
            regular: null,
            blogs: null,
            shoppables: null
        };
        
        // Process HTML through ModeProcessor for each mode
        if (window.ModeProcessor) {
            // Regular mode
            const regularHtml = window.ModeProcessor.process(testHtml, 'regular', features);
            allResults.regular = validateMode(regularHtml, 'regular', features);
            
            // Blogs mode
            const blogsFeatures = {
                headingStrong: features.headingStrong !== false,
                keyTakeaways: features.keyTakeaways !== false,
                h1Removal: features.h1Removal !== false,
                linkAttributes: features.linkAttributes !== false,
                spacing: features.spacing !== false,
                olHeaderConversion: features.olHeaderConversion !== false,
                relativePaths: features.relativePaths === true
            };
            const blogsHtml = window.ModeProcessor.process(testHtml, 'blogs', blogsFeatures);
            allResults.blogs = validateMode(blogsHtml, 'blogs', blogsFeatures);
            
            // Shoppables mode
            const shoppablesFeatures = {
                headingStrong: features.headingStrong !== false,
                linkAttributes: features.linkAttributes !== false,
                olHeaderConversion: features.olHeaderConversion !== false,
                relativePaths: features.relativePaths === true
            };
            const shoppablesHtml = window.ModeProcessor.process(testHtml, 'shoppables', shoppablesFeatures);
            allResults.shoppables = validateMode(shoppablesHtml, 'shoppables', shoppablesFeatures);
        } else {
            console.error('ModeProcessor not available');
        }
        
        return allResults;
    }

    /**
     * Generate comprehensive report
     */
    function generateReport(results) {
        let report = '\n' + '='.repeat(50) + '\n';
        report += 'COMPREHENSIVE VALIDATION REPORT\n';
        report += '='.repeat(50) + '\n\n';
        
        ['regular', 'blogs', 'shoppables'].forEach(mode => {
            if (results[mode]) {
                report += results[mode].getReport();
                report += '\n';
            }
        });
        
        // Overall summary
        report += '='.repeat(50) + '\n';
        report += 'OVERALL SUMMARY\n';
        report += '='.repeat(50) + '\n';
        
        let totalTests = 0;
        let totalPassed = 0;
        let totalFailed = 0;
        
        ['regular', 'blogs', 'shoppables'].forEach(mode => {
            if (results[mode]) {
                totalTests += results[mode].summary.total;
                totalPassed += results[mode].summary.passed;
                totalFailed += results[mode].summary.failed;
            }
        });
        
        report += `Total Tests: ${totalTests}\n`;
        report += `Passed: ${totalPassed}\n`;
        report += `Failed: ${totalFailed}\n`;
        report += `Success Rate: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%\n`;
        
        return report;
    }

    /**
     * Display validation results in the UI
     */
    function displayResultsInUI(results, mode) {
        const validationPanel = document.getElementById('validationPanel');
        const validationSummary = document.getElementById('validationSummary');
        const validationDetails = document.getElementById('validationDetails');
        
        if (!validationPanel || !validationSummary || !validationDetails) {
            return; // UI elements not found
        }
        
        // Show the panel
        validationPanel.style.display = 'block';
        
        // Update summary
        const total = results.summary.total;
        const passed = results.summary.passed;
        const failed = results.summary.failed;
        const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
        
        let summaryClass = 'passed';
        if (failed > 0 && passed > 0) {
            summaryClass = 'partial';
        } else if (failed > 0) {
            summaryClass = 'failed';
        }
        
        validationSummary.className = `validation-summary ${summaryClass}`;
        validationSummary.innerHTML = `
            <div class="validation-summary-title">${mode.toUpperCase()} Mode Validation</div>
            <div class="validation-summary-stats">
                <span>Total: ${total}</span>
                <span style="color: hsl(142 70% 55%);">Passed: ${passed}</span>
                ${failed > 0 ? `<span style="color: hsl(0 70% 65%);">Failed: ${failed}</span>` : ''}
                <span>Success Rate: ${successRate}%</span>
            </div>
        `;
        
        // Update details
        validationDetails.innerHTML = '';
        results.results.forEach(result => {
            const item = document.createElement('div');
            item.className = `validation-item ${result.passed ? 'passed' : 'failed'}`;
            
            const name = document.createElement('div');
            name.className = 'validation-item-name';
            name.textContent = result.feature;
            
            const message = document.createElement('div');
            message.className = 'validation-item-message';
            message.textContent = result.message;
            
            item.appendChild(name);
            item.appendChild(message);
            
            if (result.details && !result.passed) {
                const details = document.createElement('div');
                details.className = 'validation-item-details';
                if (Array.isArray(result.details)) {
                    details.textContent = result.details.join(', ');
                } else {
                    details.textContent = JSON.stringify(result.details);
                }
                item.appendChild(details);
            }
            
            validationDetails.appendChild(item);
        });
        
        logValidation('validator.js:displayResultsInUI', 'Displayed validation results in UI', {
            mode,
            total,
            passed,
            failed
        }, 'ui-display');
    }

    /**
     * Quick test function - validates current output HTML
     */
    function quickTest() {
        const outputArea = document.getElementById('outputArea');
        const htmlSource = document.getElementById('htmlSource');
        const htmlSourceCode = htmlSource ? htmlSource.querySelector('code') : null;
        
        if (!htmlSourceCode || !htmlSourceCode.textContent.trim()) {
            console.warn('No output HTML found. Please paste some content first.');
            return null;
        }
        
        const currentHtml = htmlSourceCode.textContent.trim();
        const modeRadios = document.querySelectorAll('input[name="outputMode"]:checked');
        const currentMode = modeRadios.length > 0 ? modeRadios[0].value : 'regular';
        
        // Get current features
        const features = {
            headingStrong: true,
            keyTakeaways: true,
            h1Removal: true,
            linkAttributes: true,
            spacing: true,
            olHeaderConversion: true,
            relativePaths: false
        };
        
        // Sync features from checkboxes
        if (currentMode === 'blogs') {
            const blogsCheckboxes = document.querySelectorAll('input[name="blogsFeature"]');
            blogsCheckboxes.forEach(checkbox => {
                features[checkbox.value] = checkbox.checked;
            });
        } else if (currentMode === 'shoppables') {
            const shoppablesCheckboxes = document.querySelectorAll('input[name="shoppablesFeature"]');
            shoppablesCheckboxes.forEach(checkbox => {
                features[checkbox.value] = checkbox.checked;
            });
        }
        
        const results = validateMode(currentHtml, currentMode, features);
        
        // Display in UI
        displayResultsInUI(results, currentMode);
        
        return results;
    }

    /**
     * Test with sample HTML
     */
    function testWithSample() {
        const sampleHtml = `
            <h2><em>Key Takeaways:</em></h2>
            <ul>
                <li><em><strong>Test:</strong> This is a test.</em></li>
            </ul>
            <h1>Main Title</h1>
            <p>Some content here.</p>
            <h2>Subheading</h2>
            <p><a href="https://example.com">Link</a></p>
            <ol>
                <li><strong><h3>Header in List</h3></strong></li>
            </ol>
        `;
        
        const features = {
            headingStrong: true,
            keyTakeaways: true,
            h1Removal: true,
            linkAttributes: true,
            spacing: true,
            olHeaderConversion: true,
            relativePaths: false
        };
        
        const allResults = validateAllModes(sampleHtml, features);
        
        return allResults;
    }

    /**
     * Check if dependencies are available
     */
    function checkDependencies() {
        const missing = [];
        if (!window.ModeProcessor) {
            missing.push('ModeProcessor');
        }
        if (typeof DOMParser === 'undefined') {
            missing.push('DOMParser');
        }
        return missing;
    }

    // Export for use in other modules
    if (typeof window !== 'undefined') {
        // Wait for DOM to be ready
        function initValidator() {
            const missing = checkDependencies();
            if (missing.length > 0) {
                console.warn('HTML Validator: Missing dependencies:', missing.join(', '));
                console.warn('Make sure all scripts are loaded before using the validator.');
            }
            
            window.HTMLValidator = {
                validateMode: validateMode,
                validateAllModes: validateAllModes,
                generateReport: generateReport,
                quickTest: quickTest,
                testWithSample: testWithSample,
                displayResultsInUI: displayResultsInUI,
                checkDependencies: checkDependencies,
                TestResult: TestResult,
                ValidationResults: ValidationResults
            };
            
            // Setup validation panel toggle
            const toggleValidation = document.getElementById('toggleValidation');
            const validationContent = document.getElementById('validationContent');
            if (toggleValidation && validationContent) {
                toggleValidation.addEventListener('click', () => {
                    const isCollapsed = validationContent.classList.contains('collapsed');
                    if (isCollapsed) {
                        validationContent.classList.remove('collapsed');
                        toggleValidation.classList.remove('collapsed');
                    } else {
                        validationContent.classList.add('collapsed');
                        toggleValidation.classList.add('collapsed');
                    }
                });
            }
            
            // Log that validator is loaded
            
            logValidation('validator.js:init', 'HTML Validator initialized', { missing }, 'validator-init');
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initValidator);
        } else {
            // DOM already loaded, but wait a bit for other scripts
            setTimeout(initValidator, 100);
        }
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            validateMode: validateMode,
            validateAllModes: validateAllModes,
            generateReport: generateReport,
            TestResult: TestResult,
            ValidationResults: ValidationResults
        };
    }
})();

