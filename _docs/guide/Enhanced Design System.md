# Enhanced Design System – "Intentional Minimalism"

## Project Brief: Minimalist Pale-Color Website with Deliberate Design Principles

### 1. Visual Style – "Warm Quiet Minimalism"

| Aspect | Specification | Rationale / Examples |
|--------|---------------|---------------------|
| **Color Palette** | Pale, warm-leaning desaturated tones with personality. <br> • Primary Background: #FAF8F5 (warm cream) <br> • Secondary: #F0EDE8 (warm greige) <br> • Accent Pool (rotate per component): <br>   – Warm Taupe: #C9A88F <br>   – Dusty Teal: #A8BCBC <br>   – Terracotta Dust: #D4B5A8 <br>   – Sage Frost: #9FB8AD <br>   – Lavender Mist: #BFA8C9 <br>   – Moss Pale: #B8C9A8 <br>   – Warm Sand: #C9B8A8 <br>   – Powder Blue: #A8B8C9 <br>   – Dusty Rose: #C9A8B8 <br> • Text Primary: #2C2C2C <br> • Text Secondary: #5A5A5A | Avoid pure grays. Each accent has 20-25% saturation, 75-85% lightness. Use gradients (135° diagonal) between two adjacent accent colors for depth. |
| **Typography** | One sans-serif family (Inter, Satoshi, or Manrope) in 3 weights: Regular (400), Medium (500), Semi-bold (600). <br> Base size 16 px, scale 1.25 (minor third). <br> Line-height 1.65 for body, 1.2 for headings. | H1: 52-56px / Semi-bold / -0.03em tracking <br> H2: 32-36px / Semi-bold / -0.02em tracking <br> H3: 20-24px / Medium / -0.01em tracking <br> Body: 16-17px / Regular / 0em tracking <br> Caption: 13-14px / Regular |
| **Whitespace** | Systematic spacing based on 8px grid. <br> Micro: 4-16px (padding, gaps) <br> Macro: 48-96px (section breaks) <br> Sacred: 128px+ (page dividers) <br> Desktop gutters: 48px <br> Mobile gutters: 24px | For every 100px of content, provide minimum 80px surrounding whitespace. Alternate section density: 60/40 content/space, then 30/70. |
| **Imagery** | Minimal use. Duotone overlays with accent colors at 15% opacity. <br> Hero images max 1 per page, WebP format, 1920×1080px max. | Focus remains on content. Images support, never dominate. |
| **UI Elements** | Soft, dimensional approach: <br> • Borders: 0.5-1.5px, accent color at 30-40% opacity <br> • Border-radius: 6-8px (increased from 4px) <br> • Shadows: Colored, matching accent <br>   – Cards: `0 4px 16px [accent]30` <br>   – Modals: `0 8px 32px rgba(0,0,0,0.06)` <br> • Glassmorphism: `backdrop-filter: blur(8-16px)` on overlays | Depth through transparency and blur, not hard shadows. |

---

### 2. Layout & Grid – "Golden Balance"

**Responsive Framework:**
- Mobile (< 640px): Single column, 24px gutters, full-width content
- Tablet (640-1023px): 2 columns, 32px gutters, 50/50 or 60/40 splits
- Desktop (≥ 1024px): 2-3 columns, 48px gutters, **golden ratio splits (61.8% / 38.2%)**
- Wide (≥ 1440px): Max container 1200px, centered

**Grid System:**
- 8px baseline grid for vertical rhythm
- All elements align to 48px horizontal grid for touch consistency
- Content max-width: 800px for readability
- Use CSS Grid with `auto-fit` and `minmax()` for fluid layouts

**Spacing Scale (8px base unit):**
4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128 px

**Vertical Rhythm:**
- Mobile: 24px between related elements, 64px between sections
- Tablet: 32px / 80px
- Desktop: 48px / 96px

---

### 3. Design Principles Application

#### **A. Alignment**
- **Baseline Grid:** All text, buttons, and components align to 8px vertical grid
- **Optical Alignment:** Icons positioned 1-2px higher than mathematical center
- **Text Alignment:** Flush-left, ragged-right for body text; centered only for hero headlines
- **Touch Grid:** All interactive elements align to 48px horizontal grid for consistent tap targets

#### **B. Balance**
- **Asymmetric Layouts:** Use golden ratio (61.8% / 38.2%) for 2-column splits
- **Visual Weight:** Accent colors occupy 10-15% of viewport maximum
- **Alternating Sections:** Hero sections alternate 40/60 whitespace/content placement (left/right)
- **Interaction Balance:** If hover adds underline, click should not add additional visual weight

