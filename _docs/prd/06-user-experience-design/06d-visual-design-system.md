# Visual Design System

> **Part of:** [User Experience & Design](../README.md) | **Previous:** [SEO Page Structure](06c-seo-page-structure.md) | **Next:** [Interaction Principles](06e-interaction-principles.md)
> 
> **Reference:** See [Enhanced Design System.md](../../Enhanced%20Design%20System.md) for complete design specifications.

---

**Design Philosophy:**
"Intentional Minimalism" - A warm, pale-color aesthetic with deliberate design principles. Every pixel earns its place through contrast, rhythm, and silence. The design whispers rather than shouts, using warm, desaturated tones to create a calm, professional interface that focuses attention on content and functionality.

**Color Palette:**

**Background Colors:**
- Primary Background: `#FAF8F5` (warm cream)
- Secondary Background: `#F0EDE8` (warm greige)

**Accent Colors (rotate per component):**
- Warm Taupe: `#C9A88F`
- Dusty Teal: `#A8BCBC`
- Terracotta Dust: `#D4B5A8`
- Sage Frost: `#9FB8AD`
- Lavender Mist: `#BFA8C9`
- Moss Pale: `#B8C9A8`
- Warm Sand: `#C9B8A8`
- Powder Blue: `#A8B8C9`
- Dusty Rose: `#C9A8B8`

**Text Colors:**
- Text Primary: `#2C2C2C`
- Text Secondary: `#5A5A5A`

**Usage Guidelines:**
- Avoid pure grays; use warm-leaning desaturated tones
- Each accent color has 20-25% saturation, 75-85% lightness
- Use gradients (135° diagonal) between two adjacent accent colors for depth
- Accent colors occupy 10-15% of viewport maximum
- One focal element per viewport at full saturation (25%)

**Typography:**

**Font Family:**
- Primary: Inter, Satoshi, or Manrope (sans-serif)
- Weights: Regular (400), Medium (500), Semi-bold (600)

**Type Scale:**
- Base size: 16px
- Scale: 1.25 (minor third)
- Line-height: 1.65 for body text, 1.2 for headings

**Heading Specifications:**
- H1: 52-56px / Semi-bold (600) / -0.03em letter-spacing / Line-height 1.2
  - Usage: Maximum 1 per page, page title only
- H2: 32-36px / Semi-bold (600) / -0.02em letter-spacing / Line-height 1.2
  - Usage: Section breaks
- H3: 20-24px / Medium (500) / -0.01em letter-spacing / Line-height 1.2
  - Usage: Sub-sections

**Body Text:**
- Body: 16-17px / Regular (400) / 0em letter-spacing / Line-height 1.65
- Caption: 13-14px / Regular (400) / Line-height 1.65
  - Usage: Metadata, disclaimers, help text

**Spacing & Layout:**

**Baseline Grid:**
- 8px baseline grid for vertical rhythm
- All text, buttons, and components align to 8px vertical grid
- All interactive elements align to 48px horizontal grid for touch consistency

**Spacing Scale (8px base unit):**
4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128px

**Whitespace Rules:**
- **Micro (4-16px):** Element padding, line spacing, icon gaps
- **Macro (48-96px):** Section breathing room, component separation
- **Sacred (128px+):** Page breaks, mental resets, full-width gaps
- For every 100px of content, provide minimum 80px surrounding whitespace
- Alternate section density: 60/40 content/space, then 30/70

**Responsive Breakpoints:**
- **Mobile (< 640px):** Single column, 24px gutters, full-width content
  - Component padding: 24px, Section spacing: 64px
- **Tablet (640-1023px):** 2 columns, 32px gutters, 50/50 or 60/40 splits
  - Component padding: 32px, Section spacing: 80px
- **Desktop (≥ 1024px):** 2-3 columns, 48px gutters, golden ratio splits (61.8% / 38.2%)
  - Component padding: 48px, Section spacing: 96px
- **Wide (≥ 1440px):** Max container 1200px, centered

**Grid System:**
- Content max-width: 800px for readability
- Use CSS Grid with `auto-fit` and `minmax()` for fluid layouts
- Golden ratio (61.8% / 38.2%) for asymmetric 2-column layouts

**Component Specifications:**

