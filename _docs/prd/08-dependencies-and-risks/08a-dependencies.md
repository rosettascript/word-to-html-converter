# Dependencies

> **Part of:** [Dependencies & Risks](../README.md) | **Previous:** [Technical Constraints](../07-technical-requirements/07e-technical-constraints.md) | **Next:** [Risks & Mitigation](08b-risks-and-mitigation.md)

---

# Dependencies

## Internal Dependencies
- **Design Team:** UI/UX design for web interface
  - Status: [TBD]
  - Owner: [TBD]
  - ETA: [TBD]

- **Engineering Team:** Development and deployment
  - Status: [TBD]
  - Owner: [TBD]
  - ETA: [TBD]

- **QA/Testing:** Testing and quality assurance
  - Status: [TBD]
  - Owner: [TBD]
  - ETA: [TBD]

## External Dependencies
- **HTML Parsing:** Browser-native DOMParser API (built into all modern browsers)
  - Status: Available in all target browsers
  - Risk Level: Low (native browser API, no external dependency)

- **Hosting/Infrastructure:** GitHub Pages (static hosting)
  - Status: [TBD - GitHub repository setup]
  - Risk Level: Low (free, reliable, no server management)

- **CDN (Optional):** For JavaScript library distribution (jsDelivr, unpkg)
  - Status: Optional for MVP (library can be self-hosted)
  - Risk Level: Low


---

**See also:**
- [Risks & Mitigation](08b-risks-and-mitigation.md) - Risk assessment
- [Technical Requirements](../07-technical-requirements/) - Technical dependencies
