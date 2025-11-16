# Development Guide

This guide explains how to set up the project locally, the implementation roadmap, coding standards, testing, and deployment. The stack is vanilla HTML/CSS/JavaScript, runs entirely client-side, and targets GitHub Pages for hosting.

## Prerequisites
- Modern browser (Chrome/Firefox/Edge/Safari)
- Optional: Node.js 18+ (for running a local static server)

## Run Locally
You can open `index.html` directly in the browser, but a local static server avoids CORS issues:
- Python: `python3 -m http.server 5173`
- Node (one-off): `npx http-server -c-1`
- Node (alt): `npx serve .`

Then open `http://localhost:5173` (or the printed URL).

## Project Structure
Refer to `guide/FOLDER_STRUCTURE.md` for the recommended modular structure:
- `js/core/` base processing (sanitizer, style removal, semantic preservation)
- `js/modes/` output-mode processors (regular, shopify-blogs, shopify-shoppables)
- `js/features/` optional feature modules (e.g., strong-in-headers, whitespace)
- `js/ui/` UI: input, preview toggle, debounce, results, errors
- `assets/` icons/fonts
- `tests/` unit/integration

Start with the detailed structure. It keeps code testable and library-ready.

## Implementation Roadmap (MVP)
1) UI Scaffolding
- `index.html` with SEO sections (Hero, Converter, Features, About, FAQ)
- Mode selector (Regular/Shopify Blogs/Shopify Shoppables)
- Optional feature toggles:
  - Put `<strong>` tags in headers (default: on in Shopify Blogs; off otherwise)
  - Remove domain in internal links
  - Normalize whitespace (Blogs)
  - Display images in input preview (default: off; output remains image-free)
  - P1: Disable instant processing (manual re-run)
- Code/Rendered preview toggle

2) Core Processing
- DOM parsing using `DOMParser`
- Sanitizer (allowlist): tags `a, p, ul, ol, li, h1-h6, em, strong, sup, sub, code, blockquote, table, thead, tbody, tr, th, td, br`
- Allowed attributes: `href` (validated http/https/mailto), `colspan`, `rowspan`, `scope`, `rel/target` (set programmatically)
- Strip: all inline `style`, `class`, `id`, `data-*`, and all `on*` events
- Remove empty/unnecessary `span`
- Normalize whitespace (safe minify engine for Shoppables; non-destructive normalize for others)
- Link normalization:
  - Internal links → relative paths (no `target`)
  - External links → add `target="_blank"` + `rel="noopener noreferrer"`

3) Modes
- Regular: base cleaning only
- Shopify Blogs:
  - Key Takeaways detection: heading text match + fallback structure
  - Remove `<em>` in Key Takeaways
  - Combine adjacent lists separated only by whitespace/empty paragraphs
  - External link attributes as above
  - Default strong-in-headers = on
- Shopify Shoppables:
  - Safe whitespace minification (preserve meaning)
  - Combine lists

4) Features & UX
- Debounce instant processing (500ms)
- P1: “Disable instant processing” toggle + manual re-run
- Rendered preview in a sandboxed container
- Copy to clipboard and download functions
- Error handling UI (no line numbers—use contextual snippet)

5) Images Behavior
- Output never includes `<img>`
- If “Display images in input preview” is enabled, show originals in preview only

## Coding Standards
- Naming: descriptive, full words, no 1–2 letter vars
- Separation of concerns: keep core processing pure; UI in `js/ui/`
- Control flow: prefer guard clauses; avoid unnecessary try/catch
- Comments: only for non-obvious intent or invariants
- Formatting: match repository style; keep lines readable

## Testing

### Testing Framework & Strategy

**Framework Choice: Vitest (Recommended)**

Vitest is chosen for its:
- ES module support (matches our codebase)
- Fast execution with watch mode
- Jest-compatible API (familiar to most developers)
- Built-in code coverage
- Browser-like environment with jsdom

