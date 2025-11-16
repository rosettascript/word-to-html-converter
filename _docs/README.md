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
│   └── converter.css     # Converter-specific styles
├── js/                     # JavaScript modules
│   ├── main.js            # Entry point
│   ├── core/              # Core processing logic
│   ├── modes/             # Output mode processors
│   ├── features/          # Optional feature modules
│   ├── ui/                # UI components
│   └── utils/             # Utility functions
├── _docs/                  # Documentation
│   ├── prd/               # Product Requirements Document
│   ├── guide/             # Development guides
│   ├── changelog/         # Feature updates and implementation notes
│   ├── tests/             # Test fixtures and documentation
│   └── archive/           # Archived documentation
└── robots.txt, sitemap.xml # SEO files
```

## Documentation Structure

### `/prd/` - Product Requirements Document
Complete specifications for the application:
- User personas and use cases
- Feature requirements and scope
- Technical specifications
- UI/UX design guidelines
- Launch and rollout plans

### `/guide/` - Development Guides
- **DEVELOPMENT.md** - Development workflow, testing strategy, coding standards
- **Enhanced Design System.md** - Complete design system specifications
- **FOLDER_STRUCTURE.md** - Project organization guide

### `/changelog/` - Feature Updates
Detailed documentation of implemented features and changes:
- Feature implementation notes
- Bug fixes and improvements
- Design decisions and rationale
- Testing documentation

### `/tests/` - Test Documentation
- Test fixtures and sample data
- Expected outputs for different modes
- Test case documentation

### Root Documentation Files
- **README.md** - Project overview and quick start
- **PROJECT-SKELETON-SUMMARY.md** - Implementation summary and project status
- **WHATS-NEW.md** - Recent additions and changes to documentation

## Technical Details

- **Vanilla JavaScript**: No frameworks or dependencies
- **ES6 Modules**: Modern JavaScript module system
- **DOMParser API**: For HTML parsing and manipulation
- **Design System**: Warm, minimal aesthetic with glassmorphism effects
- **Accessibility**: WCAG AA compliant with keyboard navigation support
- **Performance**: Optimized for < 100ms processing time for typical documents

## Browser Support

- Modern browsers (last 2 versions): Chrome, Firefox, Safari, Edge
- Requires ES6 module support

## License

Free to use for personal and commercial projects.

## Contributing

This project follows the PRD specifications in the `prd/` directory. See `guide/DEVELOPMENT.md` for development guidelines.


