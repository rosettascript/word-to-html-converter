# Data Requirements

> **Part of:** [Technical Requirements](../README.md) | **Previous:** [Edge Cases for Design](../06-user-experience-design/06f-edge-cases-design.md) | **Next:** [JavaScript Library & Integration](07b-javascript-library-integration.md)

---

# Data Requirements

**Input Formats:**
- HTML string (pasted into textarea)
- Plain text with HTML content

**Pre-Processing (On Paste):**
- **Image Removal:** All `<img>` elements and image-related content are automatically removed from pasted HTML before any conversion processing
  - **Implementation:** Strip `<img>` tags and their attributes (src, alt, etc.) immediately upon paste
  - **Rationale:** Word-to-HTML conversions often include broken image links, large base64-encoded images, or image references that won't work in target platforms
  - **User Experience:** Images are removed silently; no warning needed as this is expected behavior
  - **Timing:** Removal happens before debounce delay, so cleaned HTML never contains images

**Output Formats:**
- Cleaned HTML string (displayed in code block)
- Downloadable .html file (P1 feature)
- JavaScript function return value (for library integration):
  ```javascript
  {
    cleanedHtml: "<h1>Title</h1>...",
    metadata: {
      stylesRemoved: 45,
      elementsPreserved: 120,
      processingTimeMs: 234
    }
  }
  ```

**Data Processing:**

**Base Processing (All Modes):**
- Parse HTML using browser-native DOMParser API
- Traverse DOM tree to identify and remove inline styles
- Preserve: semantic elements (h1-h6, p, ul, ol, li, a, table, strong, em, sup, sub, code, blockquote, etc.)
- **Note:** Images (`<img>`) are removed during pre-processing (on paste), before conversion begins
- Remove: 
  - `style` attributes from all elements
  - Empty `span` elements (no text content, no meaningful attributes after style removal)
  - Unnecessary `&nbsp;` entities (normalize to regular spaces where appropriate)
- Normalize: whitespace, line breaks, indentation (mode-dependent)

**Regular Mode Processing:**
- Apply base processing
- Fix orphaned list items (detect and repair list items exported outside the list tag)
- Replace `<br>` tags with empty `<p></p>` tags
- Clean anchor whitespace (move leading/trailing spaces outside anchor tags)
- Unwrap `<p>` tags inside `<li>` elements
- Remove `<br>` tags inside `<li>` elements (invalid HTML)
- Optionally apply "Put `<strong>` tags in headers" (user must enable manually, default: off)
- Optionally "Convert internal links to relative paths" (automatic domain detection, default: off)

**Shopify Blogs Mode Processing:**
- Apply base processing
- Fix orphaned list items (detect and repair list items exported outside the list tag)
- Process "Key Takeaways" sections (detect by heading text containing "Key Takeaways" or similar)
  - **Implementation:** Process ALL headings whose normalized text equals "Key Takeaways" (case-insensitive, whitespace normalized)
  - **Scope:** All occurrences, not just the first one (heading level h1-h6, nested or not)
  - **Heading Normalization:** If a "Key Takeaways" heading doesn't end with a colon (":"), automatically add one to ensure consistent formatting
  - **Remove `<em>` tags only:** Remove all `<em>` tags within the section following each "Key Takeaways" heading (until next heading of same or higher level), but preserve `<strong>` tags
  - **Action:** Only `<em>` tags are stripped; `<strong>` tags and other formatting are preserved
- Remove H1 tags and their content after "Key Takeaways" sections
  - **Implementation:** Find all H1 tags that appear after any "Key Takeaways" heading in document order
  - **Action:** Remove the H1 element and all its content
- Remove extra space after FAQ headers (`<h2>`)
  - **Implementation:** Find H2 headings containing "FAQ" or "Frequently Asked Questions" (case-insensitive)
  - **Action:** Remove all whitespace text nodes, `<br>` tags, and empty `<p>` tags immediately following the FAQ heading
- Remove `<br>` tags and empty `<p>` tags completely
  - **Implementation:** Remove all `<br>` elements and all `<p>` elements with no text content (including those with only whitespace)
  - **Note:** This is different from Regular/Shoppables modes which replace `<br>` with `<p></p>`