#### **C. Hierarchy**

**Size + Weight Matrix:**
| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| H1 | 52-56px | Semi-bold (600) | Max 1 per page, page title only |
| H2 | 32-36px | Semi-bold (600) | Section breaks |
| H3 | 20-24px | Medium (500) | Sub-sections |
| Body | 16-17px | Regular (400) | Primary content |
| Caption | 13-14px | Regular (400) | Metadata, disclaimers |

**Z-Index Scale:**
- Base content: 0
- Sticky navigation: 100
- Modals/Overlays: 1000
- Tooltips: 1100

**Component Hierarchy:**
- Primary CTA: 8px larger than secondary in same group
- One H1 maximum per page
- Maximum 2-3 heading levels per section

#### **D. Contrast**

**Luminance Contrast:**
- Active state: 15% darker than resting state
- Disabled state: 40% opacity maximum
- WCAG AA minimum: 4.5:1 for normal text, 3:1 for large text

**Size Contrast:**
- Buttons minimum 24px taller than surrounding text line-height
- Primary elements 1.5× minimum scale of surrounding elements

**Color Contrast:**
- One focal element per viewport at full saturation (25%)
- All supporting elements at 15% saturation
- Accent colors used sparingly (10-15% of viewport)

**Texture Contrast:**
- Flat backgrounds only
- Use borders/shadows for elevation, not decoration
- Glassmorphism for layers (blur + transparency)

#### **E. Emphasis**

**4-Tier Emphasis System (in order of priority):**
1. **Position:** Top-left for LTR, 70% viewport height for above-fold content
2. **Scale:** 1.5× surrounding elements minimum
3. **Color:** Accent vs. neutral distinction
4. **Motion:** Only primary CTA animates on page load

**Rules:**
- Maximum 2 emphasized elements per viewport
- If conflict occurs, position hierarchy wins
- Scroll-revealed elements = secondary emphasis, 80ms delay between each
- Never use more than one animation type per element

#### **F. Movement**

**Choreography Rules:**
- **Stagger:** 80ms delay per element in sequence (max 5 elements)
- **Exit Speed:** 40% faster than entrance animations (e.g., 300ms in, 180ms out)
- **Direction:** Diagonal movement at 30° angle, never straight vertical
- **Distance:** Desktop 12px max translation, Mobile 24px

**Movement Personality:**
- Desktop: Subtle, refined (ease-out-cubic)
- Mobile: Confident, responsive (spring physics)

**Performance:**
- Only animate `transform` and `opacity`
- Use `will-change: transform` during animation only
- Limit to 3-4 simultaneous animations per viewport

**Parallax Rules:**
- Only on non-critical content (backgrounds, decorative elements)
- Never on text or CTAs
- Speed: 0.3× scroll speed

#### **G. Rhythm**

**Spacing Rhythm Formula:**
- Between related items: 16-24px
- Between component groups: 32-48px
- Between sections: 96px (desktop) / 64px (mobile)
- Card grid gaps: 32px (creates visual "beat")

**Typographic Rhythm:**
- Line-height: 1.65 for body (creates 10.4px extra per line on 16px text)
- Paragraph spacing: 24px (1.5× line-height minimum)
- Heading spacing: 48px before, 24px after

**Sectional Rhythm:**
- Alternate dense/sparse sections
- Pattern: 60/40 content/whitespace, then 30/70, repeat
- Creates visual breathing pattern

#### **H. Whitespace (Intentional Emptiness)**

**Three Types:**
1. **Micro (4-16px):** Element padding, line spacing, icon gaps
2. **Macro (48-96px):** Section breathing room, component separation
3. **Sacred (128px+):** Page breaks, mental resets, full-width gaps

**Rules:**
- For every 100px of content, minimum 80px of surrounding whitespace
- Mobile: Reduce macro by 33%, never reduce micro
- Negative space guides eye path—map user journey through whitespace flow
- Empty areas are content, not absence of content

**Application:**
- Desktop: 48px component padding, 96px section padding
- Tablet: 32px component, 80px section
- Mobile: 24px component, 64px section

#### **I. Unity**

**Design Token System:**
- **Border-radius:** 6-8px everywhere (buttons, cards, inputs, badges)
- **Shadow depth:** Only one value per elevation level
  - Cards: `0 4px 16px [accent]30`
  - Elevated: `0 8px 32px rgba(0,0,0,0.06)`
- **Animation easing:** `cubic-bezier(0.25, 0.8, 0.25, 1)` site-wide
- **Blur amount:** 8px (UI elements) or 16px (modals/overlays)

