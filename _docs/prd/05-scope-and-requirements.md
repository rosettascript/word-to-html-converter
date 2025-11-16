# Scope & Requirements

> **Part of:** [Main PRD Index](../README.md) | **Previous:** [User Personas & Use Cases](04-user-personas-and-use-cases.md) | **Next:** [User Experience & Design](../06-user-experience-design/)
> 
> **Reference:** See "Scope & Requirements" section in [The Complete Guide to Writing Product Requirements Documents (PRDs).md](../The%20Complete%20Guide%20to%20Writing%20Product%20Requirements%20Documents%20(PRDs).md#6-scope--requirements) for best practices. This section uses MoSCoW prioritization and user story format.

---

## What We're Building (In Scope)

### Must Have (P0)

**Core Conversion Functionality:**
- As a content writer, I want the cleaned output to exclude all images while preserving text so that platform styling isn't affected by pasted media
- As a user, I want the input area to display pasted HTML as rendered content (preserving semantic structure: h1 as h1, lists as lists, bold/italic formatting) so that I can visually verify the document structure
- As a developer, I want the tool to preserve all semantic HTML structure (headings, lists, paragraphs, links, formatting elements like superscripts, subscripts, emphasis, etc.) so that document hierarchy is maintained
- As a user, I want to see a preview of cleaned HTML before copying so that I can verify the output
- As a user, I want to toggle between HTML code view and rendered preview view (Word version) so that I can see how the HTML will look when displayed
- As a user, I want to copy cleaned HTML to clipboard with one click so that I can quickly paste into my CMS
- As a user, I want the tool to process HTML instantly as I paste or when settings change so that I get immediate feedback
- As a user, I want to select an output mode (Regular, Shopify Blogs, Shopify Shoppables) so that I get platform-specific formatting

**Output Modes:**
- As a user, I want Regular mode to perform basic cleaning (remove inline styles, preserve structure, replace `<br>` with `<p></p>`) so that I get clean, semantic HTML
- As a Shopify user, I want Shopify Blogs mode to format HTML specifically for Shopify blog posts (remove `<br>` and empty `<p>`, remove H1 after Key Takeaways, remove space after FAQ headers, all links open in new tab) so that content works perfectly in Shopify's editor
- As a Shopify user, I want Shopify Shoppables mode to format HTML specifically for Shopify shoppables (replace `<br>` with `<p></p>`, aggressive whitespace minification, all links open in new tab) so that product descriptions are properly formatted

**Style Removal:**
- As a user, I want all inline `style` attributes removed so that platform CSS can control styling
- As a user, I want empty/unnecessary `span` elements removed so that HTML is cleaner
- As a user, I want `font-weight`, `color`, `font-size`, and other text styling attributes removed from inline styles

**SEO Page Structure:**
- As a user, I want to find the tool easily through search engines so that I can discover it when searching for "Word to HTML"
- As a user, I want a clear page structure (Hero, Converter, Features, About, Footer, FAQ) so that I understand the tool's capabilities

**Basic UI:**
- As a user, I want a simple web interface to paste HTML content so that I can use the tool without technical setup
- As a user, I want clear error messages when processing fails so that I understand what went wrong

### Should Have (P1)

**Shopify Blogs Mode Features:**
- As a Shopify user, I want the tool to remove only `<em>` tags in "Key Takeaways" sections (preserving `<strong>` tags) so that formatting matches Shopify's requirements
- As a Shopify user, I want the tool to remove H1 tags and their content after "Key Takeaways" sections so that document hierarchy is clean
- As a Shopify user, I want the tool to remove extra space after FAQ headers (`<h2>`) so that FAQ sections are properly formatted
- As a Shopify user, I want the tool to remove `<br>` tags and empty `<p>` tags completely so that spacing is controlled by platform CSS
- As a Shopify user, I want the tool to combine adjacent `<ul>`/`<ol>` elements separated only by whitespace/empty paragraphs so that lists are properly structured without crossing intervening content
- As a Shopify user, I want the tool to add `rel="noopener noreferrer"` and `target="_blank"` to ALL links (internal and external) so that all links open in new tabs
- As a Shopify user, I want whitespace to be normalized automatically (basic level) so that HTML is clean and consistent

**Shopify Shoppables Mode Features:**
- As a Shopify user, I want the tool to perform safe whitespace minification automatically (collapse insignificant whitespace while preserving required spaces and inline semantics) so that HTML is compact for shoppables format
- As a Shopify user, I want the tool to replace `<br>` tags with empty `<p></p>` tags so that line breaks are semantic
- As a Shopify user, I want the tool to combine multiple `<ul>`/`<ol>` elements into single lists so that lists are properly structured
- As a Shopify user, I want the tool to add `rel="noopener noreferrer"` and `target="_blank"` to ALL links (internal and external) so that all links open in new tabs

**Optional Advanced Features (Checkboxes):**
- As a Shopify user, I want to enable/disable "Put `<strong>` tags in headers" so that I can control header formatting (default: enabled in Shopify Blogs mode, disabled in Shopify Shoppables and hidden in Regular mode)
  - When enabled: Wraps all header content in `<strong>` tags
  - When disabled: Removes existing `<strong>` tags from headers
  - Visibility: Only shown in Shopify Blogs and Shopify Shoppables modes
- As a Shopify user, I want to enable/disable "Convert internal links to relative paths (auto-detects domain)" so that internal links use relative paths
  - Implementation: Automatically detects the most common domain in the document and converts those links to relative paths
  - Preserves: `target="_blank"` and `rel="noopener noreferrer"` attributes in Shopify modes
  - Visibility: Only shown in Shopify Blogs and Shopify Shoppables modes

**Enhanced Features:**
- As a user, I want to toggle between HTML code view and rendered preview view using an icon button so that I can see both the code and how it displays
- As a user, I want the preview toggle to work in all output modes (Regular, Shopify Blogs, Shopify Shoppables) so that I can preview formatted output
- As a user, I want to download cleaned HTML as a file so that I can save it for later use
- As a user, I want to see a before/after comparison so that I can verify what changed
- As a developer, I want a JavaScript library/function so that I can integrate this into my projects

**Advanced Cleaning:**
- As a user, I want the tool to remove leading/trailing whitespace from anchor tags (moving necessary spacing outside the tag) so that links are clean
- As a user, I want the tool to unwrap `<p>` tags inside `<li>` elements so that list structure is proper
- As a user, I want the tool to convert inline bold/italic/superscript/subscript styles to semantic tags (`<strong>`, `<em>`, `<sup>`, `<sub>`) so that formatting is preserved semantically
- As a user, I want the tool to remove unnecessary `&nbsp;` entities so that spacing is cleaner
- As a user, I want the tool to normalize whitespace using safe minification rules so that HTML is properly formatted without altering meaning
- As a user, I want the tool to handle malformed HTML gracefully so that it doesn't crash on edge cases

### Could Have (P2)

**Nice-to-Haves:**
- As a user, I want to customize which styles to remove so that I can preserve certain formatting if needed
- As a user, I want to see statistics about what was removed (e.g., "Removed 45 inline styles") so that I understand the cleaning process
- As a user, I want to save processing history (localStorage) so that I can revisit previous conversions
- As a user, I want advanced output mode customization options so that I can fine-tune formatting rules

### Won't Have (This Version)

**Explicitly Out of Scope:**
- ❌ Converting Word documents directly (focus on cleaning HTML from Word conversions)
  - Reason: Word-to-HTML conversion is a separate problem; we focus on cleaning existing HTML

- ❌ WYSIWYG editor for manual HTML editing
  - Reason: Tool is meant to be automated, not a manual editor

- ❌ CSS extraction and conversion to classes
  - Reason: Focus is on removal, not transformation; consider for v2

- ❌ Image optimization or processing
  - Reason: Images are automatically removed from pasted HTML before conversion processing begins. This simplifies the tool and avoids issues with broken image links, base64-encoded images, or image references that won't work in target platforms.

- ❌ Multi-language support or translation
  - Reason: Not relevant to HTML cleaning functionality

- ❌ User accounts or authentication
  - Reason: MVP should be accessible without signup; consider for v2 if needed

- ❌ Batch processing multiple documents
  - Reason: Focus on single document processing for MVP simplicity; users can process documents one at a time

- ❌ File upload functionality
  - Reason: Paste-only interface simplifies the tool and ensures instant client-side processing

- ❌ Server-side API endpoints
  - Reason: Tool runs entirely client-side on GitHub Pages; JavaScript library available for integration instead

---

**See also:**
- [User Personas & Use Cases](04-user-personas-and-use-cases.md) - Who these requirements serve
- [User Experience & Design](../06-user-experience-design/) - How these requirements are implemented in the UI
- [Technical Requirements](../07-technical-requirements/) - Technical implementation of these features

