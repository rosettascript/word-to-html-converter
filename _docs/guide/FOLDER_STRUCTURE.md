# Recommended Folder Structure

Based on the PRD features and processes, here's the recommended folder structure for the Word to HTML Converter project:

```
word-to-html-converter/
├── index.html                 # Main HTML file (SEO-optimized page structure)
├── README.md                  # Project documentation
├── LICENSE                    # License file (if open source)
│
├── css/                       # Stylesheets
│   ├── main.css              # Main stylesheet (global styles, layout)
│   ├── components.css        # Component-specific styles (buttons, inputs, etc.)
│   ├── sections.css          # Page sections (hero, features, about, FAQ, footer)
│   └── converter.css         # Converter tool specific styles
│
├── js/                        # JavaScript modules
│   ├── main.js               # Main entry point, initializes app
│   │
│   ├── core/                  # Core processing logic
│   │   ├── preprocessor.js   # Pre-processing: Image removal on paste
│   │   ├── base-processor.js  # Base processing: Style removal, semantic preservation
│   │   └── dom-utils.js       # DOM manipulation utilities
│   │
│   ├── modes/                 # Output mode processors
│   │   ├── regular-mode.js   # Regular mode processing
│   │   ├── shopify-blogs-mode.js    # Shopify Blogs mode processing
│   │   └── shopify-shoppables-mode.js # Shopify Shoppables mode processing
│   │
│   ├── features/              # Optional features
│   │   ├── strong-in-headers.js      # Put <strong> tags in headers
│   │   ├── remove-domain-links.js    # Remove domain in internal links
│   │   └── remove-spacing.js         # Remove spacing (whitespace normalization)
│   │
│   ├── ui/                    # UI components and interactions
│   │   ├── converter-ui.js   # Main converter UI (textarea, mode selector, checkboxes)
│   │   ├── preview-toggle.js # Preview toggle (code view ↔ rendered view)
│   │   ├── results-display.js # Results display and copy/download functionality
│   │   ├── debounce-handler.js # Debouncing for instant conversion
│   │   └── error-handler.js  # Error display and handling
│   │
│   ├── sections/              # Page sections (SEO structure)
│   │   ├── hero.js           # Hero section (if interactive)
│   │   ├── features.js       # Features section (if interactive)
│   │   ├── about.js          # About section (if interactive)
│   │   ├── faq.js            # FAQ section (accordion functionality)
│   │   └── footer.js         # Footer (if interactive)
│   │
│   ├── utils/                 # Utility functions
│   │   ├── constants.js      # Constants (output modes, default options, etc.)
│   │   ├── validation.js    # Input validation
│   │   ├── clipboard.js     # Clipboard API wrapper
│   │   ├── download.js      # File download utility
│   │   └── analytics.js     # Analytics tracking (if implemented)
│   │
│   └── library/               # JavaScript library for integration (P1)
│       ├── word-to-html-cleaner.js  # Main library file
│       └── library-api.js    # Public API for library
│
├── assets/                    # Static assets
│   ├── images/              # Images (if any - hero illustrations, icons)
│   ├── icons/               # SVG icons (preview toggle, copy, download, etc.)
│   └── fonts/               # Custom fonts (if any)
│
├── tests/                     # Testing (if implemented)
│   ├── unit/                 # Unit tests
│   │   ├── core/
│   │   ├── modes/
│   │   └── features/
│   └── integration/          # Integration tests
│
└── docs/                      # Additional documentation
    ├── api.md                # API documentation (for library)
    ├── deployment.md         # Deployment guide (GitHub Pages)
    └── contributing.md       # Contributing guidelines (if open source)
```

## Key Design Decisions

### 1. **Separation of Concerns**
- **Core processing** (`js/core/`): Base HTML cleaning logic, reusable across all modes
- **Mode-specific logic** (`js/modes/`): Each output mode has its own processor
- **Optional features** (`js/features/`): Modular, can be enabled/disabled independently
- **UI components** (`js/ui/`): All user interface interactions separated from processing logic

### 2. **Modular Architecture**
- Each mode processor can be tested independently
- Optional features are self-contained modules
- Easy to add new modes or features without affecting existing code

### 3. **Processing Flow Alignment**
The structure follows the PRD processing flow:
```
Pre-processing (preprocessor.js)
  ↓
Base Processing (base-processor.js)
  ↓
Mode Processing (modes/*.js)
  ↓
Optional Features (features/*.js)
  ↓
Output (results-display.js)
```

### 4. **SEO Page Structure**
- Main `index.html` contains all SEO sections (Hero, Converter, Features, About, FAQ, Footer)
- Section-specific JS files in `js/sections/` for any interactive elements
- CSS organized by component and section for maintainability

### 5. **Library Support (P1)**
- `js/library/` folder ready for JavaScript library extraction
- Can be built from existing core/modes/features modules
- Separate API file for clean public interface

## Alternative: Simpler Structure (MVP)

If you prefer a simpler structure for MVP, you could consolidate:

```
word-to-html-converter/
├── index.html
├── css/
│   └── styles.css           # All styles in one file
├── js/
│   ├── app.js               # Main application logic
│   ├── processor.js         # All processing logic (core + modes + features)
│   └── ui.js                # All UI interactions
└── assets/
    └── icons/
```

**Recommendation:** Start with the detailed structure above. It's more maintainable and aligns with the PRD's modular features. You can always consolidate later if needed.

## File Naming Conventions

- **JavaScript:** camelCase for files (`shopifyBlogsMode.js`)
- **CSS:** kebab-case for files (`converter-ui.css`)
- **HTML:** kebab-case (`index.html`)
- **Constants:** UPPER_SNAKE_CASE in code

## Module Organization Example

### `js/core/base-processor.js`
```javascript
// Base processing functions
export function removeInlineStyles(element) { ... }
export function removeEmptySpans(element) { ... }
export function preserveSemanticElements(element) { ... }
```

### `js/modes/shopify-blogs-mode.js`
```javascript
import { baseProcess } from '../core/base-processor.js';
import { normalizeKeyTakeaways } from './key-takeaways.js';

export function processShopifyBlogs(html, options) {
  let cleaned = baseProcess(html);
  cleaned = normalizeKeyTakeaways(cleaned);
  cleaned = combineLists(cleaned);
  cleaned = addLinkAttributes(cleaned);
  return cleaned;
}
```

### `js/main.js`
```javascript
import { processRegular } from './modes/regular-mode.js';
import { processShopifyBlogs } from './modes/shopify-blogs-mode.js';
import { processShopifyShoppables } from './modes/shopify-shoppables-mode.js';
import { setupConverterUI } from './ui/converter-ui.js';

// Initialize app
setupConverterUI({
  onProcess: (html, mode, options) => {
    switch(mode) {
      case 'regular': return processRegular(html, options);
      case 'shopify-blogs': return processShopifyBlogs(html, options);
      case 'shopify-shoppables': return processShopifyShoppables(html, options);
    }
  }
});
```

This structure supports:
- ✅ Clear separation of concerns
- ✅ Easy testing of individual components
- ✅ Simple addition of new modes/features
- ✅ Library extraction (P1) from existing modules
- ✅ Maintainable and scalable codebase

