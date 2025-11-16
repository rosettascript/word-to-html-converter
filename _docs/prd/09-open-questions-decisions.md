# Open Questions & Decisions Needed

> **Part of:** [Main PRD Index](README.md) | **Previous:** [Risks & Mitigation](08-dependencies-and-risks/08b-risks-and-mitigation.md) | **Next:** [Launch Plan & Rollout Strategy](implementation/)
> 
> **Reference:** See "Open Questions & Decisions Needed" section in [The Complete Guide to Writing Product Requirements Documents (PRDs).md](../The%20Complete%20Guide%20to%20Writing%20Product%20Requirements%20Documents%20(PRDs).md#11-open-questions--decisions-needed) for template format.

---

# Open Questions & Decisions Needed

## Question 1: Client-Side vs Server-Side Processing
**Question:** Should HTML cleaning happen entirely in the browser (client-side) or on a server?

**Options:**
- **A. Client-Side Only:** Process HTML entirely in browser using JavaScript, no server needed
  - Pros: No server costs, instant processing, privacy (no data sent to server), scalable, works on GitHub Pages
  - Cons: Limited by browser capabilities, may struggle with very large files
- **B. Server-Side Only:** All processing happens on server via API
  - Pros: More control, can handle larger files, consistent performance
  - Cons: Server costs, latency, privacy concerns, scaling challenges, requires server infrastructure
- **C. Hybrid:** Client-side for small files, server-side for large files or API users
  - Pros: Best of both worlds, flexible
  - Cons: More complex implementation, need both client and server code

**Recommendation:** Option A (Client-Side Only) - DECIDED. Vanilla JavaScript running entirely client-side, deployed on GitHub Pages. No server infrastructure needed.

**Decision Maker:** Engineering Lead + Product Manager

**Deadline:** Before development starts

**Status:** Resolved → Option A (Client-Side Only)

---

## Question 2: Technology Stack
**Question:** What technology stack should we use for the web application?

**Options:**
- **A. Vanilla JavaScript:** Pure JS with HTML/CSS, no framework
  - Pros: Lightweight, fast, no dependencies, easy to deploy on GitHub Pages
  - Cons: More manual work, less structure for complex features
- **B. React/Vue/Svelte:** Modern framework
  - Pros: Component-based, easier to maintain, better developer experience
  - Cons: Larger bundle size, more setup, framework learning curve, build process needed
- **C. Static Site Generator:** Next.js, Nuxt, or similar
  - Pros: SEO-friendly, fast loading, modern tooling
  - Cons: Overkill for simple tool, more complex deployment, requires build step

**Recommendation:** Option A (Vanilla JavaScript) - DECIDED. Pure HTML, CSS, and JavaScript for simplicity and GitHub Pages compatibility.

**Decision Maker:** Engineering Lead

**Deadline:** Before development starts

**Status:** Resolved → Option A (Vanilla JavaScript)

---

## Question 3: JavaScript Library Availability Timeline
**Question:** Should JavaScript library for integration be included in MVP or deferred to P1?

**Options:**
- **A. Include in MVP:** Build library from the start
  - Pros: Serves developer persona immediately, enables integrations, easy to extract from main code
  - Cons: More development time, need to structure code as reusable library
- **B. Defer to P1:** Focus on web UI first, extract library later
  - Pros: Faster MVP launch, validate core functionality first
  - Cons: Delays developer use case, may need to refactor code structure

**Recommendation:** Option B (Defer to P1) - validate core functionality with web UI first, then extract JavaScript library based on user demand. Since it's vanilla JS, extraction should be straightforward.

**Decision Maker:** Product Manager + Engineering Lead

**Deadline:** Before Phase 1 (Alpha) starts

**Status:** Resolved → Option B (Defer to P1)

---

## Question 4: Content Size Limits
**Question:** What should be the practical limit for pasted HTML content?

**Options:**
- **A. 5MB:** Conservative, ensures fast processing and avoids browser memory issues
- **B. 10MB:** Balanced, handles most documents but may cause performance issues on some devices
- **C. No hard limit:** Process any size, but warn users about potential browser performance issues
- **D. Dynamic:** Detect browser capabilities and adjust limit accordingly

**Recommendation:** Option C (No hard limit with warnings) - Since it's paste-only and client-side, let users paste what they want but show clear warnings for content > 5MB about potential browser performance issues. Browser will naturally limit based on available memory.

**Decision Maker:** Engineering Lead + Product Manager

**Deadline:** Before Phase 1 (Alpha) starts

**Status:** Resolved → Option C (No hard limit with warnings)

---

## Question 5: Handling of Special HTML Elements
**Question:** How should we handle tables, images, and other complex elements with inline styles?

**Options:**
- **A. Remove all inline styles:** Consistent approach, simple implementation
- **B. Preserve certain styles:** Keep styles that might be necessary (e.g., table borders, image dimensions)
- **C. Convert to classes:** Transform inline styles to CSS classes (complex, but more flexible)

**Recommendation:** Option A for MVP - remove all inline styles consistently across all output modes. Users can add styles back via CSS if needed. Consider Option B for P2 if users request it. Note: Output modes may have mode-specific rules (e.g., Shopify modes may have additional formatting requirements).

**Clarification (DECIDED):** Images are never included in the cleaned output. An optional UI toggle can display original images in the input/rendered preview only (default: off). No `<img>` elements appear in the output for any mode. This avoids broken links, large base64 payloads, and platform incompatibilities while still allowing visual verification in preview.

**Decision Maker:** Product Manager + Engineering Lead

**Deadline:** Before development starts

**Status:** Resolved → Option A (Remove all inline styles)

---

## Question 7: Output Modes in MVP vs P1
**Question:** Should all three output modes (Regular, Shopify Blogs, Shopify Shoppables) be included in MVP or should Shopify modes be deferred to P1?

**Options:**
- **A. All modes in MVP:** Include Regular, Shopify Blogs, and Shopify Shoppables from launch
  - Pros: Serves all user personas immediately, demonstrates full value proposition
  - Cons: More development time, more testing required, more complexity
- **B. Regular mode in MVP, Shopify modes in P1:** Launch with Regular mode only, add Shopify modes later
  - Pros: Faster MVP launch, validate core functionality first, simpler initial implementation
  - Cons: Delays Shopify user use cases, may need to refactor for mode system later

**Recommendation:** Option A (All modes in MVP) - Shopify users are a key target audience, and the mode system should be built from the start. The complexity is manageable and the value is significant.

**Decision Maker:** Product Manager + Engineering Lead

**Deadline:** Before Phase 1 (Alpha) starts

**Status:** Resolved → Option A (All modes in MVP)

---

## Question 8: Debounce Delay for Instant Conversion
**Question:** What should be the debounce delay for instant conversion?

**Options:**
- **A. 300ms:** Fast response, may process more frequently
- **B. 500ms:** Balanced, good performance and user experience
- **C. 750ms:** Conservative, less processing but may feel slower
- **D. Adaptive:** Adjust based on content size (shorter for small, longer for large)

**Recommendation:** Option B (500ms) - Good balance between responsiveness and performance. Consider Option D for P2 if performance issues arise with large content.

**Decision Maker:** Engineering Lead

**Deadline:** Before Phase 1 (Alpha) starts

**Status:** Resolved → Option B (500ms debounce)

---

## Question 9: Key Takeaways Section Detection
**Question:** How should we detect "Key Takeaways" sections for Shopify Blogs mode?

**Options:**
- **A. Heading text matching:** Look for headings containing "Key Takeaways", "Key Points", etc.
  - Pros: Simple, works for most cases
  - Cons: May miss variations or misspelled headings
- **B. Section structure:** Detect sections with specific structure (heading + list pattern)
  - Pros: More robust, catches variations
  - Cons: More complex, may have false positives
- **C. User selection:** Allow user to manually mark Key Takeaways section
  - Pros: Most accurate, user control
  - Cons: Extra step for user, less automated

**Recommendation:** Option A (Heading text matching) for MVP - simple and works for most cases. Add Option B as fallback if heading not found. Consider Option C for P2 if users request it.

**Implementation Details:**
- Primary: Match headings whose normalized text equals "Key Takeaways" (case-insensitive, whitespace normalized)
- Process ALL occurrences: Every heading matching "Key Takeaways" is processed, not just the first one
- Heading level: Works for h1-h6 (level doesn't matter)
- Parent container: Works whether nested or not (parent container doesn't matter)
- Heading Normalization: If a "Key Takeaways" heading doesn't end with a colon (":"), automatically add one to ensure consistent formatting
- Fallback: Detect section structure (heading followed by list) if no matching heading found
- Scope: Apply Shopify Blogs formatting rules (remove `<em>` tags, normalize heading format) to all detected Key Takeaways sections

**Decision Maker:** Product Manager + Engineering Lead

**Deadline:** Before Phase 1 (Alpha) starts

**Status:** Resolved → Option A (Heading text matching) with Option B as fallback

---

## Question 10: External Link Attribute Policy
**Question:** Should `target="_blank"` and `rel` attributes be applied to all links or only external ones?

**Options:**
- **A. All links:** Apply `target="_blank"` and `rel` to every `<a>`
  - Pros: Simple
  - Cons: Breaks internal navigation expectations; accessibility concerns
- **B. External links only:** Apply `target="_blank"` and `rel="noopener noreferrer"` to external URLs; keep internal links relative with no `target`
  - Pros: Safer, preserves expected behavior
  - Cons: Requires URL classification

**Recommendation:** Option B (External links only) - DECIDED. Internal links are normalized to relative paths; external links get `target="_blank"` and `rel="noopener noreferrer"`.

**Decision Maker:** Engineering Lead + Product Manager

**Status:** Resolved → Option B (External-only)

---

## Question 11: Large-Document Processing UX
**Question:** How should we handle very large inputs to avoid main-thread jank?

**Options:**
- **A. Debounce only (500ms)**
- **B. Add "Disable instant processing" toggle for manual re-run (P1)**
- **C. Web Worker fallback for large inputs (P1)**

**Recommendation:** B + C for P1. Keep 500ms debounce by default; add a UI toggle to disable instant processing, and provide an optional Web Worker pathway for large inputs.

**Decision Maker:** Engineering Lead

**Status:** Open → Target P1

---

## Question 6: Monetization Strategy
**Question:** Should this be a free tool, or should we plan for monetization?

**Options:**
- **A. Free Forever:** No monetization, open source or free service
- **B. Freemium:** Free basic version, paid for advanced features (API, batch processing, etc.)
- **C. Paid from Start:** Charge for usage from launch

**Recommendation:** Option A (Free Forever) for MVP - focus on adoption and value creation first. Revisit monetization in P2/P3 if tool gains traction and requires infrastructure costs.

**Decision Maker:** Product Lead + Business Stakeholders

**Deadline:** Before Phase 3 (Open Beta)

**Status:** Open


---

**See also:**
- [Scope & Requirements](../05-scope-and-requirements.md) - Feature decisions
- [Launch Plan & Rollout Strategy](../implementation/) - Implementation timeline
