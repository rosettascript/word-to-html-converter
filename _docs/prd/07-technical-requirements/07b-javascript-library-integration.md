# JavaScript Library & Integration

> **Part of:** [Technical Requirements](../README.md) | **Previous:** [Data Requirements](07a-data-requirements.md) | **Next:** [Performance Requirements](07c-performance-requirements.md)

---

# JavaScript Library & Integration

**Library Usage (P1):**
```javascript
// Include library
<script src="word-to-html-cleaner.js"></script>

// Use function
const result = cleanWordHTML(htmlString, {
  outputMode: 'regular', // 'regular' | 'shopify-blogs' | 'shopify-shoppables'
  options: {
    putStrongInHeaders: true,  // default: true
    removeDomainInLinks: false, // default: false
    removeSpacing: false        // default: false (Shopify Blogs only)
  }
});
// Returns: { cleanedHtml: "...", metadata: {...} }
```

**Third-Party Dependencies:**
- None required (vanilla JavaScript, uses browser-native DOMParser)
- No external libraries or frameworks

**External APIs:**
- None required (fully client-side, standalone tool)


---

**See also:**
- [Data Requirements](07a-data-requirements.md) - Processing logic
- [Platform Considerations](07d-platform-considerations.md) - Deployment