**Component DNA:**
Every component uses:
- One accent color from palette
- 6-8px border-radius
- 16-24px internal padding (based on size)
- `ease-out-cubic` or spring physics for animation
- Colored shadow matching accent

**Illustration Consistency:**
- All SVGs: 1.2px stroke weight
- Rounded line caps and joins
- Accent color from palette
- No fills (stroke only)
- Max 120×80px dimensions

**Hover State Formula:**
- Always include opacity change (0.6 → 1.0)
- Plus one other property: `transform` OR `background` OR `border`
- Never more than two properties
- 200-300ms duration

---

### 4. Interaction & Micro-UX

| Trigger | Expected Behavior | Timing / Easing |
|---------|------------------|----------------|
| **Hover (links, buttons)** | • Underline slides in from left OR <br> • Background fade to accent 10% opacity <br> • Scale 1.02 (buttons only) | 200ms ease-out-cubic |
| **Click/Tap** | • Ripple effect in accent color (0% → 15% opacity, radius 150% of click point) <br> • Scale to 0.98 then back to 1.0 <br> • Page transition: 300ms fade | 300ms ease-in-out |
| **Scroll** | • Parallax at 0.3× speed on backgrounds only <br> • Elements fade + translateY(-16px) when 70% in viewport <br> • 80ms stagger between element reveals <br> • Progress bar (4px height, accent gradient) fixed top | cubic-bezier(0.25, 0.8, 0.25, 1) |
| **Form Fields** | • Label floats above on focus (16px → 13px font) <br> • Border color: neutral → full accent <br> • Inline validation icons appear 400ms after input stops | 300ms ease-out-quart |
| **Mobile Gestures** | • Swipe to open/close off-canvas menu <br> • Spring physics: stiffness 300, damping 30 | — |

**State Specifications:**

**Focus States:**
- 2px solid ring, accent color at 40% opacity, 2px offset
- Focus-visible only (not on mouse click)
- 3:1 contrast minimum for indicators

**Error States:**
- Text: #D4A574 (muted amber) at 90% opacity
- Borders: 1.5px solid #D4A574 at 50% opacity
- Icon left of message, fade-in 300ms, appears 400ms after validation fails

**Loading States:**
- Skeleton screens: accent color at 40% opacity, pulse 2s ease-in-out
- Button loading: 8px spinner (accent), maintains button dimensions
- Progress bar indicates page navigation

**Disabled States:**
- 40% opacity
- Cursor: not-allowed
- No hover effects

---

### 5. Component Inventory

**Core Components:**

**Navigation**
- Sticky header: 64px height, glassmorphism background
- Hamburger menu: < 768px, spring animation
- Off-canvas drawer: blur(16px) backdrop, slide-in 300ms

**Buttons**
- Primary: Gradient background, accent shadow, 18px padding
- Secondary: Transparent with accent border (1.5px)
- Text: No background, accent color, underline on hover
- Loading: Spinner replaces text, maintains dimensions
- Border-radius: 8px, Font-weight: 600 (primary), 500 (secondary)

**Form Inputs**
- Height: 48px minimum (touch-friendly)
- Padding: 16px horizontal
- Border: 1.5px, accent at 40% opacity, full on focus
- Label: Floating, 13px when focused/filled
- Validation: Inline, 400ms delay

**Cards**
- Background: rgba(255,255,255,0.7) + blur(12px)
- Border: 1.5px solid accent at 40% opacity
- Shadow: `0 4px 16px [accent]30`
- Padding: 32px
- Border-radius: 8px
- Hover: translateY(-6px), enhanced shadow

**Modals/Dialogs**
- Backdrop: rgba(0,0,0,0.4) + blur(8px)
- Container: white with 1px accent border
- Padding: 48px
- Max-width: 600px
- Shadow: `0 8px 32px rgba(0,0,0,0.06)`
- Entrance: scale(0.95) + opacity, 300ms

**Badges/Tags**
- Padding: 6px 16px
- Border-radius: 20px (pill shape)
- Background: accent gradient at 30% opacity
- Border: 0.5px solid accent at 40%
- Font: 13px Medium

**Progress Indicators**
- Scroll: 4px height, accent gradient, fixed top
- Loading spinner: 8-24px diameter, accent color, 1.5px stroke
- Skeleton: Accent at 40%, pulse animation 2s

**Icon System**
- Stroke: 1.5px weight, rounded caps/joins
- Sizes: 16px (inline), 20px (buttons), 24px (standalone)
- Color: Accent from palette
- Padding: 2px for touch targets (actual size +4px)
- Library: Feather Icons or custom matching illustration style

---

### 6. Accessibility & Performance

