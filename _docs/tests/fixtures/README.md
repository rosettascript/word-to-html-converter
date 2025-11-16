# Test Fixtures

Starter corpus for end-to-end tests. Each sample includes:
- `*-input.html` (raw Word-to-HTML content)
- `*-expected-regular.html`
- `*-expected-shopify-blogs.html`
- `*-expected-shoppables.html`

Notes:
- Outputs reflect current PRD policies:
  - No images in output (preview-only toggle may display originals)
  - Regular: base cleaning; no external link attribute changes by default
  - Shopify Blogs: combine adjacent lists; remove `<em>` in Key Takeaways; external links get `target="_blank"` + `rel="noopener noreferrer"`; preserve single empty paragraph `<p>&nbsp;</p>` spacers where present
  - Shoppables: safe whitespace minification; combine lists; remove empty paragraph spacers
- Internal links remain absolute unless "Remove domain in internal links" is enabled (optional feature).
- Whitespace in `*-expected-shoppables.html` is intentionally minimized but preserves semantics.

Use:
- Load `*-input.html`, run processor per mode, compare DOM against expected.

