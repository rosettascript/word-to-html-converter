# Edge Cases for Design

> **Part of:** [User Experience & Design](../README.md) | **Previous:** [Interaction Principles](06e-interaction-principles.md) | **Next:** [Technical Requirements](../07-technical-requirements/)
> 
> **Reference:** See [Key Screens/States to Design](06b-key-screens-states.md) for screen-specific edge cases.

---

# Edge Cases for Design

**Content Edge Cases:**
- **Very large documents (> 50 pages):** Show performance warning, consider chunking for processing
- **Malformed HTML:** Show validation errors with specific line numbers, offer "Try anyway" option
- **Empty input:** Show helpful message, no processing triggered
- **Only whitespace:** Detect and warn user, or auto-trim before processing
- **No inline styles present:** Show message "No inline styles found, HTML is already clean"
- **Nested spans with conflicting styles:** Remove all, preserve content
- **Tables with inline styles:** Preserve table structure, remove cell-level styles
- **Images in pasted HTML:** All `<img>` elements are automatically removed on paste, before any conversion processing. No images will appear in the cleaned output.
- **Key Takeaways section not detected (Shopify Blogs mode):** Show warning, process with regular rules
- **No lists to combine (Shopify modes):** Skip list combination step gracefully
- **No internal links found (optional feature):** Skip domain removal step gracefully

**Technical Edge Cases:**
- **Browser compatibility:** Detect unsupported browsers, show fallback message
- **Browser memory limits:** Very large HTML may exceed browser memory; show warning for content > 5MB
- **Concurrent processing:** If user submits multiple times, queue or show "Already processing" message
- **Special characters/encoding:** Handle UTF-8, HTML entities correctly
- **Script tags or dangerous content:** Sanitize or warn user (security consideration)

**User Behavior Edge Cases:**
- **User types very fast:** Debouncing prevents excessive processing, only process after pause
- **User changes output mode while content is pasted:** Re-process immediately with new mode
- **User toggles optional features:** Re-process immediately with new settings
- **User toggles preview view:** Preview updates automatically to show rendered HTML
- **User switches between code and preview view:** Smooth transition, no data loss
- **Preview contains external resources (images, stylesheets):** Handle gracefully (may not load in sandboxed iframe)
- **User closes tab during processing:** No state saving needed (instant processing, no server)
- **User pastes same content twice:** Process normally (no caching needed for MVP)
- **User wants to undo/redo:** Not applicable for MVP (real-time processing)
- **User needs to process same content multiple times:** Results update automatically as settings change

---

---

**See also:**
- [Key Screens/States to Design](06b-key-screens-states.md) - Screen-specific edge cases
- [Technical Requirements](../07-technical-requirements/07e-technical-constraints.md) - Technical edge cases