**Alternative:** For minimal setup, use bare Node.js + JSDOM with native assertions.

### Project Structure

```
tests/
├── unit/                      # Unit tests (isolated functions)
│   ├── core/
│   │   ├── sanitizer.test.js        # Allowlist/strip list rules
│   │   ├── style-removal.test.js    # Inline style removal
│   │   ├── span-cleanup.test.js     # Empty span removal
│   │   └── link-classifier.test.js  # Link classification logic
│   ├── modes/
│   │   ├── regular-mode.test.js
│   │   ├── shopify-blogs.test.js    # Key Takeaways, list combining
│   │   └── shopify-shoppables.test.js
│   └── features/
│       ├── strong-in-headers.test.js
│       ├── whitespace-normalize.test.js
│       └── list-combiner.test.js
│
├── integration/               # Integration tests (end-to-end)
│   ├── full-pipeline.test.js        # Complete processing flow
│   └── fixture-validation.test.js   # Test against golden outputs
│
├── fixtures/                  # Test data
│   ├── README.md
│   ├── sample-01-input.html
│   ├── sample-01-expected-regular.html
│   ├── sample-01-expected-shopify-blogs.html
│   ├── sample-01-expected-shoppables.html
│   └── ...                   # More samples (target: 50+)
│
└── helpers/                   # Test utilities
    ├── dom-compare.js        # DOM comparison (ignore whitespace)
    ├── html-normalizer.js    # Normalize HTML for comparison
    └── test-data.js          # Shared test data
```

### Installation & Setup

**Using Vitest:**

```bash
# Install Vitest and jsdom
npm install --save-dev vitest jsdom

# Create vitest.config.js
cat > vitest.config.js << 'EOF'
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['js/**/*.js'],
      exclude: ['js/main.js', 'tests/**'],
    },
  },
});
EOF

# Add test scripts to package.json
npm pkg set scripts.test="vitest"
npm pkg set scripts.test:ui="vitest --ui"
npm pkg set scripts.test:coverage="vitest --coverage"
```

**Using Bare Node.js (Minimal Setup):**

```bash
# Install only jsdom
npm install --save-dev jsdom

# Run tests with Node
node --test tests/**/*.test.js
```

### Test Coverage Requirements

**Coverage Targets:**
- **Core processing:** ≥ 90% line coverage
- **Mode processors:** ≥ 85% line coverage
- **Optional features:** ≥ 80% line coverage
- **UI components:** ≥ 70% line coverage (harder to test)
- **Overall project:** ≥ 80% line coverage

**Quality Gates:**
- ≥ 95% inline style removal accuracy (vs test fixtures)
- ≥ 99% semantic structure preservation (allow normalization)
- 0 critical bugs in core processing
- All edge cases documented and tested

### Unit Test Examples

**Example 1: Sanitizer Test**

```javascript
// tests/unit/core/sanitizer.test.js
import { describe, it, expect } from 'vitest';
import { sanitizeHTML } from '../../../js/core/sanitizer.js';

describe('HTML Sanitizer', () => {
  it('should remove script tags', () => {
    const input = '<p>Safe</p><script>alert("XSS")</script>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('<p>Safe</p>');
  });

  it('should remove inline style attributes', () => {
    const input = '<p style="color: red;">Text</p>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('style=');
    expect(result).toBe('<p>Text</p>');
  });

  it('should preserve semantic elements', () => {
    const input = '<h1>Title</h1><p>Text with <strong>bold</strong> and <em>italic</em>.</p>';
    const result = sanitizeHTML(input);
    expect(result).toContain('<h1>Title</h1>');
    expect(result).toContain('<strong>bold</strong>');
    expect(result).toContain('<em>italic</em>');
  });

  it('should remove empty spans', () => {
    const input = '<p><span></span>Text<span>  </span></p>';
    const result = sanitizeHTML(input);
    expect(result).toBe('<p>Text</p>');
  });
});
```

**Example 2: Link Classification Test**

