# Interaction Principles

> **Part of:** [User Experience & Design](../README.md) | **Previous:** [Visual Design System](06d-visual-design-system.md) | **Next:** [Edge Cases for Design](06f-edge-cases-design.md)
> 
> **Reference:** See [Visual Design System](06d-visual-design-system.md) for detailed interaction specifications.

---

# Interaction Principles

- **Instant Feedback:** Show processing state immediately as user types (debounced)
  - Processing indicator: 8-24px spinner, accent color, pulse 2s ease-in-out
  - Status message: Fade-in 300ms, appears 400ms after input stops
  - Timing: 200ms ease-out-cubic for visual feedback

- **Real-Time Updates:** Results update automatically when content or settings change
  - Smooth transitions: 300ms ease-out-cubic for content updates
  - No jarring changes: Use opacity and transform for smooth transitions
  - Maximum 3-4 simultaneous animations per viewport

- **Clear Actions:** Primary action (Copy) should be obvious and accessible
  - Primary button: Gradient background, accent shadow, 8px larger than secondary
  - Hover state: Scale 1.02, background fade to accent 10% opacity, 200ms ease-out-cubic
  - Click feedback: Scale to 0.98 then back to 1.0, ripple effect in accent color, 300ms ease-in-out
  - Minimum height: 24px taller than surrounding text line-height

- **Preview Toggle:** Icon-only button for switching between code and preview views, clearly indicates current view state
  - Icon: 24px size, 1.5px stroke, accent color
  - Hover: Scale 1.02, background fade to accent 10% opacity, 200ms ease-out-cubic
  - Focus: 2px solid ring, accent at 40% opacity, 2px offset
  - Keyboard accessible: Tab navigation, Enter/Space to toggle

- **Error Recovery:** Always provide a way to retry or go back
  - Error styling: #D4A574 (muted amber) text at 90% opacity, 1.5px border at 50% opacity
  - Error animation: Fade-in 300ms, appears 400ms after validation fails
  - Icon: Left of message, accent color
  - Clear retry action: Secondary button style with accent border

- **Accessibility:** Keyboard navigation, screen reader support, high contrast mode, preview toggle should be keyboard accessible
  - Focus indicators: 2px solid ring, accent color at 40% opacity, 2px offset, 3:1 contrast minimum
  - Focus-visible only: Not shown on mouse click, only keyboard navigation
  - Tab order: Follows visual hierarchy
  - Screen readers: Semantic HTML, proper ARIA labels, all icons labeled
  - Reduced motion: All animations respect `prefers-reduced-motion`, provide static alternatives

- **Mobile Responsive:** Tool should work on tablets and mobile devices (P1)
  - Touch targets: Minimum 48px height for all interactive elements
  - Spacing: 24px component padding (mobile), 32px (tablet), 48px (desktop)
  - Gestures: Swipe support for off-canvas menus (if applicable)
  - Spring physics: Stiffness 300, damping 30 for mobile interactions

- **SEO Optimized:** Proper heading hierarchy, semantic HTML, keyword placement
  - Typography hierarchy: One H1 maximum per page, maximum 2-3 heading levels per section
  - Semantic structure: Proper HTML5 elements, ARIA labels where needed

---

**See also:**
- [User Flow](06a-user-flow.md) - User journey
- [Visual Design System](06d-visual-design-system.md) - Design specifications