- Combine multiple consecutive `<ul>` or `<ol>` elements into single lists
  - **Implementation:** Find consecutive list elements of the same type (both `<ul>` or both `<ol>`) with no block-level elements between them
  - **Action:** Extract all `<li>` elements from consecutive lists and combine into a single list of the same type
  - **Note:** Lists separated by any element (e.g., `<p>`, `<div>`) remain separate; nested lists (inside `<li>`) are preserved as-is
- Add `rel="noopener noreferrer" target="_blank"` to ALL `<a>` tags (internal and external)
  - **Implementation:** Add both attributes to all anchor tags, regardless of link type
  - **Rationale:** Shopify requirement for all links to open in new tabs
- Clean anchor whitespace (move leading/trailing spaces outside anchor tags)
- Unwrap `<p>` tags inside `<li>` elements
- Normalize whitespace automatically (basic level)
  - **Implementation:** Always applied, not a user option
  - **Action:** Standardize whitespace without changing visual appearance
- Apply optional features if user enables:
  - Put `<strong>` tags in headers (h1-h6) - default: enabled
    - **Implementation:** Wrap entire inner content of each header (h1-h6) with a single `<strong>` tag
    - **When disabled:** Remove existing `<strong>` tags from headers
    - **Preserve:** All existing inline formatting (`<em>`, `<span>`, `<a>`, etc.) inside headers
  - Convert internal links to relative paths (auto-detects domain) - default: disabled
    - **Implementation:** Automatically detect the most common domain in the document by counting domain occurrences across all links
    - **Action:** Convert absolute URLs matching the detected domain to relative paths (pathname + search + hash)
    - **Preserve:** `target="_blank"` and `rel="noopener noreferrer"` attributes (required for Shopify)
    - **Leave untouched:** Absolute URLs from other domains

**Shopify Shoppables Mode Processing:**
- Apply base processing
- Fix orphaned list items (detect and repair list items exported outside the list tag)
- Replace `<br>` tags with empty `<p></p>` tags
  - **Implementation:** Replace all `<br>` elements with `<p></p>` for semantic line breaks
  - **Note:** This is different from Blogs mode which removes `<br>` completely
- Normalize whitespace automatically (minify level)
  - **Implementation:** Always applied, aggressive whitespace minification
  - **Action:** Remove whitespace and newlines between HTML tags only (markup-only whitespace)
  - **Preserve:** Text node spacing (do not collapse spaces inside text content)
  - **Goal:** Compact HTML for Shopify Shoppables without altering written text
- Combine multiple consecutive `<ul>` or `<ol>` elements into single lists
  - **Implementation:** Find consecutive list elements of the same type (both `<ul>` or both `<ol>`) with no block-level elements between them
  - **Action:** Extract all `<li>` elements from consecutive lists and combine into a single list of the same type
  - **Note:** Lists separated by any element (e.g., `<p>`, `<div>`) remain separate; nested lists (inside `<li>`) are preserved as-is
- Add `rel="noopener noreferrer" target="_blank"` to ALL `<a>` tags (internal and external)
  - **Implementation:** Add both attributes to all anchor tags, regardless of link type
  - **Rationale:** Shopify requirement for all links to open in new tabs
- Clean anchor whitespace (move leading/trailing spaces outside anchor tags)
- Unwrap `<p>` tags inside `<li>` elements
- Apply optional features if user enables:
  - Put `<strong>` tags in headers (h1-h6) - default: disabled
    - **Implementation:** Wrap entire inner content of each header (h1-h6) with a single `<strong>` tag
    - **When disabled:** Remove existing `<strong>` tags from headers
    - **Preserve:** All existing inline formatting (`<em>`, `<span>`, `<a>`, etc.) inside headers
  - Convert internal links to relative paths (auto-detects domain) - default: disabled
    - **Implementation:** Automatically detect the most common domain in the document by counting domain occurrences across all links
    - **Action:** Convert absolute URLs matching the detected domain to relative paths (pathname + search + hash)
    - **Preserve:** `target="_blank"` and `rel="noopener noreferrer"` attributes (required for Shopify)
    - **Leave untouched:** Absolute URLs from other domains