**Buttons:**
- **Primary Button:**
  - Gradient background (accent colors)
  - Accent shadow: `0 4px 16px [accent]30`
  - Padding: 18px horizontal
  - Border-radius: 8px
  - Font-weight: 600 (Semi-bold)
  - Minimum height: 24px taller than surrounding text line-height
  - Hover: Scale 1.02, background fade to accent 10% opacity, 200ms ease-out-cubic
  - Click: Scale to 0.98 then back to 1.0, ripple effect in accent color, 300ms ease-in-out
- **Secondary Button:**
  - Transparent background with accent border (1.5px)
  - Padding: 18px horizontal
  - Border-radius: 8px
  - Font-weight: 500 (Medium)
  - Same hover/click interactions as primary
- **Text Button:**
  - No background, accent color text
  - Underline on hover (slides in from left)
  - 200ms ease-out-cubic
- **Loading State:**
  - 8px spinner (accent color), maintains button dimensions
  - Spinner replaces text during loading

**Form Inputs:**
- **Textarea (Main Input):**
  - Height: 48px minimum (touch-friendly)
  - Padding: 16px horizontal
  - Border: 1.5px solid, accent color at 40% opacity
  - Border-radius: 8px
  - Background: rgba(255,255,255,0.7) + blur(12px) (glassmorphism)
  - Focus: Border color transitions to full accent, 300ms ease-out-quart
  - Placeholder: Text Secondary color (#5A5A5A)
- **Checkboxes:**
  - Size: 20px × 20px minimum
  - Border: 1.5px solid accent at 40% opacity
  - Border-radius: 4px
  - Checked: Accent background, white checkmark
  - Hover: Accent border at 60% opacity
- **Radio Buttons (Output Mode Selector):**
  - Size: 20px diameter
  - Border: 1.5px solid accent at 40% opacity
  - Selected: Accent fill with white center dot
  - Spacing: 16px between options

**Cards/Containers:**
- Background: rgba(255,255,255,0.7) + blur(12px) (glassmorphism)
- Border: 1.5px solid accent at 40% opacity
- Shadow: `0 4px 16px [accent]30`
- Padding: 32px
- Border-radius: 8px
- Hover: translateY(-6px), enhanced shadow, 200ms ease-out-cubic

**Icons:**
- Stroke: 1.5px weight, rounded caps/joins
- Sizes:
  - 16px (inline with text)
  - 20px (buttons)
  - 24px (standalone, preview toggle)
- Color: Accent from palette
- Padding: 2px for touch targets (actual size +4px)
- Library: Feather Icons or custom matching illustration style

**Badges/Tags (Output Mode Indicators):**
- Padding: 6px 16px
- Border-radius: 20px (pill shape)
- Background: accent gradient at 30% opacity
- Border: 0.5px solid accent at 40%
- Font: 13px Medium (500)

**Progress Indicators:**
- Loading spinner: 8-24px diameter, accent color, 1.5px stroke
- Skeleton screens: accent color at 40% opacity, pulse 2s ease-in-out
- Processing indicator: Subtle pulse animation, accent color

**Interaction & Micro-UX:**

**Hover States:**
- Links: Underline slides in from left OR background fade to accent 10% opacity
- Buttons: Scale 1.02, background fade to accent 10% opacity
- Cards: translateY(-6px), enhanced shadow
- Timing: 200ms ease-out-cubic

**Click/Tap Interactions:**
- Ripple effect in accent color (0% → 15% opacity, radius 150% of click point)
- Scale to 0.98 then back to 1.0
- Timing: 300ms ease-in-out

**Focus States:**
- 2px solid ring, accent color at 40% opacity, 2px offset
- Focus-visible only (not on mouse click)
- 3:1 contrast minimum for indicators

**Loading States:**
- Skeleton screens: accent color at 40% opacity, pulse 2s ease-in-out
- Button loading: 8px spinner (accent), maintains button dimensions
- Processing indicator: Subtle pulse, appears during debounce delay

**Error States:**
- Text: #D4A574 (muted amber) at 90% opacity
- Borders: 1.5px solid #D4A574 at 50% opacity
- Icon left of message, fade-in 300ms, appears 400ms after validation fails

**Disabled States:**
- 40% opacity
- Cursor: not-allowed
- No hover effects

**Animation Timing:**
- Entrance animations: 300ms ease-out-cubic
- Exit animations: 40% faster than entrance (180ms)
- Stagger: 80ms delay per element in sequence (max 5 elements)
- Only animate `transform` and `opacity` (GPU-accelerated)
- Maximum 3-4 simultaneous animations per viewport
- All animations respect `prefers-reduced-motion`

**UI Element Specifications:**

**Borders:**
- Width: 0.5-1.5px
- Color: Accent color at 30-40% opacity
- Full opacity on focus/active states

**Border-Radius:**
- Standard: 6-8px (buttons, cards, inputs, badges)
- Pill shape: 20px (badges/tags)

**Shadows:**
- Cards: `0 4px 16px [accent]30` (colored, matching accent)
- Modals/Elevated: `0 8px 32px rgba(0,0,0,0.06)`
- Depth through transparency and blur, not hard shadows

**Glassmorphism:**
- Background: rgba(255,255,255,0.7) + `backdrop-filter: blur(8-16px)`
- Used on: Cards, overlays, sticky navigation
- Fallback: Solid background with slight transparency

**Accessibility Requirements:**

**WCAG AA Compliance:**
- Normal text: 4.5:1 contrast minimum
- Large text/icons: 3:1 contrast minimum
- Focus indicators: 3:1 contrast minimum

**Keyboard Navigation:**
- All interactive elements keyboard accessible
- Tab order follows visual hierarchy
- Skip links for main content
- Preview toggle accessible via keyboard

**Screen Reader Support:**
- Semantic HTML with proper ARIA labels
- All icons have descriptive labels
- Form inputs properly labeled
- Status messages announced

**Reduced Motion:**
- All animations respect `prefers-reduced-motion`
- Provide static alternatives for animated content
- Pause SVG animations when motion is reduced

**Performance Targets:**

**Core Web Vitals:**
- LCP (Largest Contentful Paint): < 1.8s
- CLS (Cumulative Layout Shift): < 0.05
- FID (First Input Delay): < 100ms
- TTI (Time to Interactive): < 3.5s

**Animation Performance:**
- Only animate `transform` and `opacity` (GPU-accelerated)
- Never animate `width`, `height`, `top`, `left` (layout triggers)
- Use `will-change: transform` only during animation
- Remove `will-change` after animation completes

**Asset Optimization:**
- Images: WebP with JPEG fallback, `loading="lazy"`
- Fonts: Variable fonts, subset to used characters, `font-display: swap`
- SVG: Inline for icons, optimized with SVGO
- Max image dimensions: Hero 1920×1080px, Thumbnails 400×400px

**Browser Support:**
- Modern browsers (last 2 versions): Chrome, Firefox, Safari, Edge
- CSS Grid fallback: Flexbox for < 1024px
- Glassmorphism fallback: Solid background with slight transparency

**Design Principles:**

The design system follows nine core principles that guide all design decisions:

1. **Alignment:** All elements align to 8px baseline grid; icons positioned 1-2px higher than mathematical center
2. **Balance:** Use golden ratio (61.8% / 38.2%) for asymmetric layouts; accent colors occupy 10-15% of viewport
3. **Hierarchy:** Clear size and weight distinctions; one H1 maximum per page; maximum 2-3 heading levels per section
4. **Contrast:** One focal element per viewport at full saturation; supporting elements at 15% saturation
5. **Emphasis:** Maximum 2 emphasized elements per viewport; position hierarchy wins in conflicts
6. **Movement:** Subtle, functional animations; diagonal movement at 30° angle; desktop 12px max translation
7. **Rhythm:** Consistent spacing (16-24px items, 96px sections); alternate dense/sparse sections
8. **Whitespace:** Intentional emptiness guides eye path; for every 100px content, 80px whitespace minimum
9. **Unity:** Consistent border-radius (6-8px), shadow depth, animation easing across all components

**Full Design System Reference:**
For complete design principles, detailed component inventory, SVG illustration guidelines, and comprehensive interaction specifications, refer to the **Enhanced Design System.md** document. This PRD section provides the essential specifications needed for implementation, while the full design system document contains detailed guidelines for designers and developers.

---

**See also:**
- [Key Screens/States to Design](06b-key-screens-states.md) - Application of design system
- [Interaction Principles](06e-interaction-principles.md) - Interaction specifications
- [Enhanced Design System.md](../../Enhanced%20Design%20System.md) - Complete design system reference
