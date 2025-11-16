# Technical Constraints

> **Part of:** [Technical Requirements](../README.md) | **Previous:** [Platform Considerations](07d-platform-considerations.md) | **Next:** [Dependencies & Risks](../08-dependencies-and-risks/)

---

# Technical Constraints

**Known Limitations:**
- **Browser memory limits:** Very large HTML (> 5-10MB) may cause browser performance issues
  - Mitigation: Show warning for very large content, suggest chunking if needed

- **HTML parsing edge cases:** Some malformed HTML may not parse correctly with DOMParser
  - Mitigation: Use DOMParser with error handling, validate input, provide fallback

- **Complex nested structures:** Deeply nested spans with conflicting styles
  - Mitigation: Recursive DOM traversal, remove all nested styles, preserve content

- **Platform-specific HTML:** Some CMS platforms have specific HTML requirements
  - Mitigation: Document known issues, consider platform-specific modes (P2)

**Security Considerations:**
- **XSS prevention:** Sanitize input to prevent script injection
  - Action: Use a strict allowlist sanitizer:
    - Allowed tags (initial MVP): `a, p, ul, ol, li, h1-h6, em, strong, sup, sub, code, blockquote, table, thead, tbody, tr, th, td, br`
    - Allowed attributes: `href` on `a` (validated, http/https/mailto only), `colspan/rowspan` on table cells, `scope` on headers, `rel/target` on external links
    - Strip all event handlers (e.g., `on*`), `style`, `class`, `id`, `data-*`
  - Normalize links:
    - Internal links → relative paths (no protocol/domain, no `target`)
    - External links → add `rel="noopener noreferrer"` and `target="_blank"`

- **Data privacy:** No storage of user content (fully client-side, no server)
  - Action: All processing happens in browser, no data sent to server, no logging

- **Content Security Policy:** Tool runs entirely client-side, but CSP is recommended
  - Action: Recommend `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'">`
  - Rationale: Mitigates XSS if sanitizer misses edge cases; supports inline styles for minimal CSS if needed

**Browser Compatibility:**
- Modern JavaScript features (ES6+) required
- Fallback: Provide polyfills or transpile for older browsers (if needed)
- Feature detection: Check for required APIs (DOMParser, Clipboard API)
- DOMParser: Supported in all modern browsers (Chrome 1+, Firefox 1+, Safari 3.2+, Edge 12+)

**Performance for Large Inputs:**
- Default 500ms debounce for instant processing
- P1: "Disable instant processing" toggle to switch to manual re-run
- P1: Optional Web Worker processing path for large inputs to avoid main-thread jank

**Images Handling:**
- Images may be displayed in the input/rendered preview if the "Display images in input preview" toggle is enabled (default: off)
- No `<img>` is ever emitted in the cleaned output; `src` attributes are ignored during output generation

**Accessibility Requirements:**
- **WCAG 2.1 Level AA compliance** - Meet minimum accessibility standards
- **Keyboard Navigation:** All interactive elements must be keyboard accessible (Tab, Enter, Space)
- **Screen Reader Support:** Proper ARIA labels for all form controls, buttons, and status messages
- **Focus Management:** Visible focus indicators on all interactive elements
- **Color Contrast:** Text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- **Form Labels:** All inputs have associated labels (visible or via `aria-label`)
- **Error Messages:** Clear, descriptive error messages announced to screen readers
- **Status Updates:** Use `aria-live` regions for dynamic content updates (conversion status, warnings)
- **Alternative Text:** Provide text alternatives for any icons or visual indicators
- **Testing:** Test with screen readers (NVDA, JAWS, VoiceOver) during Alpha phase

---

## Error Handling & User Messages

**Error Catalog:**

The tool should handle errors gracefully with user-friendly messages. Avoid technical jargon and provide actionable guidance.