**Instant Processing Implementation:**
- Use `input` event listener on textarea
- Implement debouncing (300-500ms delay recommended)
- Process HTML as user types/pastes
- Show subtle loading indicator during processing
- Update results in real-time
- Re-process immediately when output mode or optional features change

**Preview Toggle Implementation:**
- Icon-only toggle button (eye icon or similar visual indicator)
- Toggle between two views:
  - **Code View:** Display cleaned HTML in `<pre><code>` block with syntax highlighting (optional)
  - **Preview View:** Render HTML in sandboxed iframe or isolated div with `innerHTML` (sanitized)
- Preview rendering:
  - Use `iframe` with `sandbox` attribute for security, OR
  - Use isolated `div` with `innerHTML` (sanitize first to prevent XSS)
  - Apply basic CSS reset/normalization for consistent preview rendering
  - Preview updates automatically when HTML changes or output mode/options change
- Works identically in all output modes (Regular, Shopify Blogs, Shopify Shoppables)
- State persistence: Remember user's preferred view (localStorage, P2)

**Data Volume Estimates:**
- Average document: 5-10 KB HTML
- Large document: 50-100 KB HTML
- Expected usage: 100-1000 documents per day (MVP)
- Storage: No persistent storage needed for MVP (stateless processing)

---

## Link Classification Algorithm

**Objective:** Distinguish between internal and external links to apply correct attributes.

**Classification Rules:**

```javascript
function classifyLink(href, configuredDomain = null) {
  // Normalize href
  const normalizedHref = href.trim();
  
  // 1. Relative paths → Internal
  if (normalizedHref.startsWith('/') || 
      normalizedHref.startsWith('./') || 
      normalizedHref.startsWith('../')) {
    return 'internal';
  }
  
  // 2. Anchor links → Internal
  if (normalizedHref.startsWith('#')) {
    return 'internal';
  }
  
  // 3. Mailto/tel links → Special (no target="_blank")
  if (normalizedHref.startsWith('mailto:') || 
      normalizedHref.startsWith('tel:')) {
    return 'special';
  }
  
  // 4. Check against configured domain (if provided)
  if (configuredDomain) {
    try {
      const linkUrl = new URL(normalizedHref, window.location.href);
      const configUrl = new URL(configuredDomain);
      
      // Compare hostname (ignore protocol, port, path)
      if (linkUrl.hostname === configUrl.hostname) {
        return 'internal';
      }
    } catch (error) {
      // Invalid URL, treat as internal (preserve as-is)
      return 'internal';
    }
  }
  
  // 5. Absolute URLs without configured domain → External
  if (normalizedHref.startsWith('http://') || 
      normalizedHref.startsWith('https://')) {
    return 'external';
  }
  
  // 6. Unknown/malformed → Internal (preserve as-is)
  return 'internal';
}
```

**Link Processing by Mode:**

| Link Type | Regular Mode | Shopify Blogs Mode | Shopify Shoppables Mode |
|-----------|--------------|---------------------|-------------------------|
| Internal (relative) | No changes | Add `target="_blank"` + `rel="noopener noreferrer"` | Add `target="_blank"` + `rel="noopener noreferrer"` |
| Internal (absolute, matched domain) | Convert to relative (if "Remove domain" enabled), preserve href | Convert to relative (if "Remove domain" enabled), preserve `target="_blank"` + `rel="noopener noreferrer"` | Convert to relative (if "Remove domain" enabled), preserve `target="_blank"` + `rel="noopener noreferrer"` |
| External (http/https) | Preserve href | Add `target="_blank"` + `rel="noopener noreferrer"` | Add `target="_blank"` + `rel="noopener noreferrer"` |
| Special (mailto/tel) | Preserve as-is | Preserve as-is (no target attributes) | Preserve as-is (no target attributes) |
| JavaScript/data URIs | Remove or replace with `#` | Remove or replace with `#` | Remove or replace with `#` |

