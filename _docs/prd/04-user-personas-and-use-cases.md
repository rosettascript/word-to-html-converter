# User Personas & Use Cases

> **Part of:** [Main PRD Index](../README.md) | **Previous:** [Goals & Success Metrics](03-goals-and-success-metrics.md) | **Next:** [Scope & Requirements](05-scope-and-requirements.md)
> 
> **Reference:** See "User Personas & Use Cases" section in [The Complete Guide to Writing Product Requirements Documents (PRDs).md](../The%20Complete%20Guide%20to%20Writing%20Product%20Requirements%20Documents%20(PRDs).md#5-user-personas--use-cases) for best practices and templates.

---

## User Personas

### Persona 1: Sarah, the Content Writer
- **Demographics:** 28, works remotely, moderate tech savviness
- **Goals:** Publish blog posts quickly without breaking website styling, maintain consistent formatting across platforms
- **Pain Points:** Spends 20-30 minutes manually cleaning HTML after Word conversion, sometimes breaks formatting accidentally, frustrated by inconsistent results
- **Context:** Writes 3-5 blog posts per week for Shopify store, uses Google Docs/Word for drafting
- **Frequency:** Daily
- **Quote:** "I just want to paste my content and have it work. I shouldn't need to know HTML to publish a blog post."

### Persona 2: Marcus, the Frontend Developer
- **Demographics:** 32, works in agency, high tech savviness
- **Goals:** Receive clean HTML from content team, minimize time spent fixing markup, ensure semantic structure
- **Pain Points:** Receives HTML with inline styles that override CSS, has to manually clean 10-15 documents per week, wastes time on repetitive tasks
- **Context:** Integrates content into client websites (Shopify, custom CMS), works with multiple content writers
- **Frequency:** Weekly (receives multiple documents)
- **Quote:** "Every time I get a Word-to-HTML conversion, I spend 15 minutes stripping out inline styles. This should be automated."

---

## Use Cases

### Use Case 1: Converting a Blog Post for Shopify

**Actor:** Sarah (Content Writer)

**Precondition:** Sarah has completed a blog post in Google Docs/Word and needs to publish it on Shopify

**Trigger:** Sarah copies content from Word and needs clean HTML for Shopify blog editor

**Steps:**
1. Sarah opens the Word to HTML converter tool
2. Selects "Shopify Blogs" output mode from the mode selector
3. Pastes the HTML content from Word conversion
4. Tool processes the document instantly as she pastes (no button needed)
5. Tool displays preview of cleaned HTML with Shopify Blogs formatting applied
6. Sarah optionally enables/disables advanced features (e.g., "Put <strong> in headers" is enabled by default in Shopify Blogs mode)
7. Sarah toggles preview icon to see rendered HTML (Word version) to verify how it will look
8. Sarah toggles back to code view to see the HTML code
9. Sarah reviews the output to ensure structure is preserved
10. Sarah copies the cleaned HTML
11. Pastes into Shopify blog editor
12. Content displays correctly with platform styling
13. Optional: If "Display images in input preview" is enabled, original images are shown in the rendered preview only; the cleaned output never includes images

**Success Criteria:** 
- All inline styles removed
- Shopify Blogs formatting rules applied (removed <em> in Key Takeaways, combined adjacent lists only, anchor tags updated for external links)
- All headings, lists, and paragraphs preserved
- Content displays correctly in Shopify without manual edits
- Process completes instantly (< 1 second)

**Failure Scenarios:**
- Tool removes semantic structure (e.g., converts headings to paragraphs) → Show error message, allow manual override
- Large document (> 50 pages) times out → Show progress indicator, process in chunks
- Malformed HTML in input → Show validation error with specific line numbers

---

### Use Case 2: Developer Integration via JavaScript Library

**Actor:** Marcus (Frontend Developer)

**Precondition:** Marcus needs to integrate HTML cleaning into a custom CMS or workflow

**Trigger:** Marcus wants to automate HTML cleaning in his development workflow

**Steps:**
1. Marcus includes the converter JavaScript library in his project
2. Calls the cleaning function with HTML string, output mode, and optional features
3. Function processes HTML client-side instantly and returns cleaned HTML
4. Marcus integrates cleaned HTML into his application
5. Content displays correctly with platform styling

**Success Criteria:**
- Processing completes instantly (client-side, no network latency, < 100ms for typical documents)
- Returns cleaned HTML string synchronously
- Supports all output modes (Regular, Shopify Blogs, Shopify Shoppables)
- No external dependencies required
- Works in any modern browser environment

**Failure Scenarios:**
- Malformed HTML in input → Function returns error with validation details
- Very large HTML (> browser memory limits) → Show warning, suggest chunking
- Browser doesn't support required APIs → Graceful degradation with error message

---

### Use Case 3: Using Shopify Blogs Mode with Advanced Features

**Actor:** Sarah (Content Writer)

**Precondition:** Sarah has a blog post with Key Takeaways section and needs Shopify-specific formatting

**Trigger:** Sarah needs to format HTML specifically for Shopify Blogs with all advanced features enabled

**Steps:**
1. Sarah opens the Word to HTML converter tool
2. Selects "Shopify Blogs" output mode
3. Pastes HTML content containing Key Takeaways section
4. Tool processes instantly and applies Shopify Blogs formatting:
   - Normalizes "Key Takeaways" heading (adds colon ":" if missing)
   - Removes `<em>` tags in Key Takeaways section
   - Combines adjacent lists into single `<ul>`/`<ol>` when separated only by whitespace/empty paragraphs
   - Adds `rel="noopener noreferrer"` and `target="_blank"` to external links only
5. Sarah enables optional checkboxes:
   - ✅ Put `<strong>` tags in headers (enabled by default in Shopify Blogs)
   - ✅ Remove domain in internal links
   - ✅ Normalize whitespace
6. Tool re-processes with advanced features applied
7. Sarah reviews the output
8. Sarah copies the cleaned HTML
9. Pastes into Shopify blog editor
10. Content displays perfectly formatted for Shopify Blogs

**Success Criteria:**
- Key Takeaways heading is normalized (ends with colon ":" if it didn't already)
- Key Takeaways section has `<em>` tags removed
- All lists are combined into single list elements
- All anchor tags have `rel="noopener" target="_blank"`
- Headers contain `<strong>` tags
- Internal links are relative paths only
- Spacing is normalized
- Process completes instantly

**Failure Scenarios:**
- Key Takeaways section not detected → Show warning, process with regular rules
- No lists to combine → Skip list combination step
- No internal links found → Skip domain removal step

---

### Use Case 4: Using Shopify Shoppables Mode

**Actor:** Marcus (Frontend Developer)

**Precondition:** Marcus needs to format product descriptions for Shopify Shoppables

**Trigger:** Marcus needs clean, compact HTML for Shopify Shoppables format

**Steps:**
1. Marcus opens the Word to HTML converter tool
2. Selects "Shopify Shoppables" output mode
3. Pastes HTML content with product descriptions
4. Tool processes instantly and applies Shopify Shoppables formatting:
   - Performs safe whitespace minification (collapses insignificant whitespace while preserving required spaces)
   - Combines multiple lists into single `<ul>`/`<ol>`
5. Marcus enables optional checkboxes:
   - ✅ Put `<strong>` tags in headers (disabled by default in Regular, may be enabled per preference in this mode)
   - ✅ Remove domain in internal links
6. Tool re-processes with advanced features applied
7. Marcus reviews the compact output
8. Marcus copies the cleaned HTML
9. Pastes into Shopify Shoppables editor
10. Content displays correctly in compact format

**Success Criteria:**
- Whitespace safely minified (no unnecessary whitespace; semantics preserved)
- All lists are combined into single list elements
- Headers contain `<strong>` tags
- Internal links are relative paths only
- HTML is compact and optimized for Shoppables
- Process completes instantly

**Failure Scenarios:**
- Content has no lists → Skip list combination step
- No internal links found → Skip domain removal step
- Very large content → Show performance warning

---

**See also:**
- [Scope & Requirements](05-scope-and-requirements.md) - User stories based on these personas
- [User Experience & Design](../06-user-experience-design/) - Design based on these use cases
- [Technical Requirements](../07-technical-requirements/) - Technical implementation for these workflows

