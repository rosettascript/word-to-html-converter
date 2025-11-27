# Word to HTML Converter

A free, client-side tool for cleaning Word-to-HTML output. Remove inline styles, preserve semantic structure, and format HTML for Shopify Blogs, Shopify Shoppables, or regular use.

## Features

- **Instant Processing**: Automatic conversion as you type with smart debouncing
- **Three Output Modes**: 
  - Regular: Basic HTML cleaning
  - Shopify Blogs: Optimized for Shopify blog posts
  - Shopify Shoppables: Compact formatting for product descriptions
- **Style Removal**: Automatically removes inline styles, classes, and unnecessary attributes
- **Image-Free Output**: All images are automatically removed from output
- **Preview Toggle**: Switch between HTML code view and rendered preview
- **100% Client-Side**: All processing happens in your browser - your content never leaves your device

## Getting Started

### Run Locally

You can open `index.html` directly in your browser, but using a local server avoids CORS issues:

**Python:**
```bash
python3 -m http.server 5173
```

**Node.js:**
```bash
npx http-server -c-1
# or
npx serve .
```

Then open `http://localhost:5173` (or the URL printed by the server).

### Usage

1. Paste your Word-to-HTML output into the input area
2. Select your desired output mode (Regular, Shopify Blogs, or Shopify Shoppables)
3. Enable optional features as needed
4. View the cleaned HTML in code view or switch to rendered preview
5. Copy or download the cleaned HTML

## Project Structure

```
word-to-html-converter/
├── index.html              # Main HTML file
├── css/                    # Stylesheets
│   ├── main.css           # Global styles and design tokens
│   ├── components.css     # Component styles
│   ├── sections.css       # Page section styles
│   └── converter.css      # Converter-specific styles
├── js/                     # JavaScript modules
│   ├── main.js            # Entry point
│   ├── core/              # Core processing logic
│   │   ├── processor.js   # Main processor
│   │   └── sanitizer.js   # HTML sanitizer
│   ├── modes/             # Output mode processors
│   │   ├── regular-mode.js
│   │   ├── shopify-blogs-mode.js
│   │   └── shopify-shoppables-mode.js
│   ├── features/          # Optional feature modules
│   │   ├── strong-in-headers.js
│   │   ├── remove-domain-links.js
│   │   ├── whitespace-normalize.js
│   │   ├── list-combiner.js
│   │   ├── external-link-attributes.js
│   │   └── key-takeaways.js
│   ├── ui/                # UI components
│   │   ├── converter-ui.js
│   │   ├── mode-selector.js
│   │   ├── feature-toggles.js
│   │   ├── preview-toggle.js
│   │   ├── copy-download.js
│   │   ├── error-handler.js
│   │   ├── status-handler.js
│   │   └── toast.js
│   └── utils/             # Utility functions
│       └── debounce.js
├── _docs/                 # Documentation
│   ├── prd/              # Product Requirements Document
│   ├── guide/            # Development guides
│   ├── changelog/        # Feature updates & implementation notes
│   ├── tests/            # Test fixtures
│   └── archive/          # Archived documentation
├── robots.txt             # SEO crawler rules
├── sitemap.xml            # SEO sitemap
└── package.json           # NPM dependencies (for testing)
```

## Development

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Testing Strategy

The project uses Vitest for testing with the following structure:
- **Unit tests**: Test individual functions and modules
- **Integration tests**: Test complete processing flow
- **Fixtures**: Real-world Word-to-HTML samples with expected outputs

## Technical Details

- **Vanilla JavaScript**: No frameworks or dependencies (runtime)
- **ES6 Modules**: Modern JavaScript module system
- **DOMParser API**: For HTML parsing and manipulation
- **Design System**: Warm, minimal aesthetic with glassmorphism effects
- **Accessibility**: WCAG AA compliant with keyboard navigation support
- **Performance**: Optimized for < 100ms processing time for typical documents

## Browser Support

- Modern browsers (last 2 versions): Chrome, Firefox, Safari, Edge
- Requires ES6 module support

## Deployment

### GitHub Pages

1. Push your code to GitHub
2. Go to Settings → Pages
3. Select the `main` branch as the source
4. Your site will be published at `https://yourusername.github.io/word-to-html-converter/`

## Documentation

Complete documentation is available in the `_docs/` directory:

### Product Requirements (`_docs/prd/`)
- Complete product specifications and requirements
- User personas and use cases
- Technical specifications and constraints
- UI/UX design guidelines

### Development Guides (`_docs/guide/`)
- **DEVELOPMENT.md**: Development workflow, testing strategy, coding standards
- **Enhanced Design System.md**: Complete design system specifications
- **FOLDER_STRUCTURE.md**: Project organization guide

### Changelog (`_docs/changelog/`)
- Feature implementation notes and updates
- Bug fixes and improvements
- Design decisions and rationale
- Testing documentation for each feature

### Test Fixtures (`_docs/tests/`)
- Sample input/output files
- Expected outputs for different modes
- Test case documentation

### Quick Links
- [Project Overview](_docs/PROJECT-SKELETON-SUMMARY.md)
- [What's New](_docs/WHATS-NEW.md)
- [Cleanup Summary](_docs/CODEBASE-CLEANUP-SUMMARY.md)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](_docs/CONTRIBUTING.md) for guidelines.

This project follows the PRD specifications in the `_docs/prd/` directory. See `_docs/guide/DEVELOPMENT.md` for development guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Kim Galicia

---

**Built with ❤️ using vanilla JavaScript. No frameworks, no dependencies, no tracking.**
