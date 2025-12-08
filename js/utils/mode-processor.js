// Mode Processor
// Applies mode-specific formatting based on selected mode and enabled features

(function() {
    'use strict';

    /**
     * Process HTML based on selected mode and enabled features
     * @param {string} html - HTML string to process
     * @param {string} mode - Mode: 'regular', 'blogs', or 'shoppables'
     * @param {Object} features - Object with feature flags
     * @returns {string} - Processed HTML string
     */
    function processMode(html, mode, features) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        let processedHtml = html;

        // List normalization - applies to all modes (regular, blogs, shoppables)
        if (window.ModeListNormalize) {
            processedHtml = window.ModeListNormalize.normalize(processedHtml);
        }

        // Regular mode: no special processing beyond list normalization
        if (mode === 'regular') {
            return processedHtml;
        }

        // Blogs mode features
        if (mode === 'blogs') {
            // Heading strong tags (must be first to wrap headings before other processing)
            if (features.headingStrong !== false && window.ModeHeadingStrong) {
                processedHtml = window.ModeHeadingStrong.wrap(processedHtml);
            }

            // Key Takeaways formatting
            if (features.keyTakeaways !== false && window.ModeKeyTakeaways) {
                processedHtml = window.ModeKeyTakeaways.format(processedHtml);
            }

            // H1 removal
            if (features.h1Removal !== false && window.ModeH1Removal) {
                processedHtml = window.ModeH1Removal.remove(processedHtml);
            }

            // Link attributes
            if (features.linkAttributes !== false && window.ModeLinkAttributes) {
                processedHtml = window.ModeLinkAttributes.add(processedHtml);
            }

            // OL Header Conversion (enabled by default, before spacing so converted headings get spacing)
            if (features.olHeaderConversion !== false && window.ModeOlHeaderConversion) {
                processedHtml = window.ModeOlHeaderConversion.convert(processedHtml);
            }

            // Spacing (after OL conversion so converted headings get spacing)
            if (features.spacing !== false && window.ModeSpacing) {
                processedHtml = window.ModeSpacing.add(processedHtml);
            }

            // Relative paths (disabled by default)
            if (features.relativePaths === true && window.ModeRelativePaths) {
                processedHtml = window.ModeRelativePaths.convert(processedHtml);
            }

            // Sources normalization
            if (features.sourcesNormalize !== false && window.ModeSourcesNormalize) {
                processedHtml = window.ModeSourcesNormalize.normalize(processedHtml);
            }
        }

        // Shoppables mode features
        if (mode === 'shoppables') {
            // Heading strong tags (must be first to wrap headings before other processing)
            if (features.headingStrong !== false && window.ModeHeadingStrong) {
                processedHtml = window.ModeHeadingStrong.wrap(processedHtml);
            }

            // Link attributes
            if (features.linkAttributes !== false && window.ModeLinkAttributes) {
                processedHtml = window.ModeLinkAttributes.add(processedHtml);
            }

            // Relative paths (disabled by default)
            if (features.relativePaths === true && window.ModeRelativePaths) {
                processedHtml = window.ModeRelativePaths.convert(processedHtml);
            }

            // OL Header Conversion (enabled by default)
            if (features.olHeaderConversion !== false && window.ModeOlHeaderConversion) {
                processedHtml = window.ModeOlHeaderConversion.convert(processedHtml);
            }

            // Sources normalization
            if (features.sourcesNormalize !== false && window.ModeSourcesNormalize) {
                processedHtml = window.ModeSourcesNormalize.normalize(processedHtml);
            }
        }

        return processedHtml;
    }

    // Export for use in other modules
    if (typeof window !== 'undefined') {
        window.ModeProcessor = {
            process: processMode
        };
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { process: processMode };
    }
})();