```javascript
// tests/unit/core/link-classifier.test.js
import { describe, it, expect } from 'vitest';
import { classifyLink } from '../../../js/core/link-classifier.js';

describe('Link Classifier', () => {
  it('should classify relative paths as internal', () => {
    expect(classifyLink('/about')).toBe('internal');
    expect(classifyLink('./page')).toBe('internal');
    expect(classifyLink('../parent')).toBe('internal');
  });

  it('should classify absolute URLs as external by default', () => {
    expect(classifyLink('https://example.com')).toBe('external');
    expect(classifyLink('http://external.com/page')).toBe('external');
  });

  it('should classify matching domain as internal when configured', () => {
    const domain = 'https://mysite.com';
    expect(classifyLink('https://mysite.com/blog', domain)).toBe('internal');
    expect(classifyLink('https://example.com', domain)).toBe('external');
  });

  it('should classify mailto/tel as special', () => {
    expect(classifyLink('mailto:test@example.com')).toBe('special');
    expect(classifyLink('tel:+1234567890')).toBe('special');
  });

  it('should handle edge cases', () => {
    expect(classifyLink('#anchor')).toBe('internal');
    expect(classifyLink('javascript:void(0)')).toBe('internal'); // Will be sanitized later
    expect(classifyLink('')).toBe('internal');
  });
});
```

**Example 3: Mode Processor Test**

```javascript
// tests/unit/modes/shopify-blogs.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { processShopifyBlogs } from '../../../js/modes/shopify-blogs.js';

describe('Shopify Blogs Mode', () => {
  it('should remove <em> tags in Key Takeaways section', () => {
    const input = `
      <h2>Key Takeaways</h2>
      <ul>
        <li><em>Point A</em></li>
        <li><em>Point B</em></li>
      </ul>
    `;
    const result = processShopifyBlogs(input);
    expect(result).not.toContain('<em>');
    expect(result).toContain('<li>Point A</li>');
  });

  it('should add colon to Key Takeaways heading if missing', () => {
    const input = '<h2>Key Takeaways</h2>';
    const result = processShopifyBlogs(input);
    expect(result).toContain('<h2>Key Takeaways:</h2>');
  });

  it('should combine adjacent lists', () => {
    const input = `
      <ul><li>Item 1</li></ul>
      <ul><li>Item 2</li></ul>
    `;
    const result = processShopifyBlogs(input);
    expect(result.match(/<ul>/g)).toHaveLength(1);
    expect(result).toContain('<li>Item 1</li>');
    expect(result).toContain('<li>Item 2</li>');
  });

  it('should not combine lists separated by <p>&nbsp;</p>', () => {
    const input = `
      <ul><li>Item 1</li></ul>
      <p>&nbsp;</p>
      <ul><li>Item 2</li></ul>
    `;
    const result = processShopifyBlogs(input);
    expect(result.match(/<ul>/g)).toHaveLength(2);
    expect(result).toContain('<p>&nbsp;</p>');
  });

  it('should add target="_blank" to external links', () => {
    const input = '<a href="https://example.com">External</a>';
    const result = processShopifyBlogs(input);
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
  });
});
```

### Integration Test Example

```javascript
// tests/integration/fixture-validation.test.js
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { processHTML } from '../../js/core/processor.js';
import { compareDOM } from '../helpers/dom-compare.js';

const fixtures = [
  'sample-01',
  'sample-02',
  // ... more fixtures
];

describe('Fixture Validation', () => {
  fixtures.forEach(fixture => {
    describe(`Fixture: ${fixture}`, () => {
      const input = readFileSync(`tests/fixtures/${fixture}-input.html`, 'utf-8');

      it('should match expected Regular mode output', () => {
        const expected = readFileSync(`tests/fixtures/${fixture}-expected-regular.html`, 'utf-8');
        const result = processHTML(input, { mode: 'regular' });
        
        const match = compareDOM(result, expected);
        expect(match.identical).toBe(true);
        if (!match.identical) {
          console.log('Differences:', match.differences);
        }
      });

      it('should match expected Shopify Blogs mode output', () => {
        const expected = readFileSync(`tests/fixtures/${fixture}-expected-shopify-blogs.html`, 'utf-8');
        const result = processHTML(input, { mode: 'shopify-blogs' });
        
        const match = compareDOM(result, expected);
        expect(match.identical).toBe(true);
      });

      it('should match expected Shopify Shoppables mode output', () => {
        const expected = readFileSync(`tests/fixtures/${fixture}-expected-shoppables.html`, 'utf-8');
        const result = processHTML(input, { mode: 'shopify-shoppables' });
        
        const match = compareDOM(result, expected);
        expect(match.identical).toBe(true);
      });
    });
  });
});
```