**Accessibility:**
- WCAG AA compliance: 4.5:1 for normal text, 3:1 for large/icons
- Focus indicators: 3:1 contrast minimum
- All animations respect `prefers-reduced-motion`
- Semantic HTML with proper ARIA labels
- Keyboard navigation for all interactive elements
- Skip links for main content

**Performance Targets:**
- LCP (Largest Contentful Paint): < 1.8s
- CLS (Cumulative Layout Shift): < 0.05
- FID (First Input Delay): < 100ms
- TTI (Time to Interactive): < 3.5s

**Browser Support:**
- Modern browsers (last 2 versions): Chrome, Firefox, Safari, Edge
- CSS Grid fallback: Flexbox for < 1024px
- View Transitions API: Graceful degradation to opacity fade
- Glassmorphism fallback: Solid background with slight transparency

**Asset Optimization:**
- Images: WebP with JPEG fallback, `loading="lazy"`
- Fonts: Variable fonts, subset to used characters, `font-display: swap`
- SVG: Inline for icons, optimized with SVGO
- Max image dimensions: Hero 1920×1080px, Thumbnails 400×400px

**Animation Performance:**
- Only animate `transform` and `opacity` (GPU-accelerated)
- Never animate `width`, `height`, `top`, `left` (layout triggers)
- Use `will-change: transform` only during animation
- Remove `will-change` after animation completes
- Maximum 3-4 simultaneous animations per viewport

---

### 7. SVG Illustrations – "Breathing Visuals"

**Visual Specifications:**
- Subjects: Simple human figures, hands, objects (person walking, hand waving, coffee cup)
- Style: Single-stroke (1.2px), no fill, rounded caps/joins
- Color: Accent from palette (rotate per illustration)
- Size: 80×120px maximum, inline SVG
- Usage: 1-2 per viewport maximum

**Animation – Subtle Life:**
| Trigger | Movement | Duration |
|---------|----------|----------|
| Page Load / Scroll-In (70%) | One gentle loop: arm sways ±4°, head tilts 3°, object subtle motion | 2-3s loop, ease-in-out |
| Hover / Tap | Pause loop → tiny nod (scale 1.03 or rotate ±2°) → resume | 400ms spring |

**Rules:**
- No stroke draw-on effects
- No color shifts, pulse, or bounce
- Loop is calm, repetitive, ignorable (like breathing)
- Pause on `prefers-reduced-motion`
- `aria-hidden="true"` (decorative only)

---

### 8. Design Principles Checklist

Before finalizing any screen, verify:

- [ ] **Alignment:** Does everything sit on the 8px baseline grid?
- [ ] **Balance:** Is the golden ratio (61.8/38.2) applied to asymmetric layouts?
- [ ] **Hierarchy:** Are type sizes separated by ≥8px? Is there only one H1?
- [ ] **Contrast:** Is there one clear focal point at full saturation?
- [ ] **Emphasis:** Do only 1-2 elements dominate the viewport?
- [ ] **Movement:** Do animations serve function, not decoration?
- [ ] **Rhythm:** Is spacing consistent (16-24px items, 96px sections)?
- [ ] **Whitespace:** Is negative space 50%+ of viewport? Can I remove one more thing?
- [ ] **Unity:** Do all components share the same DNA (accent, 8px radius, spring easing)?

---

### 9. Deliverables

**Design Files:**
- High-fidelity Figma file with desktop, tablet, and mobile breakpoints
- Auto-layout and component variants for all states
- Interactive prototype demonstrating:
  - Click ripple effects
  - Scroll-reveal choreography
  - Hover states with color transitions
  - Form interactions with floating labels
  - Modal entrance/exit animations

**Documentation:**
- Style guide (colors, typography, spacing, component states)
- Component library with usage guidelines
- Design token JSON file for developer handoff
- Accessibility audit report

---

### 10. Philosophy Statement

**"Intentional Minimalism"**

*"If minimalism is the removal of excess, then intentional minimalism is what remains after you've removed one thing too many—and then put back only what earns its place through contrast, rhythm, and silence."*

**Think:** Japanese tearoom aesthetics meets sunset over sand dunes—pale warmth, soft light, one deliberate accent—translated into a digital interface where:
- Every pixel earns its place through the 9 design principles
- Every interaction feels like turning a page in a well-bound book
- Whitespace guides the eye as deliberately as content does
- Color whispers rather than shouts
- Movement suggests rather than demands attention

**Design with the question:** "Does this serve emphasis, hierarchy, or unity—or is it decoration?"

If decoration, remove it. If functional, refine it. If perfect, leave space around it.
