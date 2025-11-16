# User Flow

> **Part of:** [User Experience & Design](../README.md) | **Previous:** [Scope & Requirements](../05-scope-and-requirements.md) | **Next:** [Key Screens/States to Design](06b-key-screens-states.md)
> 
> **Reference:** See "User Experience & Design" section in [The Complete Guide to Writing Product Requirements Documents (PRDs).md](../../The%20Complete%20Guide%20to%20Writing%20Product%20Requirements%20Documents%20(PRDs).md#7-user-experience--design) for best practices.

---

## Entry Points

- Direct web app URL (GitHub Pages) (primary)
- JavaScript library inclusion (for developers)
- Browser bookmark/favorite

## Core Flow

```
[Landing Page] 
  → [Select Output Mode] 
  → [Paste HTML Content] 
  → [Optional: Display images in input preview (toggle); output remains image-free] 
  → [Instant Processing (as user types/pastes)] 
  → [Preview Results] 
  → [Adjust Optional Features (if needed)] 
  → [Copy/Download] 
  → [Success Confirmation]
```

**Note:** The cleaned output never includes images. If the "Display images in input preview" toggle is enabled (default: off), original images are shown in the input/rendered preview only; no `<img>` elements are emitted in the output.

## Alternative Flows

- JavaScript library call → Process → Return cleaned HTML

## Exit Points

- User copies HTML and leaves
- User downloads file and leaves
- User encounters error and retries or abandons

---

**See also:**
- [Key Screens/States to Design](06b-key-screens-states.md) - Detailed screen specifications
- [Interaction Principles](06e-interaction-principles.md) - How users interact with the tool
- [User Personas & Use Cases](../04-user-personas-and-use-cases.md) - Who uses these flows