### Test Helpers

**DOM Comparison Helper:**

```javascript
// tests/helpers/dom-compare.js
import { JSDOM } from 'jsdom';

export function compareDOM(html1, html2, options = {}) {
  const { ignoreWhitespace = true, ignoreAttributes = [] } = options;
  
  const dom1 = new JSDOM(html1);
  const dom2 = new JSDOM(html2);
  
  const body1 = dom1.window.document.body;
  const body2 = dom2.window.document.body;
  
  if (ignoreWhitespace) {
    normalizeWhitespace(body1);
    normalizeWhitespace(body2);
  }
  
  const differences = findDifferences(body1, body2, ignoreAttributes);
  
  return {
    identical: differences.length === 0,
    differences
  };
}

function normalizeWhitespace(element) {
  // Collapse whitespace in text nodes
  const walker = element.ownerDocument.createTreeWalker(
    element,
    4, // NodeFilter.SHOW_TEXT
    null,
    false
  );
  
  let textNode;
  while (textNode = walker.nextNode()) {
    textNode.textContent = textNode.textContent.replace(/\s+/g, ' ').trim();
  }
}

function findDifferences(node1, node2, ignoreAttributes = []) {
  const differences = [];
  
  // Compare node types
  if (node1.nodeType !== node2.nodeType) {
    differences.push({
      type: 'node_type',
      path: getNodePath(node1),
      expected: node2.nodeType,
      actual: node1.nodeType
    });
    return differences;
  }
  
  // Compare tag names for elements
  if (node1.nodeType === 1) { // ELEMENT_NODE
    if (node1.tagName !== node2.tagName) {
      differences.push({
        type: 'tag_name',
        path: getNodePath(node1),
        expected: node2.tagName,
        actual: node1.tagName
      });
    }
    
    // Compare attributes (ignoring specified ones)
    const attrs1 = Array.from(node1.attributes || [])
      .filter(attr => !ignoreAttributes.includes(attr.name));
    const attrs2 = Array.from(node2.attributes || [])
      .filter(attr => !ignoreAttributes.includes(attr.name));
    
    if (attrs1.length !== attrs2.length) {
      differences.push({
        type: 'attribute_count',
        path: getNodePath(node1),
        expected: attrs2.length,
        actual: attrs1.length
      });
    }
  }
  
  // Compare text content for text nodes
  if (node1.nodeType === 3) { // TEXT_NODE
    if (node1.textContent !== node2.textContent) {
      differences.push({
        type: 'text_content',
        path: getNodePath(node1),
        expected: node2.textContent,
        actual: node1.textContent
      });
    }
  }
  
  // Compare children
  if (node1.childNodes.length !== node2.childNodes.length) {
    differences.push({
      type: 'child_count',
      path: getNodePath(node1),
      expected: node2.childNodes.length,
      actual: node1.childNodes.length
    });
  }
  
  const maxChildren = Math.max(node1.childNodes.length, node2.childNodes.length);
  for (let i = 0; i < maxChildren; i++) {
    if (node1.childNodes[i] && node2.childNodes[i]) {
      differences.push(...findDifferences(node1.childNodes[i], node2.childNodes[i], ignoreAttributes));
    }
  }
  
  return differences;
}

function getNodePath(node) {
  const path = [];
  let current = node;
  
  while (current && current.parentNode) {
    const parent = current.parentNode;
    const index = Array.from(parent.childNodes).indexOf(current);
    path.unshift(`${current.nodeName}[${index}]`);
    current = parent;
  }
  
  return path.join(' > ');
}
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (during development)
npm test -- --watch

# Run specific test file
npm test tests/unit/core/sanitizer.test.js

# Run with coverage
npm run test:coverage

# Run with UI (interactive)
npm run test:ui
```