**Note:** In Shopify Blogs and Shopify Shoppables modes, ALL links (internal and external) receive `target="_blank"` and `rel="noopener noreferrer"` attributes.

**Optional Feature: "Convert internal links to relative paths (auto-detects domain)"**

When enabled, automatically detect the most common domain and convert its links to relative paths:

```javascript
function removeDomainFromLinks(root) {
  const links = root.querySelectorAll('a[href]');
  if (links.length === 0) return;
  
  // Count domain occurrences
  const domainCounts = new Map();
  const linkData = [];
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    try {
      if (!href || href.startsWith('#') || href.startsWith('/') || 
          href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      
      const url = new URL(href, window.location.href);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        const hostname = url.hostname;
        domainCounts.set(hostname, (domainCounts.get(hostname) || 0) + 1);
        linkData.push({ link, url, href });
      }
    } catch (error) {
      // Invalid URL, skip it
    }
  });
  
  if (domainCounts.size === 0) return;
  
  // Find most common domain
  let mostCommonDomain = null;
  let maxCount = 0;
  for (const [domain, count] of domainCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonDomain = domain;
    }
  }
  
  // Convert links matching most common domain to relative paths
  linkData.forEach(({ link, url, href }) => {
    if (url.hostname === mostCommonDomain) {
      const relativePath = url.pathname + url.search + url.hash;
      link.setAttribute('href', relativePath);
      // Preserve target and rel attributes (don't remove them)
    }
  });
}
```

**Implementation:**
- No manual domain input required - automatic detection
- Counts domain occurrences across all links in the document
- Converts only links matching the most common domain
- Preserves `target` and `rel` attributes (important for Shopify modes)
- Handles multiple domains gracefully by focusing on the most common one

**Edge Cases:**

| Scenario | Treatment |
|----------|-----------|
| Empty href (`href=""`) | Preserve as-is |
| Missing href attribute | Preserve link without href |
| `href="#"` or `href="#top"` | Internal (no changes) |
| `href="/"` | Internal (no changes) |
| `href="javascript:void(0)"` | Remove or replace with `#` (security) |
| `href="data:text/html,..."` | Remove or replace with `#` (security) |
| Malformed URLs | Preserve as-is (log warning) |
| Protocol-relative URLs (`//example.com`) | Treat as external |

---

## Whitespace Normalization Algorithm

**Objective:** Normalize whitespace for clean, compact HTML without breaking semantic meaning or visual layout.

**Normalization Levels:**

### Level 1: Basic Normalization (Regular Mode, Shopify Blogs Mode)

**Goal:** Standardize whitespace without changing visual appearance.

**Rules:**
1. **Between Block Elements:** Normalize to single newline + indentation
   - `</p>\n\n\n<p>` → `</p>\n<p>`
   
2. **Within Text Nodes:** Preserve meaningful spaces
   - `"Some    text"` → `"Some text"` (collapse multiple spaces to single space)
   - `" Leading"` → `"Leading"` (remove leading spaces in text nodes)
   - `"Trailing "` → `"Trailing"` (remove trailing spaces in text nodes)
   
3. **Between Inline Elements:** Preserve single space
   - `<em>a</em> <em>b</em>` → `<em>a</em> <em>b</em>` (keep space)
   - `<em>a</em>  <em>b</em>` → `<em>a</em> <em>b</em>` (collapse to single space)
   
4. **Inside Elements:** Preserve meaningful whitespace
   - `<p>  Text  </p>` → `<p>Text</p>` (trim edges)
   - `<p>Word1 Word2</p>` → `<p>Word1 Word2</p>` (keep space between words)

5. **Empty Paragraphs with `&nbsp;`:** Preserve (intentional spacers)
   - `<p>&nbsp;</p>` → `<p>&nbsp;</p>` (keep as-is)

**Implementation:**

```javascript
function normalizeWhitespace(element) {
  // Traverse all text nodes
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let textNode;
  while (textNode = walker.nextNode()) {
    // Collapse multiple spaces to single space
    let text = textNode.textContent;
    text = text.replace(/\s+/g, ' ');
    
    // Trim leading/trailing whitespace in block contexts
    const parent = textNode.parentElement;
    if (isBlockElement(parent)) {
      if (textNode === parent.firstChild) {
        text = text.trimStart();
      }
      if (textNode === parent.lastChild) {
        text = text.trimEnd();
      }
    }
    
    textNode.textContent = text;
  }
}
```

