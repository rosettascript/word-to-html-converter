# Platform Considerations

> **Part of:** [Technical Requirements](../README.md) | **Previous:** [Performance Requirements](07c-performance-requirements.md) | **Next:** [Technical Constraints](07e-technical-constraints.md)

---

# Platform Considerations

**Supported Platforms:**

**Web Application (Primary):**
- Modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile browsers: iOS Safari 14+, Chrome Mobile 90+
- Responsive design: Desktop, tablet, mobile

**JavaScript Library (P1):**
- Vanilla JavaScript, no dependencies
- Can be included via script tag or imported as module
- Works in any environment that supports ES6+ JavaScript

**Not Supported (MVP):**
- CLI tool (consider for P2)
- Desktop application (consider for P2)
- Browser extensions (consider for P2)
- Server-side API endpoints (fully client-side)

**Deployment:**
- Web app: GitHub Pages (static hosting)
- JavaScript library: Included in repository, can be used standalone
- CDN: Optional (can be served via jsDelivr, unpkg, etc. for library)


---

**See also:**
- [JavaScript Library & Integration](07b-javascript-library-integration.md) - Library support
- [Technical Constraints](07e-technical-constraints.md) - Browser compatibility