### Test Corpus Requirements

**Collect 50+ Real-World Word-to-HTML Samples:**

1. **Short documents** (< 1 KB): 10 samples
   - Simple paragraphs with formatting
   - Basic lists and headings
   - Minimal inline styles

2. **Medium documents** (1-10 KB): 25 samples
   - Blog posts with images (to test removal)
   - Articles with tables
   - Mixed formatting (bold, italic, links, lists)

3. **Large documents** (10-100 KB): 10 samples
   - Long-form content
   - Complex nested structures
   - Heavy inline styling from Word

4. **Edge cases** (5 samples):
   - Malformed HTML
   - Deeply nested elements
   - Unusual character entities
   - Mixed content types

5. **Shopify-specific** (5 samples):
   - Content with "Key Takeaways" sections
   - Multiple consecutive lists
   - External and internal links mixed

**Fixture Naming Convention:**
- `sample-[XX]-input.html` - Raw Word-to-HTML
- `sample-[XX]-expected-regular.html` - Expected Regular mode output
- `sample-[XX]-expected-shopify-blogs.html` - Expected Shopify Blogs output
- `sample-[XX]-expected-shoppables.html` - Expected Shoppables output
- `sample-[XX]-description.txt` - Description of test case (optional)

### Manual Testing Checklist

Before each release, manually test:

- [ ] Copy/paste large document (> 5 MB) - verify performance warning
- [ ] Copy/paste malformed HTML - verify graceful handling
- [ ] Toggle between all three modes - verify instant re-processing
- [ ] Enable/disable each optional feature - verify UI updates
- [ ] Preview toggle (code/rendered) - verify both views work
- [ ] Copy to clipboard - verify success message
- [ ] Download HTML file - verify file downloads correctly
- [ ] Test in Chrome, Firefox, Safari, Edge (latest versions)
- [ ] Test keyboard navigation (Tab, Enter, Space)
- [ ] Test with screen reader (NVDA/VoiceOver) - verify announcements

### Pre-Dev Artifacts Included
- Design tokens: `assets/tokens/design-tokens.json` (colors, typography, spacing, shadows)
- Starter fixtures: `tests/fixtures/`
  - `sample-01-input.html`
  - `sample-01-expected-regular.html`
  - `sample-01-expected-shopify-blogs.html`
  - `sample-01-expected-shoppables.html`

## Performance
- Target: typical docs process < 100ms (post-debounce)
- Large docs < 500ms
- Optimize DOM traversals; batch mutations
- P1: Web Worker pathway for very large inputs

## Accessibility
- Keyboard accessible controls
- Visible focus states
- `aria-live` for copy/processing status
- Respect `prefers-reduced-motion`

## Security & Privacy
- Strict sanitizer (allowlist)
- Link attribute hardening (`noopener noreferrer`)
- CSP recommended in `<meta>`:
  - `default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'`
- 100% client-side; no content stored or sent

## Deployment (GitHub Pages)
1) Create repo and push
2) Enable Pages (Settings → Pages) on `main` or `gh-pages`
3) Ensure `index.html` at repository root
4) Verify with the published URL

## Suggested Next Steps (After MVP)
- P1: JavaScript library extraction (`js/library/`)
- P1: Worker path + “Disable instant processing” toggle
- P1: Before/After comparison and basic stats
- P2: Customizable style removal, feedback button, analytics


