# Key Screens/States to Design

> **Part of:** [User Experience & Design](../README.md) | **Previous:** [User Flow](06a-user-flow.md) | **Next:** [SEO Page Structure](06c-seo-page-structure.md)
> 
> **Reference:** See [Visual Design System](06d-visual-design-system.md) for detailed design specifications and [Enhanced Design System.md](../../Enhanced%20Design%20System.md) for complete design guidelines.

---

## 1. Landing/Input Screen

**Elements:**
- Header with tool name and brief description
  - Typography: H1 (52-56px Semi-bold) for tool name, Body (16-17px Regular) for description
  - Colors: Text Primary (#2C2C2C) for heading, Text Secondary (#5A5A5A) for description
  - Spacing: 48px padding (desktop), 24px (mobile)
- Output mode selector: Radio buttons (Regular, Shopify Blogs, Shopify Shoppables)
  - Design: Radio buttons 20px diameter, accent border at 40% opacity, 16px spacing between options
  - Typography: Body text (16-17px Regular)
  - Colors: Accent color from palette, Text Primary for labels
- Input area: Rendered content display (not a textarea)
  - Design: Glassmorphism background (rgba(255,255,255,0.7) + blur(12px))
  - Border: 1.5px solid accent at 40% opacity
  - Border-radius: 8px
  - Padding: 16px
  - Height: 600px fixed, with vertical and horizontal scrolling
  - Typography: Semantic rendering (h1 at 48px, h2 at 32px, h3 at 22px, body at 17px)
  - Colors: Text Primary for content, Text Secondary (#5A5A5A) for placeholder
  - Attributes: `contenteditable="false"`, `role="textbox"`, `aria-readonly="true"`
  - Behavior: Displays pasted HTML as rendered content (preserving h1 as h1, lists as lists, bold/italic formatting)
  - Processing: Strips inline styles and converts to semantic tags before display
- Optional features checkboxes section (mode-dependent visibility):
  - ☑ Put `<strong>` tags in headers (h1-h6)
    - Visibility: Only shown in Shopify Blogs and Shopify Shoppables modes
    - Default: Enabled in Shopify Blogs; Disabled in Shopify Shoppables
    - Behavior: When enabled, wraps header content in `<strong>`; when disabled, removes `<strong>` tags
  - ☐ Convert internal links to relative paths (auto-detects domain)
    - Visibility: Only shown in Shopify Blogs and Shopify Shoppables modes
    - Default: Disabled
    - Behavior: Automatically detects most common domain and converts those links to relative paths
  - Design: Checkboxes 20px × 20px, accent border at 40% opacity, 4px border-radius
  - Spacing: 16px between checkbox and label, 24px between options
  - Typography: Body text (16-17px Regular)
- Help text: "Paste your Word-to-HTML output here - processing happens instantly"
  - Typography: Caption (13-14px Regular)
  - Colors: Text Secondary (#5A5A5A)
  - Spacing: 8px above input area
- Real-time processing indicator (subtle, shows when processing)
  - Design: 8-24px spinner, accent color, 1.5px stroke
  - Animation: Pulse 2s ease-in-out
  - Spacing: 8px from input area

**States:**
- Empty (default) - shows placeholder text
- Content pasted (images automatically removed, displays as rendered HTML, processing starts automatically)
- Processing (show subtle indicator, input remains read-only)
- Results displayed (updates automatically when settings change)
- Error (show error message, allow retry)

**Note:** The input area displays pasted HTML as rendered content (semantic structure preserved). Images are automatically removed from both the input display and output. Processing happens instantly on paste and when output mode or settings change.

## 2. Processing/Loading State (Instant Conversion)

**Elements:**
- Subtle processing indicator (small spinner or pulse animation)
  - Design: 8-24px diameter spinner, accent color, 1.5px stroke
  - Animation: Pulse 2s ease-in-out, accent color at 40% opacity
  - Position: Near input area, 8px spacing
- Status message: "Processing..." (appears briefly during debounce delay)
  - Typography: Caption (13-14px Regular)
  - Colors: Text Secondary (#5A5A5A)
  - Animation: Fade-in 300ms, appears 400ms after input stops
- No cancel button needed (instant processing)
- Results update automatically when processing completes

**Note:** Processing happens automatically with debouncing (300-500ms delay) to prevent excessive processing while user types

## 3. Results/Preview Screen

**Elements:**
- Output mode indicator (shows current mode: Regular/Shopify Blogs/Shopify Shoppables)
  - Design: Badge/Tag style, pill shape (20px border-radius)
  - Padding: 6px 16px
  - Background: Accent gradient at 30% opacity
  - Border: 0.5px solid accent at 40%
  - Typography: 13px Medium (500)
  - Colors: Accent color from palette
  - Spacing: 16px from top of results area
- Optional features indicator (shows which checkboxes are enabled)
  - Typography: Caption (13-14px Regular)
  - Colors: Text Secondary (#5A5A5A)
  - Spacing: 8px below mode indicator
- Preview toggle icon button (switches between HTML code view and rendered preview view)
  - Design: Icon-only button, 24px icon size
  - Stroke: 1.5px weight, rounded caps/joins
  - Colors: Accent color from palette
  - Padding: 2px for touch targets (28px total)
  - Border-radius: 8px
  - Hover: Scale 1.02, background fade to accent 10% opacity, 200ms ease-out-cubic
  - Focus: 2px solid ring, accent at 40% opacity, 2px offset
  - Spacing: 16px from mode indicator
- Cleaned HTML in code block (syntax highlighted, if P2) - default view
  - Design: Card/Container style with glassmorphism
  - Background: rgba(255,255,255,0.7) + blur(12px)
  - Border: 1.5px solid accent at 40% opacity
  - Shadow: `0 4px 16px [accent]30`
  - Padding: 32px
  - Border-radius: 8px
  - Typography: Monospace font, 16-17px Regular
  - Colors: Text Primary (#2C2C2C) for code
  - Spacing: 24px from toggle button
- Rendered preview view (Word version - how HTML displays) - toggled view
  - Design: Same card styling as code block
  - Typography: Body text (16-17px Regular) for rendered content
  - Colors: Text Primary for content
  - Spacing: Same as code block
- Before/After comparison (side-by-side or toggle view) - P1 feature
  - Design: Two cards side-by-side (desktop) or stacked (mobile)
  - Spacing: 32px gap between cards (desktop), 24px (mobile)
- Copy button (prominent, primary)
  - Design: Primary button style
  - Gradient background (accent colors)
  - Accent shadow: `0 4px 16px [accent]30`
  - Padding: 18px horizontal
  - Border-radius: 8px
  - Font-weight: 600 (Semi-bold)
  - Typography: Body text (16-17px Semi-bold)
  - Colors: White text on accent gradient background
  - Hover: Scale 1.02, background fade to accent 10% opacity, 200ms ease-out-cubic
  - Click: Scale to 0.98 then back to 1.0, ripple effect, 300ms ease-in-out
  - Spacing: 24px from results area
- Download button (secondary)
  - Design: Secondary button style
  - Transparent background with accent border (1.5px)
  - Padding: 18px horizontal
  - Border-radius: 8px
  - Font-weight: 500 (Medium)
  - Typography: Body text (16-17px Medium)
  - Colors: Accent color text and border
  - Same hover/click interactions as primary
  - Spacing: 16px from copy button
- Statistics: "Removed X inline styles, preserved Y elements" - P2 feature
  - Typography: Caption (13-14px Regular)
  - Colors: Text Secondary (#5A5A5A)
  - Spacing: 16px above buttons
- Results update in real-time as user types or changes settings

**Preview Toggle Functionality:**
- Icon-only button (eye icon or similar)
- Toggles between:
  - **Code View (default):** Shows cleaned HTML in code block
  - **Preview View:** Shows rendered HTML in an iframe or sandboxed div (Word version - visual representation)
- Works in all output modes (Regular, Shopify Blogs, Shopify Shoppables)
- Preview updates automatically when content or settings change
- Preview shows how HTML will look when rendered in a browser/CMS

**States:**
- Success (show results, updates automatically)
- Code view (default) - shows HTML code
- Preview view (toggled) - shows rendered HTML
- Partial success (show results with warnings)
- Error (show error message, allow retry)
- Empty (no content pasted yet)

## 4. Error States

**Error Types:**
- Invalid input (malformed HTML) → Show validation error with contextual snippet (no line numbers)
  - Design: Error state styling
  - Text: #D4A574 (muted amber) at 90% opacity
  - Borders: 1.5px solid #D4A574 at 50% opacity
  - Icon: Left of message, accent color
  - Animation: Fade-in 300ms, appears 400ms after validation fails
  - Typography: Body text (16-17px Regular)
  - Spacing: 16px padding, 24px from input area
- Very large content (> 5MB) → Show browser memory warning
  - Same error styling as above
  - Colors: #D4A574 (muted amber) for warning text
- Processing timeout → Show timeout message, suggest smaller content
  - Same error styling as above
- Browser compatibility → Show unsupported browser message
  - Same error styling as above

---

**See also:**
- [Visual Design System](06d-visual-design-system.md) - Complete design specifications
- [Interaction Principles](06e-interaction-principles.md) - How users interact with these screens
- [Edge Cases for Design](06f-edge-cases-design.md) - Edge cases for these screens

