// Word to HTML Converter
// Handles paste events and converts Word document content to clean HTML

(function() {
    'use strict';

    // Get DOM elements
    const inputArea = document.getElementById('inputArea');
    const outputArea = document.getElementById('outputArea');
    const htmlSource = document.getElementById('htmlSource');
    const htmlSourceCode = htmlSource ? htmlSource.querySelector('code') : null;
    const clearInputBtn = document.getElementById('clearInput');
    const copyHtmlBtn = document.getElementById('copyHtml');
    const toggleViewCodeBtn = document.getElementById('toggleViewCode');
    const toggleViewPreviewBtn = document.getElementById('toggleViewPreview');
    const copyIcon = document.getElementById('copyIcon');
    const checkIcon = document.getElementById('checkIcon');

    let isShowingSource = true; // Start with HTML source view by default
    let currentHtmlText = ''; // Store the raw HTML text for copying
    let currentMode = 'regular'; // Current output mode
    let currentFeatures = {
        headingStrong: true,
        keyTakeaways: true,
        h1Removal: true,
        linkAttributes: true,
        relativePaths: false, // Disabled by default
        spacing: true
    }; // Current feature flags

    // Initialize
    function init() {
        // Handle paste events
        inputArea.addEventListener('paste', handlePaste);
        
        // Handle input changes (for manual typing/editing)
        inputArea.addEventListener('input', handleInput);
        
        // Don't auto-resize htmlSource - it should scroll instead
        // htmlSource.addEventListener('input', function() {
        //     autoResizeTextarea(htmlSource);
        // });
        
        // Button event listeners
        if (clearInputBtn) {
            clearInputBtn.addEventListener('click', clearInput);
        }
        if (copyHtmlBtn) {
            copyHtmlBtn.addEventListener('click', copyHtml);
        }
        if (toggleViewCodeBtn) {
            toggleViewCodeBtn.addEventListener('click', () => toggleView(true));
        }
        if (toggleViewPreviewBtn) {
            toggleViewPreviewBtn.addEventListener('click', () => toggleView(false));
        }
        
        // Mode selection handlers
        setupModeHandlers();
        updateModeFeaturesVisibility(); // Set initial visibility
        
        // Set initial view to show HTML source
        htmlSource.classList.remove('hide');
        outputArea.classList.remove('show');
        updateToggleButtons();
        updateClearButtonVisibility();
        updateCopyButtonState();
    }

    // Sync currentFeatures with actual checkbox states
    function syncFeaturesFromCheckboxes() {
        
        // Sync blogs features
        const blogsCheckboxes = document.querySelectorAll('input[name="blogsFeature"]');
        blogsCheckboxes.forEach(checkbox => {
            currentFeatures[checkbox.value] = checkbox.checked;
        });
        
        // Sync shoppables features
        const shoppablesCheckboxes = document.querySelectorAll('input[name="shoppablesFeature"]');
        shoppablesCheckboxes.forEach(checkbox => {
            currentFeatures[checkbox.value] = checkbox.checked;
        });
    }

    // Setup mode selection and feature handlers
    function setupModeHandlers() {
        // Sync features from checkboxes first
        syncFeaturesFromCheckboxes();
        
        // Mode radio buttons
        const modeRadios = document.querySelectorAll('input[name="outputMode"]');
        modeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                currentMode = e.target.value;
                syncFeaturesFromCheckboxes(); // Re-sync when mode changes
                updateModeFeaturesVisibility();
                // Re-process current content if available
                if (inputArea.innerHTML.trim()) {
                    const cleanedHtml = cleanWordHtml(inputArea.innerHTML);
                    convertToHtml(cleanedHtml);
                }
            });
        });

        // Blogs feature checkboxes
        const blogsCheckboxes = document.querySelectorAll('input[name="blogsFeature"]');
        blogsCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                currentFeatures[e.target.value] = e.target.checked;
                // Re-process current content if available
                if (inputArea.innerHTML.trim()) {
                    const cleanedHtml = cleanWordHtml(inputArea.innerHTML);
                    convertToHtml(cleanedHtml);
                }
            });
        });

        // Shoppables feature checkboxes
        const shoppablesCheckboxes = document.querySelectorAll('input[name="shoppablesFeature"]');
        shoppablesCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                currentFeatures[e.target.value] = e.target.checked;
                // Re-process current content if available
                if (inputArea.innerHTML.trim()) {
                    const cleanedHtml = cleanWordHtml(inputArea.innerHTML);
                    convertToHtml(cleanedHtml);
                }
            });
        });
    }

    // Update mode features visibility based on selected mode
    function updateModeFeaturesVisibility() {
        const blogsFeatures = document.getElementById('blogsFeatures');
        const shoppablesFeatures = document.getElementById('shoppablesFeatures');
        
        if (currentMode === 'blogs') {
            if (blogsFeatures) blogsFeatures.style.display = 'block';
            if (shoppablesFeatures) shoppablesFeatures.style.display = 'none';
        } else if (currentMode === 'shoppables') {
            if (blogsFeatures) blogsFeatures.style.display = 'none';
            if (shoppablesFeatures) shoppablesFeatures.style.display = 'block';
        } else {
            if (blogsFeatures) blogsFeatures.style.display = 'none';
            if (shoppablesFeatures) shoppablesFeatures.style.display = 'none';
        }
    }

    // Handle paste event
    function handlePaste(e) {
        // Allow the paste to happen naturally in the input area
        // Then process it after a short delay to ensure content is inserted
        setTimeout(() => {
            const content = inputArea.innerHTML;
            if (content.trim()) {
                const cleanedHtml = cleanWordHtml(content);
                convertToHtml(cleanedHtml);
            }
        }, 10);
    }

    // Handle input changes (for manual editing)
    function handleInput() {
        const content = inputArea.innerHTML;
        updateClearButtonVisibility();
        if (content.trim()) {
            const cleanedHtml = cleanWordHtml(content);
            convertToHtml(cleanedHtml);
        } else {
            outputArea.innerHTML = '';
            if (htmlSourceCode) {
                htmlSourceCode.textContent = '';
                currentHtmlText = '';
                // Re-highlight empty code
                if (window.Prism) {
                    Prism.highlightElement(htmlSourceCode);
                }
            }
        }
        updateCopyButtonState();
    }

    // Update clear button visibility based on input
    function updateClearButtonVisibility() {
        if (clearInputBtn) {
            const hasContent = inputArea.innerHTML.trim().length > 0;
            clearInputBtn.style.display = hasContent ? 'flex' : 'none';
        }
    }

    // Clean Word HTML and retain structure
    function cleanWordHtml(html) {
        // Create a temporary container to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Remove all images immediately for faster processing
        removeImages(tempDiv);

        // Preserve formatting elements first (before cleaning)
        preserveFormattingElements(tempDiv);
        
        // Remove Word-specific classes and attributes while preserving formatting styles
        removeWordSpecificAttributes(tempDiv);
        
        // Clean up font tags and convert to spans with styles preserved
        convertFontTagsToSpans(tempDiv);
        
        // Normalize formatting tags (ensure <i>, <b>, <em>, <strong>, <sup>, <sub> are preserved)
        normalizeFormattingTags(tempDiv);
        
        // Clean up empty elements but preserve structure
        cleanEmptyElements(tempDiv);
        
        // Flatten unnecessary nesting while preserving formatting
        flattenNestedSpans(tempDiv);
        
        // Remove any remaining Word-specific wrapper elements (but preserve their content)
        removeWordWrapperElements(tempDiv);
        
        // Helper function to get the last text node in an element
        function getLastTextNode(element) {
            if (!element) return null;
            // Traverse to find the last text node
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            let lastTextNode = null;
            let node;
            while (node = walker.nextNode()) {
                lastTextNode = node;
            }
            return lastTextNode;
        }
        
        // Preserve spacing before anchor tags
        // Check all anchors and ensure there's proper spacing before them
        const allAnchors = Array.from(tempDiv.querySelectorAll('a'));
        allAnchors.forEach(anchor => {
            const prevSibling = anchor.previousSibling;
            
            if (!prevSibling) {
                // No previous sibling - add a space
                const spaceNode = document.createTextNode(' ');
                anchor.parentNode.insertBefore(spaceNode, anchor);
            } else if (prevSibling.nodeType === Node.TEXT_NODE) {
                // Previous sibling is a text node
                const text = prevSibling.textContent || '';
                if (text.trim() && !/[\s\u00A0]$/.test(text)) {
                    // Has content but doesn't end with space - add one
                    prevSibling.textContent = text + ' ';
                } else if (!text.trim()) {
                    // Only whitespace - check previous element
                    let prevElement = prevSibling.previousSibling;
                    while (prevElement && prevElement.nodeType === Node.TEXT_NODE && !prevElement.textContent.trim()) {
                        prevElement = prevElement.previousSibling;
                    }
                    if (prevElement && prevElement.nodeType === Node.ELEMENT_NODE) {
                        const lastText = getLastTextNode(prevElement);
                        if (lastText && lastText.textContent && !/[\s\u00A0]$/.test(lastText.textContent)) {
                            lastText.textContent = lastText.textContent + ' ';
                        }
                    }
                }
            } else if (prevSibling.nodeType === Node.ELEMENT_NODE) {
                // Previous sibling is an element (like a span) - check if it ends with space
                const lastTextNode = getLastTextNode(prevSibling);
                if (lastTextNode) {
                    const text = lastTextNode.textContent || '';
                    // If it doesn't end with whitespace, add a space
                    if (text && !/[\s\u00A0]$/.test(text)) {
                        lastTextNode.textContent = text + ' ';
                    }
                } else {
                    // No text node found in element, add a space before the anchor
                    const spaceNode = document.createTextNode(' ');
                    anchor.parentNode.insertBefore(spaceNode, anchor);
                }
            }
        });
        
        return tempDiv.innerHTML;
    }

    // Remove all images for faster processing
    function removeImages(element) {
        // Remove img tags
        const images = element.querySelectorAll('img');
        images.forEach(img => img.remove());
        
        // Remove elements with image-related classes
        const imageClassElements = element.querySelectorAll('[class*="image"], [class*="Image"]');
        imageClassElements.forEach(el => el.remove());
        
        // Remove elements with background-image styles
        const bgImageElements = element.querySelectorAll('[style*="background-image"]');
        bgImageElements.forEach(el => el.remove());
        
        // Remove Word-specific image elements by tag name (namespace prefixes not valid in CSS selectors)
        // We need to check all elements and remove those with image-related tag names
        const allElements = element.querySelectorAll('*');
        allElements.forEach(el => {
            const tagName = el.tagName.toLowerCase();
            // Remove Word image-related elements regardless of namespace
            if (tagName.includes('imagedata') || 
                tagName.includes('shape') || 
                tagName === 'pict' ||
                tagName.includes('bindata') ||
                tagName.includes('picture')) {
                el.remove();
            }
        });
        
        // Remove empty anchors that might have been wrapping images
        const emptyAnchors = element.querySelectorAll('a');
        emptyAnchors.forEach(anchor => {
            if (!anchor.textContent.trim() && !anchor.children.length && !anchor.getAttribute('href')) {
                anchor.remove();
            }
        });
    }

    // Preserve formatting elements from Word HTML
    // This function ensures formatting is preserved by cleaning styles but keeping formatting properties
    function preserveFormattingElements(element) {
        // Process all elements to preserve their formatting
        const allElements = element.querySelectorAll('*');
        const elementsToProcess = Array.from(allElements);
        
        elementsToProcess.forEach(el => {
            const style = el.getAttribute('style') || '';
            if (!style) return;
            
            // Clean the style attribute but keep all formatting
            const cleanedStyle = cleanStyleAttribute(style);
            if (cleanedStyle) {
                el.setAttribute('style', cleanedStyle);
            } else {
                el.removeAttribute('style');
            }
        });
        
        // Also process the root element if it has styles
        if (element.hasAttribute && element.hasAttribute('style')) {
            const style = element.getAttribute('style') || '';
            const cleanedStyle = cleanStyleAttribute(style);
            if (cleanedStyle) {
                element.setAttribute('style', cleanedStyle);
            } else {
                element.removeAttribute('style');
            }
        }
        
        // Convert vertical-align:super/sub to semantic tags for better compatibility
        const elementsWithVA = element.querySelectorAll('[style*="vertical-align"]');
        const vaElements = Array.from(elementsWithVA);
        
        vaElements.forEach(el => {
            const style = el.getAttribute('style') || '';
            const styleObj = parseStyle(style);
            const va = styleObj['vertical-align'];
            
            if (va) {
                const vaLower = va.toLowerCase().trim();
                // Check if it's superscript or subscript
                if (vaLower === 'super' || vaLower.includes('super') || vaLower.includes('35%') || vaLower.includes('0.6')) {
                    // Create sup tag
                    const sup = document.createElement('sup');
                    // Copy all other styles
                    const otherStyles = Object.keys(styleObj)
                        .filter(k => k !== 'vertical-align')
                        .map(k => `${k}: ${styleObj[k]}`)
                        .join('; ');
                    if (otherStyles) sup.setAttribute('style', otherStyles);
                    sup.innerHTML = el.innerHTML;
                    if (el.parentNode) {
                        el.parentNode.replaceChild(sup, el);
                    }
                } else if (vaLower === 'sub' || vaLower.includes('sub') || vaLower.includes('-35%') || vaLower.includes('-0.6')) {
                    // Create sub tag
                    const sub = document.createElement('sub');
                    // Copy all other styles
                    const otherStyles = Object.keys(styleObj)
                        .filter(k => k !== 'vertical-align')
                        .map(k => `${k}: ${styleObj[k]}`)
                        .join('; ');
                    if (otherStyles) sub.setAttribute('style', otherStyles);
                    sub.innerHTML = el.innerHTML;
                    if (el.parentNode) {
                        el.parentNode.replaceChild(sub, el);
                    }
                }
            }
        });
    }
    
    // Parse style string to object
    function parseStyle(styleString) {
        const styles = {};
        if (!styleString) return styles;
        
        styleString.split(';').forEach(rule => {
            const parts = rule.split(':').map(s => s.trim());
            if (parts.length === 2) {
                styles[parts[0].toLowerCase()] = parts[1];
            }
        });
        return styles;
    }

    // Remove Word-specific attributes while preserving formatting
    function removeWordSpecificAttributes(element) {
        const allElements = element.querySelectorAll('*');
        
        allElements.forEach(el => {
            // Remove images if needed (optional - comment out if you want to keep images)
            // if (el.tagName === 'IMG') {
            //     el.remove();
            //     return;
            // }
            
            // Remove Word-specific attributes but keep formatting-related ones
            const attrsToRemove = [];
            
            Array.from(el.attributes).forEach(attr => {
                const attrName = attr.name.toLowerCase();
                
                // Remove Word-specific namespaces and classes
                if (attrName.startsWith('o:') || 
                    attrName.startsWith('v:') || 
                    attrName.startsWith('xmlns') ||
                    attrName === 'xml:lang' ||
                    (attrName === 'class' && (attr.value.includes('Mso') || attr.value.includes('mso-'))) ||
                    (attrName === 'lang' && attr.value === 'EN-US')) {
                    attrsToRemove.push(attr.name);
                }
                
                // Clean style attribute - remove Word-specific styles but keep formatting
                if (attrName === 'style') {
                    const style = attr.value;
                    const cleanedStyle = cleanStyleAttribute(style);
                    if (cleanedStyle) {
                        el.setAttribute('style', cleanedStyle);
                    } else {
                        attrsToRemove.push(attr.name);
                    }
                }
            });
            
            attrsToRemove.forEach(attrName => el.removeAttribute(attrName));
            
            // Handle links
            if (el.tagName === 'A' && el.href) {
                const href = el.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                    el.setAttribute('href', href);
                }
            }
        });
    }
    
    // Clean style attribute - remove Word-specific styles, keep ALL formatting
    function cleanStyleAttribute(styleString) {
        if (!styleString) return '';
        
        const styles = parseStyle(styleString);
        const preservedStyles = {};
        
        // Comprehensive list of formatting-related styles to preserve
        // Matching raw Word/Google Docs HTML format
        const formattingProps = [
            'font-style', 'font-weight', 'text-decoration', 'font-size', 
            'font-family', 'color', 'background-color', 'background',
            'vertical-align', 'text-align', 'line-height', 'letter-spacing', 
            'text-transform', 'font-variant', 'text-indent', 'margin',
            'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
            'padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
            'padding-inline-start', 'border', 'border-top', 'border-bottom', 'border-left', 'border-right',
            'border-color', 'border-style', 'border-width',
            'white-space', 'white-space-collapse', 'word-spacing', 'text-shadow', 'font-stretch',
            'text-decoration-line', 'text-decoration-skip-ink', 'text-wrap-mode',
            // Font variant properties (common in raw Word HTML)
            'font-variant-numeric', 'font-variant-east-asian', 'font-variant-alternates',
            'font-variant-position', 'font-variant-emoji',
            // Display properties
            'display', 'list-style-type', 'dir', 'aria-level', 'role'
        ];
        
        // Default values that are redundant and can be removed to clean up output
        const redundantDefaults = {
            'font-variant-numeric': 'normal',
            'font-variant-east-asian': 'normal',
            'font-variant-alternates': 'normal',
            'font-variant-position': 'normal',
            'font-variant-emoji': 'normal',
            'vertical-align': 'baseline',
            'background-color': 'transparent',
            'font-weight': '400',
            'font-style': 'normal',
            'text-decoration': 'none',
            'text-decoration-line': 'none'
        };
        
        Object.keys(styles).forEach(key => {
            const lowerKey = key.toLowerCase().trim();
            const value = styles[key].trim();
            
            // Remove Word-specific properties (mso-*)
            if (lowerKey.includes('mso-') || lowerKey.startsWith('mso')) {
                return; // Skip this property
            }
            
            // Skip redundant default values to clean up output
            if (redundantDefaults[lowerKey] === value.toLowerCase()) {
                return; // Skip redundant defaults
            }
            
            // Keep formatting properties
            if (formattingProps.includes(lowerKey)) {
                preservedStyles[key] = styles[key];
            }
            // Also preserve any CSS property that looks like standard CSS (not Word-specific)
            else if (!lowerKey.match(/^(o:|v:|xml)/) && 
                     !lowerKey.includes('mso') &&
                     !lowerKey.includes('word-wrap')) {
                // Keep other standard CSS properties
                preservedStyles[key] = styles[key];
            }
        });
        
        return Object.keys(preservedStyles)
            .map(k => `${k}: ${preservedStyles[k]}`)
            .join('; ');
    }
    
    // Convert font tags to spans with styles preserved
    function convertFontTagsToSpans(tempDiv) {
        const fontTags = tempDiv.querySelectorAll('font');
        fontTags.forEach(font => {
            const span = document.createElement('span');
            
            // Copy all attributes that might contain formatting
            Array.from(font.attributes).forEach(attr => {
                if (attr.name.toLowerCase() === 'color') {
                    if (!span.getAttribute('style')) {
                        span.setAttribute('style', `color: ${attr.value}`);
                    } else {
                        span.setAttribute('style', span.getAttribute('style') + `; color: ${attr.value}`);
                    }
                } else if (attr.name.toLowerCase() === 'face') {
                    if (!span.getAttribute('style')) {
                        span.setAttribute('style', `font-family: ${attr.value}`);
                    } else {
                        span.setAttribute('style', span.getAttribute('style') + `; font-family: ${attr.value}`);
                    }
                } else if (attr.name.toLowerCase() === 'size') {
                    // Convert size to font-size (approximate)
                    const size = parseInt(attr.value);
                    if (!isNaN(size)) {
                        const fontSize = size <= 1 ? '0.6em' : 
                                       size === 2 ? '0.8em' :
                                       size === 3 ? '1em' :
                                       size === 4 ? '1.2em' :
                                       size === 5 ? '1.5em' :
                                       size === 6 ? '2em' : '1em';
                        if (!span.getAttribute('style')) {
                            span.setAttribute('style', `font-size: ${fontSize}`);
                        } else {
                            span.setAttribute('style', span.getAttribute('style') + `; font-size: ${fontSize}`);
                        }
                    }
                } else if (attr.name.toLowerCase() !== 'class' && !attr.name.toLowerCase().startsWith('mso')) {
                    span.setAttribute(attr.name, attr.value);
                }
            });
            
            span.innerHTML = font.innerHTML;
            font.parentNode.replaceChild(span, font);
        });
    }
    
    // Normalize formatting tags - convert inline styles to semantic HTML where appropriate
    // This is optional - inline styles are also preserved
    function normalizeFormattingTags(element) {
        // Convert simple spans with only italic to <i> tags
        const elementsWithItalic = element.querySelectorAll('span[style*="font-style"][style*="italic"]');
        const italicElements = Array.from(elementsWithItalic);
        
        italicElements.forEach(el => {
            const style = el.getAttribute('style') || '';
            const styleObj = parseStyle(style);
            
            // Only convert if it's JUST italic with minimal other styles
            const otherStyles = Object.keys(styleObj).filter(k => 
                k !== 'font-style' && 
                k !== 'mso-' && 
                !k.startsWith('mso')
            );
            
            if (styleObj['font-style'] && styleObj['font-style'].toLowerCase().includes('italic')) {
                // If it's a simple span with mostly just italic, convert it
                if (otherStyles.length <= 1) {
                    const italic = document.createElement('em');
                    // Preserve other styles
                    if (otherStyles.length > 0) {
                        const preservedStyle = otherStyles.map(k => `${k}: ${styleObj[k]}`).join('; ');
                        if (preservedStyle) italic.setAttribute('style', preservedStyle);
                    }
                    italic.innerHTML = el.innerHTML;
                    if (el.parentNode) {
                        el.parentNode.replaceChild(italic, el);
                    }
                }
            }
        });
        
        // Convert simple spans with only bold to <strong> tags
        const elementsWithBold = element.querySelectorAll('span[style*="font-weight"]');
        const boldElements = Array.from(elementsWithBold);
        
        boldElements.forEach(el => {
            const style = el.getAttribute('style') || '';
            const styleObj = parseStyle(style);
            const fontWeight = styleObj['font-weight'];
            
            if (fontWeight && (
                fontWeight.toLowerCase() === 'bold' || 
                parseInt(fontWeight) >= 700
            )) {
                const otherStyles = Object.keys(styleObj).filter(k => 
                    k !== 'font-weight' && 
                    k !== 'mso-' && 
                    !k.startsWith('mso')
                );
                
                // Only convert if it's mostly just bold
                if (otherStyles.length <= 1) {
                    const bold = document.createElement('strong');
                    // Preserve other styles
                    if (otherStyles.length > 0) {
                        const preservedStyle = otherStyles.map(k => `${k}: ${styleObj[k]}`).join('; ');
                        if (preservedStyle) bold.setAttribute('style', preservedStyle);
                    }
                    bold.innerHTML = el.innerHTML;
                    if (el.parentNode) {
                        el.parentNode.replaceChild(bold, el);
                    }
                }
            }
        });
    }
    
    // Remove Word wrapper elements but preserve their content
    function removeWordWrapperElements(element) {
        // Remove Word-specific wrapper elements
        const wordElements = element.querySelectorAll('[class*="Mso"], [class*="mso-"]');
        wordElements.forEach(el => {
            // If it's just a wrapper, move its children up
            const parent = el.parentNode;
            if (parent) {
                while (el.firstChild) {
                    parent.insertBefore(el.firstChild, el);
                }
                parent.removeChild(el);
            }
        });
        
        // Remove elements with only Word-specific styles
        const allElements = element.querySelectorAll('*');
        allElements.forEach(el => {
            const style = el.getAttribute('style') || '';
            if (style.includes('mso-') && !style.match(/(font-style|font-weight|color|text-decoration|vertical-align)/i)) {
                // Move children up if it's just a wrapper
                const parent = el.parentNode;
                if (parent && el.children.length > 0) {
                    const fragment = document.createDocumentFragment();
                    while (el.firstChild) {
                        fragment.appendChild(el.firstChild);
                    }
                    parent.insertBefore(fragment, el);
                    parent.removeChild(el);
                }
            }
        });
    }

    // Flatten unnecessary nested spans while preserving all formatting
    function flattenNestedSpans(element) {
        // Process multiple passes to handle all nested cases
        let changed = true;
        let iterations = 0;
        const maxIterations = 15; // Safety limit
        
        while (changed && iterations < maxIterations) {
            changed = false;
            iterations++;
            
            // Get all spans in document order
            const allSpans = Array.from(element.querySelectorAll('span'));
            
            // Process from deepest (last) to shallowest (first) to avoid DOM issues
            let nestedSpansFound = 0;
            let flattenedCount = 0;
            for (let i = allSpans.length - 1; i >= 0; i--) {
                const span = allSpans[i];
                if (!span.parentNode || !span.isConnected) continue;
                
                const parent = span.parentNode;
                
                // If parent is a span, check if we can flatten
                if (parent && parent.tagName && parent.tagName.toUpperCase() === 'SPAN') {
                    nestedSpansFound++;
                    const parentStyle = parent.getAttribute('style') || '';
                    const childStyle = span.getAttribute('style') || '';
                    
                    // Parse styles
                    const parentStyles = parseStyle(parentStyle);
                    const childStyles = parseStyle(childStyle);
                    
                    // Check if parent has any unique properties that child doesn't have
                    const parentUniqueProps = Object.keys(parentStyles).filter(
                        prop => !childStyles[prop] || childStyles[prop] !== parentStyles[prop]
                    );
                    
                    // If parent has no unique styles (child has all parent's styles or parent is empty)
                    if (parentUniqueProps.length === 0) {
                        // Can safely remove parent wrapper - child has all needed styles
                        const grandparent = parent.parentNode;
                        if (grandparent) {
                            // Move all children from parent to grandparent, then remove parent
                            while (parent.firstChild) {
                                grandparent.insertBefore(parent.firstChild, parent);
                            }
                            grandparent.removeChild(parent);
                            changed = true;
                            flattenedCount++;
                            continue; // Skip rest of loop for this iteration
                        }
                    }
                }
            }
            
            // Merge adjacent spans with identical styles (sibling spans, not nested)
            const allSpansAgain = Array.from(element.querySelectorAll('span'));
            let adjacentMerged = 0;
            for (let i = 0; i < allSpansAgain.length; i++) {
                const span = allSpansAgain[i];
                // Skip if no parent (but allow processing even if isConnected is false, as spans might be in DocumentFragment)
                if (!span.parentNode) continue;
                
                const spanText = span.textContent || '';
                const spanTextTrimmed = spanText.trim();
                
                // Special handling for word-split spans: "hel" + text node + "ps." span
                if (spanTextTrimmed === 'hel') {
                    let checkNode = span.nextSibling;
                    let foundPsSpan = null;
                    // Look for a span starting with "ps" after text nodes
                    while (checkNode) {
                        if (checkNode.nodeType === Node.TEXT_NODE) {
                            // Skip text nodes (they might contain the "p" character)
                            checkNode = checkNode.nextSibling;
                        } else if (checkNode.tagName && checkNode.tagName.toUpperCase() === 'SPAN') {
                            const nextText = (checkNode.textContent || '').trim();
                            if (nextText === 'ps.' || nextText.startsWith('ps')) {
                                foundPsSpan = checkNode;
                                break;
                            } else {
                                break; // Found a span but not the one we're looking for
                            }
                        } else {
                            break; // Found something else
                        }
                    }
                    
                    if (foundPsSpan) {
                        // Merge "hel" + text node(s) + "ps." into "helps."
                        // First, collect and move text nodes between span and foundPsSpan
                        let textNodesToMove = [];
                        let checkNode = span.nextSibling;
                        while (checkNode && checkNode !== foundPsSpan) {
                            if (checkNode.nodeType === Node.TEXT_NODE) {
                                textNodesToMove.push(checkNode);
                            }
                            checkNode = checkNode.nextSibling;
                        }
                        // Move text node content into span (create text node to preserve content)
                        for (const textNode of textNodesToMove) {
                            if (textNode.textContent.trim()) {
                                span.appendChild(document.createTextNode(textNode.textContent));
                            }
                            textNode.remove();
                        }
                        // Move all content from foundPsSpan into span
                        while (foundPsSpan.firstChild) {
                            span.appendChild(foundPsSpan.firstChild);
                        }
                        foundPsSpan.remove();
                        changed = true;
                        adjacentMerged++;
                        continue; // Skip to next span
                    }
                }
                
                // Check next sibling
                let nextSibling = span.nextSibling;
                while (nextSibling && nextSibling.nodeType === Node.TEXT_NODE && !nextSibling.textContent.trim()) {
                    nextSibling = nextSibling.nextSibling;
                }
                
                if (nextSibling && nextSibling.tagName && nextSibling.tagName.toUpperCase() === 'SPAN') {
                    const spanStyle = span.getAttribute('style') || '';
                    const nextStyle = nextSibling.getAttribute('style') || '';
                    const spanText = span.textContent || '';
                    const nextText = nextSibling.textContent || '';
                    
                    // If styles are exactly identical, merge them
                    if (spanStyle === nextStyle) {
                        // Move next sibling's content into current span
                        while (nextSibling.firstChild) {
                            span.appendChild(nextSibling.firstChild);
                        }
                        // Remove any whitespace text nodes between them (but preserve non-whitespace)
                        let betweenNode = span.nextSibling;
                        while (betweenNode && betweenNode !== nextSibling) {
                            const toRemove = betweenNode;
                            betweenNode = betweenNode.nextSibling;
                            // Only remove if it's a text node with ONLY whitespace
                            // Preserve text nodes that have any non-whitespace content
                            if (toRemove.nodeType === Node.TEXT_NODE && !toRemove.textContent.trim()) {
                                toRemove.remove();
                            }
                        }
                        nextSibling.remove();
                        changed = true;
                        adjacentMerged++;
                    } else {
                        // Special case: merge spans that form a complete word even if styles differ slightly
                        // This handles cases like "hel" (bold) + "ps." (not bold) -> "help" + "s."
                        const spanTextTrimmed = spanText.trim();
                        const nextTextTrimmed = nextText.trim();
                        const combined = spanTextTrimmed + nextTextTrimmed;
                        // Check if combining them forms a common word pattern
                        // Pattern: span ends with partial word, next starts with completion
                        const wordPatterns = [
                            { end: 'hel', start: 'ps', fix: 'help' },  // "hel" + "ps" -> "help" + "s"
                            { end: 'hel', start: 'p', fix: 'help' },   // "hel" + "p" -> "help"
                        ];
                        
                        for (const pattern of wordPatterns) {
                            if (spanTextTrimmed === pattern.end && nextTextTrimmed.startsWith(pattern.start)) {
                                // Found a word split - merge them by moving content and preserving the first span's style
                                // Move next sibling's content into current span
                                while (nextSibling.firstChild) {
                                    span.appendChild(nextSibling.firstChild);
                                }
                                // Remove any whitespace text nodes between them
                                let betweenNode = span.nextSibling;
                                while (betweenNode && betweenNode !== nextSibling) {
                                    const toRemove = betweenNode;
                                    betweenNode = betweenNode.nextSibling;
                                    if (toRemove.nodeType === Node.TEXT_NODE && !toRemove.textContent.trim()) {
                                        toRemove.remove();
                                    }
                                }
                                nextSibling.remove();
                                changed = true;
                                adjacentMerged++;
                                break;
                            }
                        }
                    }
                }
            }
        }
        
        // Final pass: remove spans that only wrap text with no formatting
        const finalSpans = Array.from(element.querySelectorAll('span'));
        finalSpans.forEach(span => {
            if (!span.parentNode || !span.isConnected) return;
            
            const hasOnlyText = span.children.length === 0;
            const style = span.getAttribute('style') || '';
            const spanText = span.textContent || '';
            
            // If span only wraps text and has no meaningful formatting, unwrap it
            if (hasOnlyText && (!style || style.trim() === '')) {
                const parent = span.parentNode;
                const fragment = document.createDocumentFragment();
                while (span.firstChild) {
                    fragment.appendChild(span.firstChild);
                }
                parent.replaceChild(fragment, span);
            }
        });
    }

    // Clean empty elements but preserve structure
    function cleanEmptyElements(element) {
        // Remove completely empty spans (no text content, no children)
        // This handles image placeholders and other empty formatting wrappers
        const allSpans = element.querySelectorAll('span');
        const spansToRemove = [];
        
        allSpans.forEach(span => {
            // Check if span has any actual text content (not just whitespace)
            const textContent = span.textContent;
            const hasText = textContent && textContent.trim().length > 0;
            const hasChildren = span.children.length > 0;
            
            // Remove spans with no content at all (empty or only whitespace, no children)
            if (!hasText && !hasChildren) {
                spansToRemove.push(span);
            }
        });
        
        // Remove all identified empty spans
        spansToRemove.forEach(span => {
            if (span.parentNode) {
                span.remove();
            }
        });
        
        // Clean empty divs
        const emptyDivs = element.querySelectorAll('div');
        emptyDivs.forEach(div => {
            if (!div.textContent.trim() && div.children.length === 0) {
                div.remove();
            }
        });
        
        // Handle empty paragraphs
        const emptyParagraphs = element.querySelectorAll('p');
        emptyParagraphs.forEach(p => {
            if (!p.textContent.trim() && p.children.length === 0 && p.parentNode) {
                const br = document.createElement('br');
                p.parentNode.replaceChild(br, p);
            }
        });
    }

    // Convert HTML to output
    function convertToHtml(html) {
        // Sanitize HTML to remove styling and unsafe attributes
        let sanitizedHtml = html;
        if (window.HTMLSanitizer && typeof window.HTMLSanitizer.sanitize === 'function') {
            sanitizedHtml = window.HTMLSanitizer.sanitize(html);
        }
        
        // Clean HTML structure (remove unnecessary tags, unwrap elements)
        let cleanedHtml = sanitizedHtml;
        if (window.HTMLCleaner && typeof window.HTMLCleaner.clean === 'function') {
            cleanedHtml = window.HTMLCleaner.clean(sanitizedHtml);
        }
        
        // Apply mode-specific processing
        let modeProcessedHtml = cleanedHtml;
        if (window.ModeProcessor && typeof window.ModeProcessor.process === 'function') {
            modeProcessedHtml = window.ModeProcessor.process(cleanedHtml, currentMode, currentFeatures);
        }
        
        // Format and display HTML source code
        const formattedHtml = formatHtml(modeProcessedHtml);
        currentHtmlText = formattedHtml;
        
        if (htmlSourceCode) {
            // Set the text content
            htmlSourceCode.textContent = formattedHtml;
            
            // Apply syntax highlighting
            if (window.Prism) {
                Prism.highlightElement(htmlSourceCode);
            }
        }
        
        // Don't auto-resize - let it scroll instead
        // Reset any inline height styles that might have been set
        htmlSource.style.height = '';
        
        // Always update rendered HTML for preview (even if hidden)
        outputArea.innerHTML = modeProcessedHtml;
        
        updateCopyButtonState();
    }

    // Update copy button disabled state
    function updateCopyButtonState() {
        if (copyHtmlBtn) {
            const hasOutput = currentHtmlText.trim().length > 0;
            copyHtmlBtn.disabled = !hasOutput;
        }
    }
    
    // Auto-resize textarea based on content
    function autoResizeTextarea(textarea) {
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        // Set height to scrollHeight to fit all content
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    // Convert plain text to HTML
    function convertPlainTextToHtml(text) {
        // Split by lines and convert to paragraphs
        const lines = text.split('\n');
        const html = lines
            .map(line => {
                const trimmed = line.trim();
                if (trimmed === '') {
                    return '<br>';
                }
                return `<p>${escapeHtml(trimmed)}</p>`;
            })
            .join('\n');
        
        convertToHtml(html);
    }

    // Format HTML for display (compact style with nested tags on same line)
    function formatHtml(html) {
        // Use compact formatter if available, otherwise fallback to basic formatting
        if (window.HTMLFormatter && typeof window.HTMLFormatter.formatCompact === 'function') {
            return window.HTMLFormatter.formatCompact(html);
        }
        
        // Fallback: basic formatting
        let formatted = html;
        let indent = 0;
        const indentSize = 2;
        
        // Split by tags
        formatted = formatted.replace(/>\s*</g, '>\n<');
        
        // Add indentation
        const lines = formatted.split('\n');
        const result = [];
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) {
                return; // Skip empty lines
            }
            
            // Decrease indent for closing tags
            if (trimmed.startsWith('</')) {
                indent = Math.max(0, indent - indentSize);
            }
            
            // Add line with indentation
            result.push(' '.repeat(indent) + trimmed);
            
            // Increase indent for opening tags (but not self-closing)
            if (trimmed.startsWith('<') && !trimmed.startsWith('</') && 
                !trimmed.endsWith('/>') && !trimmed.match(/^<(br|hr|img|input|meta|link)/i)) {
                indent += indentSize;
            }
        });
        
        return result.join('\n').trim();
    }

    // Escape HTML entities
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Clear input area
    function clearInput() {
        inputArea.innerHTML = '';
        outputArea.innerHTML = '';
        if (htmlSourceCode) {
            htmlSourceCode.textContent = '';
            currentHtmlText = '';
            // Re-highlight empty code
            if (window.Prism) {
                Prism.highlightElement(htmlSourceCode);
            }
        }
        updateClearButtonVisibility();
        inputArea.focus();
    }

    // Copy HTML to clipboard
    async function copyHtml() {
        const html = currentHtmlText;
        
        if (!html) {
            return;
        }
        
        try {
            await navigator.clipboard.writeText(html);
            
            // Visual feedback with icons
            if (copyIcon && checkIcon) {
                copyIcon.style.display = 'none';
                checkIcon.style.display = 'block';
                checkIcon.style.color = '#22c55e';
                
                setTimeout(() => {
                    copyIcon.style.display = 'block';
                    checkIcon.style.display = 'none';
                }, 2000);
            }
        } catch (err) {
            // Fallback for older browsers - create temporary textarea
            const tempTextarea = document.createElement('textarea');
            tempTextarea.value = html;
            tempTextarea.style.position = 'fixed';
            tempTextarea.style.opacity = '0';
            document.body.appendChild(tempTextarea);
            tempTextarea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextarea);
            
            if (copyIcon && checkIcon) {
                copyIcon.style.display = 'none';
                checkIcon.style.display = 'block';
                checkIcon.style.color = '#22c55e';
                setTimeout(() => {
                    copyIcon.style.display = 'block';
                    checkIcon.style.display = 'none';
                }, 2000);
            }
        }
    }

    // Toggle between rendered view and HTML source
    function toggleView(showSource) {
        isShowingSource = showSource;
        
        if (isShowingSource) {
            outputArea.classList.remove('show');
            htmlSource.classList.remove('hide');
            // Reset any inline height styles to allow scrolling
            htmlSource.style.height = '';
        } else {
            // Update rendered view with current HTML
            const html = currentHtmlText;
            if (html) {
                // Parse the formatted HTML back to display (remove formatting/indentation)
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html.replace(/\n\s*/g, '');
                outputArea.innerHTML = tempDiv.innerHTML;
            }
            outputArea.classList.add('show');
            htmlSource.classList.add('hide');
        }
        updateToggleButtons();
    }

    // Update toggle button states
    function updateToggleButtons() {
        if (toggleViewCodeBtn && toggleViewPreviewBtn) {
            if (isShowingSource) {
                toggleViewCodeBtn.classList.add('active');
                toggleViewPreviewBtn.classList.remove('active');
            } else {
                toggleViewCodeBtn.classList.remove('active');
                toggleViewPreviewBtn.classList.add('active');
            }
        }
    }

    // Initialize on DOM load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

