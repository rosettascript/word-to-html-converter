# Anchor Whitespace Fix

## Problem
The HTML formatter was adding unnecessary whitespace (newlines and indentation) inside and around anchor tags and other inline elements, resulting in two main issues:

### Issue 1: Whitespace Inside Anchor Tags
```html
<a href="https://thewanderclub.com/collections/tokens" target="_blank" rel="noopener noreferrer">
    tokens
</a>
```

### Issue 2: Unwanted Space Before Punctuation
```html
<a href="https://thewanderclub.com/">The Wander Club</a>
: each engraved Token...
```

This created visual whitespace in the rendered HTML (space before the colon) and made the formatted output harder to read.

## Solution
Updated the `formatHTML()` function in `js/utils/html-formatter.js` to:

1. **Identify block and inline elements** - Distinguish between block elements (p, div, h1-h6, ul, li, etc.) and inline elements (a, strong, em, span, etc.)
2. **Format blocks with inline content on one line** - When a block element contains only text and inline elements (no nested blocks), format everything on a single line
3. **Smart whitespace handling** - Preserve spaces between words while:
   - Collapsing multiple spaces into one
   - Removing leading whitespace at the start of the block
   - Removing trailing whitespace at the end of the block
   - Keeping punctuation immediately adjacent to closing anchor tags (no space before `:`, `.`, `,`, `!`, `?`, `;`)

## Result
Anchor tags and other inline elements are now formatted correctly with proper spacing:

```html
<p>That's the spirit behind <a href="https://thewanderclub.com/">The Wander Club</a>: each engraved Token...</p>
```

### Examples

**Example 1: Punctuation After Links (No Space)**

Before:
```html
<p>
    That's the spirit behind
    <a href="https://thewanderclub.com/">The Wander Club</a>
    : each engraved Token...
</p>
```

After:
```html
<p>That's the spirit behind <a href="https://thewanderclub.com/">The Wander Club</a>: each engraved Token...</p>
```

✅ No space before the colon!

**Example 2: Text Between Links (Space Preserved)**

Before:
```html
<p>
    explore handcrafted
    <a href="https://example.com">tokens</a>
    engraved with landmarks
</p>
```

After:
```html
<p>explore handcrafted <a href="https://example.com">tokens</a> engraved with landmarks</p>
```

✅ Space preserved between "tokens" and "engraved"!

**Example 3: Various Punctuation Marks**

All work correctly without space:
```html
<p>Check out <a href="...">this link</a>.</p>
<p>Visit <a href="...">our site</a>, and discover more.</p>
<p>See <a href="...">amazing things</a>!</p>
<p>Want to visit <a href="...">this place</a>?</p>
<p>Check <a href="...">this</a>; it's great.</p>
```

## Benefits
- **No visual whitespace before punctuation** - Punctuation marks (`:`, `.`, `,`, `!`, `?`, `;`) appear immediately after links with no extra space
- **Proper spacing between words** - Spaces are preserved where needed (between words)
- **Cleaner output** - Block elements with inline content format on a single line
- **Better structure** - Inline elements stay inline as intended
- **Handles complex cases** - Works with multiple links and nested inline elements in the same paragraph

## Testing
All test cases pass, including:
- ✅ Anchor followed by colon (`:`)
- ✅ Anchor followed by period (`.`)
- ✅ Anchor followed by comma (`,`)
- ✅ Anchor followed by exclamation (`!`)
- ✅ Anchor followed by question mark (`?`)
- ✅ Anchor followed by semicolon (`;`)
- ✅ Multiple anchors with text between them (preserves spacing)
- ✅ Anchor tags in list items

The fix is backward compatible and works across all three conversion modes (Regular, Shopify Blogs, Shopify Shoppables).