| Error Scenario | User Message | Technical Action |
|---------------|--------------|------------------|
| Empty input | "Please paste HTML content to convert." | Display placeholder text; disable copy/download buttons |
| Invalid HTML (parse failure) | "Unable to parse HTML. Please check your input for errors." | Log parse error to console; show fallback plain text view |
| Processing timeout (> 5s) | "Large document detected. Processing may take longer than usual." | Show loading indicator; consider Web Worker fallback (P1) |
| Browser memory exceeded | "Content is too large for your browser. Try converting smaller sections." | Catch out-of-memory error; suggest chunking document |
| Clipboard API unavailable | "Copy to clipboard not supported. Please select and copy manually." | Disable copy button; show manual copy instructions |
| Download API failure | "Unable to download file. Please copy the HTML manually." | Log error; suggest manual copy as fallback |
| Malformed HTML structures | (No error shown; process what's possible) | Log warning to console; preserve as much structure as possible |
| Unsupported browser | "Your browser doesn't support required features. Please use a modern browser (Chrome, Firefox, Safari, Edge)." | Feature detection on load; show upgrade notice |

**Status Messages:**

| Status | User Message | Visual Indicator |
|--------|--------------|------------------|
| Processing (during debounce) | "Processing..." | Subtle pulse animation on output area |
| Processing complete | "HTML cleaned successfully" | Brief success indicator (fade out after 2s) |
| Warning: Large content | "⚠️ Large document (> 5MB) may take longer to process" | Warning banner above input area |
| Warning: Complex structure | "⚠️ Complex HTML detected. Results may vary." | Info banner (optional, P2) |
| Copy success | "✓ Copied to clipboard" | Toast notification (2s duration) |
| Download success | "✓ Downloaded cleaned-html.html" | Toast notification (2s duration) |

**Error Message Guidelines:**
- Never show raw error stack traces to users
- Use plain language, avoid technical terms (e.g., "DOMParser failed")
- Provide actionable next steps when possible
- Use `aria-live="polite"` for status updates, `aria-live="assertive"` for errors
- Log detailed technical errors to browser console for debugging

---

## Content Security Policy (CSP) Implementation

**Recommended CSP Header:**

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self';
  connect-src 'self';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  object-src 'none';
">
```

**CSP Directive Rationale:**

| Directive | Value | Reason |
|-----------|-------|--------|
| `default-src 'self'` | Same origin only | Restrict all resources to same origin by default |
| `script-src 'self'` | Same origin only | Prevent inline scripts and external script injection |
| `style-src 'self' 'unsafe-inline'` | Same origin + inline | Allow inline styles for design system; consider moving to external CSS (P2) |
| `img-src 'self' data: blob:` | Same origin, data URIs, blobs | Support base64 images in preview (if needed) |
| `font-src 'self'` | Same origin only | Restrict fonts to same origin (or add CDN if using web fonts) |
| `connect-src 'self'` | Same origin only | Prevent external API calls (not needed for this tool) |
| `base-uri 'self'` | Same origin only | Prevent `<base>` tag injection attacks |
| `form-action 'self'` | Same origin only | Prevent form submission to external domains |
| `frame-ancestors 'none'` | Disallow embedding | Prevent clickjacking attacks |
| `object-src 'none'` | Disallow plugins | Prevent Flash, Java, and other plugin execution |

**Implementation Notes:**
- Add CSP meta tag in `<head>` of `index.html`
- Test CSP violations in browser console during development
- If using Google Fonts or external CDN, update `font-src` and `style-src` accordingly
- GitHub Pages supports CSP meta tags (not HTTP headers)

**CSP Violation Handling:**
- Monitor browser console for CSP violations during development
- Do not add external resources without updating CSP
- Use `report-uri` directive (P2) to log violations for monitoring

---

## Preview Rendering Security

**Threat Model:**

The rendered preview displays user-pasted HTML, which could contain malicious content. Even after sanitization, we must ensure:
1. No script execution in preview
2. No external resource loading (tracking pixels, etc.)
3. No CSS-based attacks (e.g., keylogging via CSS)
4. Isolation from main application context

**Preview Sanitization Strategy:**

**Option A: Sandboxed iFrame (Recommended)**

```html
<iframe 
  id="preview-frame"
  sandbox="allow-same-origin"
  srcdoc="<!-- cleaned HTML here -->"
  style="width: 100%; border: 1px solid #e0e0e0; background: white;">
</iframe>
```

**Sandbox Restrictions:**
- `allow-same-origin`: Allow iframe to access its own DOM (needed for `srcdoc`)
- ❌ **NOT** `allow-scripts`: Prevent script execution
- ❌ **NOT** `allow-forms`: Prevent form submission
- ❌ **NOT** `allow-popups`: Prevent window.open() calls
- ❌ **NOT** `allow-top-navigation`: Prevent navigation hijacking

**Sanitization Rules (Before Rendering):**

| Element/Attribute | Action | Reason |
|-------------------|--------|--------|
| `<script>` | Remove entirely | Prevent JavaScript execution |
| `<iframe>`, `<embed>`, `<object>` | Remove entirely | Prevent nested content injection |
| `<link rel="stylesheet">` | Remove entirely | Prevent external CSS loading |
| `<style>` | Remove entirely | Prevent CSS-based attacks (optional: allow for user styles in P2) |
| `<base>` | Remove entirely | Prevent URL hijacking |
| `<form>` | Remove entirely | Prevent form submission |
| `<input>`, `<button>`, `<select>` | Remove entirely | Prevent user interaction (preview is read-only) |
| `on*` attributes (onclick, onerror, etc.) | Remove entirely | Prevent inline event handlers |
| `href="javascript:..."` | Remove or replace with `#` | Prevent JavaScript execution via links |
| `src="data:text/html..."` | Remove or validate | Prevent HTML injection via data URIs |
| `style` attribute | Remove entirely | Already removed by base processor; double-check |

**Option B: Isolated Div with innerHTML (Fallback)**

If iframe sandboxing is not available (older browsers), use an isolated div:

```javascript
// Create isolated container
const previewContainer = document.createElement('div');
previewContainer.className = 'preview-container';

// Re-parse cleaned HTML with DOMParser
const parser = new DOMParser();
const doc = parser.parseFromString(cleanedHTML, 'text/html');

// Strip dangerous elements
const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'style', 'base', 'form'];
dangerousTags.forEach(tag => {
  doc.querySelectorAll(tag).forEach(el => el.remove());
});

// Strip event handlers
doc.querySelectorAll('*').forEach(el => {
  Array.from(el.attributes).forEach(attr => {
    if (attr.name.startsWith('on')) {
      el.removeAttribute(attr.name);
    }
  });
});

// Validate links
doc.querySelectorAll('a[href]').forEach(link => {
  const href = link.getAttribute('href');
  if (href.startsWith('javascript:') || href.startsWith('data:')) {
    link.setAttribute('href', '#');
  }
});

// Render sanitized HTML
previewContainer.innerHTML = doc.body.innerHTML;
```

**Preview Container Isolation:**
- Apply CSS reset to preview container to avoid style leakage
- Use restrictive CSS `pointer-events: none` on preview (P2) to prevent interaction
- Do not use `eval()` or `Function()` anywhere in preview rendering

**Testing Preview Security:**
- Test with XSS payloads (e.g., `<img src=x onerror=alert(1)>`)
- Test with CSS injection attempts
- Test with nested iframe attempts
- Verify CSP blocks any violations

---

**See also:**
- [Data Requirements](07a-data-requirements.md) - Processing implementation
- [Analytics & Feedback Collection](07f-analytics-and-feedback.md) - Privacy and compliance
- [Risks & Mitigation](../08-dependencies-and-risks/08b-risks-and-mitigation.md) - Security risks