### Level 2: Safe Minification (Shopify Shoppables Mode)

**Goal:** Aggressively remove whitespace to minimize HTML size while preserving semantic meaning.

**Additional Rules:**
1. **Remove Whitespace Between Tags:** Remove all whitespace-only text nodes between tags
   - `</p>\n\n<h2>` → `</p><h2>`
   
2. **Remove Empty Paragraphs:** Remove `<p>&nbsp;</p>` spacers (not needed in compact mode)
   - `<p>&nbsp;</p>` → (removed)
   
3. **Preserve Inline Semantics:** Keep spaces between inline elements to avoid word concatenation
   - `<em>a</em> <em>b</em>` → `<em>a</em> <em>b</em>` (space required!)
   - `<p>Word1 <strong>Word2</strong></p>` → `<p>Word1 <strong>Word2</strong></p>` (space required!)
   
4. **Remove Indentation:** Remove all indentation and newlines between tags
   - Prettified HTML → single-line HTML (where safe)

**Critical Preservation Rules:**

| Scenario | Action | Reason |
|----------|--------|--------|
| `<p>Text <em>more</em> text</p>` | Keep spaces around inline elements | Prevents "Textmoretext" |
| `<li>Item</li> <li>Item</li>` | Remove space between list items | Block elements don't need spaces |
| `<p>Para1</p> <p>Para2</p>` | Remove space between paragraphs | Block elements don't need spaces |
| `<br>` | Keep as-is | Intentional line break |
| `&nbsp;` inside text | Keep as-is | Non-breaking space is intentional |
| `<p>&nbsp;</p>` | Remove | Empty spacer not needed in compact mode |

**Implementation:**

```javascript
function safeMinification(element) {
  // First, apply basic normalization
  normalizeWhitespace(element);
  
  // Remove whitespace-only text nodes between block elements
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  const nodesToRemove = [];
  let textNode;
  
  while (textNode = walker.nextNode()) {
    // Check if text node is whitespace-only
    if (/^\s+$/.test(textNode.textContent)) {
      const prev = textNode.previousSibling;
      const next = textNode.nextSibling;
      
      // Only remove if between two block elements
      if (prev && next && 
          isBlockElement(prev) && 
          isBlockElement(next)) {
        nodesToRemove.push(textNode);
      }
    }
  }
  
  nodesToRemove.forEach(node => node.remove());
  
  // Remove empty <p>&nbsp;</p> spacers
  element.querySelectorAll('p').forEach(p => {
    if (p.innerHTML.trim() === '&nbsp;' && !p.hasAttributes()) {
      p.remove();
    }
  });
}

function isBlockElement(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const blockTags = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                     'ul', 'ol', 'li', 'blockquote', 'table', 'tr'];
  return blockTags.includes(node.tagName.toLowerCase());
}
```

**Whitespace Normalization Test Cases:**

| Input | Regular/Blogs Output | Shoppables Output |
|-------|---------------------|-------------------|
| `<p>  Text  </p>` | `<p>Text</p>` | `<p>Text</p>` |
| `</p>\n\n<p>` | `</p>\n<p>` | `</p><p>` |
| `<em>a</em>  <em>b</em>` | `<em>a</em> <em>b</em>` | `<em>a</em> <em>b</em>` |
| `<p>&nbsp;</p>` | `<p>&nbsp;</p>` | (removed) |
| `<p>Word1   Word2</p>` | `<p>Word1 Word2</p>` | `<p>Word1 Word2</p>` |

---

## List Combination Algorithm

**Objective:** Combine consecutive lists of the same type to improve structure and readability.

**Combination Rules:**

### When to Combine Lists:

1. **Same Type:** Both lists are `<ul>` or both are `<ol>` (don't mix types)
2. **Consecutive:** Lists are adjacent siblings with only acceptable separators between them
3. **No Structural Elements Between:** No headings, paragraphs with content, or other block elements between lists

### Acceptable Separators (by Mode):

| Separator | Regular Mode | Shopify Blogs Mode | Shopify Shoppables Mode |
|-----------|--------------|---------------------|-------------------------|
| Whitespace-only text nodes | ✅ Combine | ✅ Combine | ✅ Combine |
| Empty paragraphs (`<p></p>`) | ✅ Combine | ✅ Combine | ✅ Combine |
| Spacer paragraphs (`<p>&nbsp;</p>`) | ❌ Don't combine | ❌ Don't combine | ✅ Combine (remove spacer) |
| Paragraphs with text | ❌ Don't combine | ❌ Don't combine | ❌ Don't combine |
| Other block elements | ❌ Don't combine | ❌ Don't combine | ❌ Don't combine |

### Algorithm:

```javascript
function combineLists(element, mode) {
  const listPairs = [];
  
  // Find all consecutive list pairs
  element.querySelectorAll('ul, ol').forEach(list => {
    let nextSibling = list.nextSibling;
    let foundSeparator = null;
    
    // Skip whitespace and acceptable separators
    while (nextSibling) {
      if (nextSibling.nodeType === Node.TEXT_NODE && /^\s*$/.test(nextSibling.textContent)) {
        // Whitespace-only text node - acceptable
        nextSibling = nextSibling.nextSibling;
        continue;
      }
      
      if (nextSibling.nodeType === Node.ELEMENT_NODE) {
        const tagName = nextSibling.tagName.toLowerCase();
        
        // Empty paragraph - acceptable
        if (tagName === 'p' && nextSibling.innerHTML.trim() === '') {
          foundSeparator = nextSibling;
          nextSibling = nextSibling.nextSibling;
          continue;
        }
        
        // Spacer paragraph - mode-dependent
        if (tagName === 'p' && nextSibling.innerHTML.trim() === '&nbsp;') {
          if (mode === 'shopify-shoppables') {
            foundSeparator = nextSibling;
            nextSibling = nextSibling.nextSibling;
            continue;
          } else {
            // In Blogs/Regular mode, preserve spacer (don't combine)
            break;
          }
        }
        
        // Check if next element is a list
        if (tagName === list.tagName.toLowerCase()) {
          listPairs.push({
            first: list,
            second: nextSibling,
            separator: foundSeparator
          });
        }
        
        break;
      }
      
      break;
    }
  });
  
  // Combine list pairs (in reverse to avoid DOM mutation issues)
  listPairs.reverse().forEach(({ first, second, separator }) => {
    // Move all <li> elements from second list to first list
    while (second.firstChild) {
      first.appendChild(second.firstChild);
    }
    
    // Remove separator if present
    if (separator) {
      separator.remove();
    }
    
    // Remove second list
    second.remove();
  });
}
```

### Edge Cases:

| Scenario | Action | Reason |
|----------|--------|--------|
| `<ul>...</ul><ul>...</ul>` | Combine | Consecutive, same type |
| `<ul>...</ul>\n\n<ul>...</ul>` | Combine | Whitespace-only separator |
| `<ul>...</ul><p></p><ul>...</ul>` | Combine (remove `<p>`) | Empty paragraph separator |
| `<ul>...</ul><p>&nbsp;</p><ul>...</ul>` (Blogs) | Don't combine | Preserve intentional spacer |
| `<ul>...</ul><p>&nbsp;</p><ul>...</ul>` (Shoppables) | Combine (remove spacer) | Compact mode removes spacers |
| `<ul>...</ul><p>Text</p><ul>...</ul>` | Don't combine | Paragraph with content between |
| `<ul>...</ul><h3>...</h3><ul>...</ul>` | Don't combine | Heading between lists (new section) |
| `<ul>...</ul><ol>...</ol>` | Don't combine | Different list types |
| Nested lists inside `<li>` | Don't combine | Preserve nesting |

### Test Cases:

**Input:**
```html
<ul>
  <li>Item 1</li>
</ul>
<ul>
  <li>Item 2</li>
</ul>
```

**Output (all modes):**
```html
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

**Input:**
```html
<ul>
  <li>Item 1</li>
</ul>
<p>&nbsp;</p>
<ul>
  <li>Item 2</li>
</ul>
```

**Output (Shopify Blogs):**
```html
<ul>
  <li>Item 1</li>
</ul>
<p>&nbsp;</p>
<ul>
  <li>Item 2</li>
</ul>
```
(Not combined - preserve spacer)

**Output (Shopify Shoppables):**
```html
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```
(Combined - spacer removed)

---

## Anchor Whitespace Cleaning Algorithm

**Objective:** Remove leading and trailing whitespace from anchor tag content while preserving necessary spacing for text separation.

**Problem:** Word often includes whitespace inside anchor tags (e.g., `<a> link text </a>`), which creates invalid HTML structure and styling issues.

**Solution:** Move whitespace OUTSIDE the anchor tag to adjacent text nodes.

**Algorithm:**

```javascript
function cleanAnchorWhitespace(root) {
  const anchors = root.querySelectorAll('a');
  
  anchors.forEach(anchor => {
    const originalText = anchor.textContent;
    const trimmedText = originalText.trim();
    
    if (!trimmedText) return;
    
    // Check if original had leading/trailing spaces
    const hadLeadingSpace = /^\s/.test(originalText);
    const hadTrailingSpace = /\s$/.test(originalText);
    
    // Set the cleaned text (no spaces inside anchor)
    anchor.textContent = trimmedText;
    
    // Move leading space OUTSIDE to previous sibling or create new text node
    if (hadLeadingSpace) {
      const prevSibling = anchor.previousSibling;
      if (prevSibling && prevSibling.nodeType === Node.TEXT_NODE) {
        // Add space to end of previous text node if it doesn't have one
        if (!/\s$/.test(prevSibling.textContent)) {
          prevSibling.textContent = prevSibling.textContent + ' ';
        }
      } else {
        // Create a new text node with space before the anchor
        anchor.parentNode.insertBefore(document.createTextNode(' '), anchor);
      }
    }
    
    // Move trailing space OUTSIDE to next sibling or create new text node
    if (hadTrailingSpace) {
      const nextSibling = anchor.nextSibling;
      if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
        // Add space to start of next text node if it doesn't have one
        if (!/^\s/.test(nextSibling.textContent)) {
          nextSibling.textContent = ' ' + nextSibling.textContent;
        }
      } else {
        // Create a new text node with space after the anchor
        anchor.parentNode.insertBefore(document.createTextNode(' '), anchor.nextSibling);
      }
    }
  });
}
```

**Test Cases:**

| Input | Output | Reason |
|-------|--------|--------|
| `text<a> link</a>more` | `text <a>link</a>more` | Leading space moved outside |
| `text<a>link </a>more` | `text<a>link</a> more` | Trailing space moved outside |
| `text<a> link </a>more` | `text <a>link</a> more` | Both spaces moved outside |
| `<a>  link  </a>` | ` <a>link</a> ` | Multiple spaces collapsed to single |
| `<p><a> link</a></p>` | `<p> <a>link</a></p>` | Creates new text node before anchor |
| `<p><a>link </a></p>` | `<p><a>link</a> </p>` | Creates new text node after anchor |

**Edge Cases:**

| Scenario | Treatment |
|----------|-----------|
| Empty anchor (`<a> </a>`) | Skip (returns early) |
| No whitespace (`<a>link</a>`) | No changes |
| Multiple consecutive spaces | Collapsed to single space outside anchor |
| Already has adjacent text nodes | Adds space to existing text nodes |
| No adjacent text nodes | Creates new text nodes with spaces |

**Benefits:**
- Clean anchor tag content (no leading/trailing whitespace)
- Preserves text separation (prevents "textlinkmore" concatenation)
- Maintains proper HTML structure
- Works in all output modes (Regular, Shopify Blogs, Shopify Shoppables)

---

**See also:**
- [JavaScript Library & Integration](07b-javascript-library-integration.md) - Library usage
- [Technical Constraints](07e-technical-constraints.md) - Processing limitations
