# Scroll Sync Feature

> **Date:** November 17, 2025  
> **Feature:** Bidirectional scroll synchronization between input and output panels

---

## 🎯 **What This Feature Does**

Synchronizes scrolling between the INPUT panel (rendered HTML) and OUTPUT panel (preview or code view) to help users visualize changes and compare content side-by-side.

### **Key Capabilities:**
- ✅ **Content-based synchronization** - Matches by actual HTML elements, not scroll percentage
- ✅ **Handles different heights** - Works even when INPUT has images and OUTPUT doesn't
- ✅ **Bidirectional** - Scrolling either panel syncs the other
- ✅ **Smart matching** - Uses heading text, paragraph snippets, and fuzzy matching
- ✅ **Fallback to percentage** - If content match fails, uses scroll percentage
- ✅ **Optional toggle** - Users can enable/disable as needed

---

## 💡 **Why This Feature Was Needed**

### Problem: Simple Percentage Sync Doesn't Work

When INPUT renders images but OUTPUT removes them:

```
INPUT Panel (with images):
├── H1: Title
├── <img> 500px tall          ← Takes up space
├── Paragraph 1
├── Paragraph 2
├── <img> 800px tall          ← Takes up space
└── Paragraph 3
Total height: 3000px

OUTPUT Panel (no images):
├── H1: Title
├── Paragraph 1               ← Images removed!
├── Paragraph 2
└── Paragraph 3
Total height: 1200px
```

**If using percentage sync:**
- User scrolls INPUT to 50% (1500px) → sees Paragraph 2
- OUTPUT syncs to 50% (600px) → sees Paragraph 1
- ❌ **They're looking at different content!**

### Solution: Content-Based Sync

Instead of syncing by scroll percentage, sync by actual content:
1. Identify which element is visible at top of source panel
2. Find matching element in target panel (by text content)
3. Scroll that element into view

✅ Both panels now show the same content, regardless of height differences!

---

## 🔧 **Implementation Details**

### **File Structure**

```
js/
├── features/
│   └── scroll-sync.js           ← NEW: Scroll sync logic
└── ui/
    └── converter-ui.js          ← UPDATED: Integration
index.html                       ← UPDATED: Added checkbox
```

### **Core Algorithm**

The scroll sync uses a **hybrid matching strategy**:

#### **1. Get Visible Element**
```javascript
function getElementAtTop(panel) {
  // Find h1, h2, h3, h4, h5, h6, p, li, blockquote at top of viewport
  // Returns the element currently visible at top
}
```

#### **2. Match by Content (3 Strategies)**

**Strategy 1: Match by Tag + Exact Text (for headings)**
```javascript
// For h1-h6 elements, match by tag name AND exact text
const candidates = targetPanel.querySelectorAll('h2');
for (const candidate of candidates) {
  if (candidate.textContent.trim() === sourceText) {
    return candidate; // Exact match found!
  }
}
```

**Strategy 2: Match by Text Snippet (first 50 chars)**
```javascript
// For any element, match by first 50 characters
const textSnippet = textContent.substring(0, 50);
const candidates = targetPanel.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li');
for (const candidate of candidates) {
  const candidateText = candidate.textContent.trim().substring(0, 50);
  if (candidateText === textSnippet) {
    return candidate; // Snippet match!
  }
}
```

**Strategy 3: Fuzzy Match (contains similar text)**
```javascript
// If text is long enough (> 20 chars), try fuzzy matching
if (textSnippet.length > 20) {
  for (const candidate of candidates) {
    if (candidate.textContent.includes(textSnippet.substring(0, 30))) {
      return candidate; // Fuzzy match!
    }
  }
}
```

#### **3. Scroll to Matched Element**
```javascript
if (matchingElement) {
  matchingElement.scrollIntoView({ 
    block: 'start', 
    behavior: 'smooth' 
  });
} else {
  // Fallback: percentage-based sync
  const percentage = sourcePanel.scrollTop / sourcePanel.scrollHeight;
  targetPanel.scrollTop = percentage * targetPanel.scrollHeight;
}
```

### **Sync Prevention (Avoid Infinite Loop)**

```javascript
let isSyncing = false; // Prevent infinite loop

function syncScroll(source, target) {
  if (!isEnabled || isSyncing) return;
  
  isSyncing = true;
  // ... perform sync ...
  
  setTimeout(() => {
    isSyncing = false;
  }, 100);
}
```

When INPUT scrolls → syncs OUTPUT → `isSyncing = true` → OUTPUT scroll event is ignored → no infinite loop!

---

## 🎨 **UI Integration**

### **Checkbox in Toolbar**

Added to the "Options" section:

```html
<label class="feature-checkbox">
  <input type="checkbox" id="scroll-sync">
  <span>Sync scrolling between panels</span>
</label>
```

### **Default State**

- ❌ **Disabled by default** (opt-in)
- Users can enable when they need side-by-side comparison
- Minimal performance impact when disabled

---

## 📊 **How It Works**

### **Example 1: Scrolling with Headings**

```
User scrolls INPUT → H2 "Key Features" at top

↓ Algorithm

1. getElementAtTop(INPUT) → finds H2 "Key Features"
2. findMatchingElement(OUTPUT, H2 "Key Features")
   → Searches OUTPUT for H2 with same text
   → Finds: <h2>Key Features</h2>
3. Scroll OUTPUT so H2 is at top

✅ Both panels now show "Key Features" section
```

### **Example 2: Scrolling with Paragraphs**

```
User scrolls INPUT → Paragraph starting "This is a great..."

↓ Algorithm

1. getElementAtTop(INPUT) → finds <p>This is a great...</p>
2. Extract text snippet: "This is a great tool for cle" (50 chars)
3. findMatchingElement(OUTPUT)
   → Searches OUTPUT for <p> with same first 50 chars
   → Finds matching paragraph
4. Scroll OUTPUT to that paragraph

✅ Both panels show same paragraph
```

### **Example 3: Content Not Found (Fallback)**

```
User scrolls INPUT → sees an image at top (removed from OUTPUT)

↓ Algorithm

1. getElementAtTop(INPUT) → finds <img> element
2. findMatchingElement(OUTPUT, IMG)
   → No IMG in OUTPUT (images removed)
   → Returns null
3. Fallback: use percentage sync
   scrollPercentage = INPUT.scrollTop / INPUT.scrollHeight
   OUTPUT.scrollTop = scrollPercentage * OUTPUT.scrollHeight

⚠️ Approximate sync (best effort)
```

---

## ✨ **Benefits**

### **1. Accurate Comparison**
- Users can see exactly what changed in the same section
- No confusion about which part they're looking at

### **2. Quality Control**
- Easily spot issues or verify cleaning worked correctly
- Compare input vs output for specific sections

### **3. Large Documents**
- Navigate long content more efficiently
- Stay oriented in both panels

### **4. Professional UX**
- Similar to IDE diff viewers
- Familiar pattern for developers and content editors

---

## 🧪 **Testing Scenarios**

### **Test 1: Headings Sync**

1. Paste HTML with multiple headings
2. Enable scroll sync
3. Scroll INPUT to H2 "Features"
4. **Expected:** OUTPUT scrolls to same H2

### **Test 2: Paragraphs Sync**

1. Paste HTML with many paragraphs
2. Enable scroll sync
3. Scroll INPUT to middle paragraph
4. **Expected:** OUTPUT shows same paragraph

### **Test 3: Images Present (INPUT only)**

1. Paste HTML with images
2. Enable scroll sync
3. Scroll INPUT past images
4. **Expected:** OUTPUT syncs to corresponding text (skips images)

### **Test 4: Preview Mode**

1. Enable preview toggle (rendered HTML)
2. Enable scroll sync
3. Scroll INPUT
4. **Expected:** Preview panel syncs to same content

### **Test 5: Bidirectional Sync**

1. Enable scroll sync
2. Scroll OUTPUT panel
3. **Expected:** INPUT scrolls to match

### **Test 6: Disable Sync**

1. Enable scroll sync
2. Scroll both panels (they sync)
3. Disable scroll sync
4. **Expected:** Scrolling is independent again

---

## 🔍 **Edge Cases Handled**

### **1. Multiple Identical Elements**

If same text appears multiple times:
- Uses first occurrence found
- Could be enhanced with position-based tiebreaker

### **2. Content Heavily Modified**

If OUTPUT HTML structure is very different from INPUT:
- Tries fuzzy matching
- Falls back to percentage sync

### **3. Empty Panels**

If INPUT or OUTPUT is empty:
- Sync is skipped gracefully
- No errors thrown

### **4. Very Short Content**

If content is < 10 characters:
- Skips snippet matching (too short to be reliable)
- Falls back to percentage

### **5. Preview Frame Loading**

When preview frame loads new content:
- Re-attaches scroll listeners to preview iframe body
- Sync continues working in preview mode

---

## 📝 **Files Modified**

### **1. `js/features/scroll-sync.js` (NEW - 220 lines)**

Complete scroll sync implementation:
- Content matching strategies
- Bidirectional sync handling
- Debounced scroll events
- Loop prevention logic

### **2. `js/ui/converter-ui.js` (UPDATED)**

**Added:**
- Import scroll-sync module
- Initialize scroll sync with panels
- Connect checkbox to enable/disable

**Changes:**
```javascript
// Import
import { initializeScrollSync } from '../features/scroll-sync.js';

// Initialization (in setupConverterUI)
const scrollSync = initializeScrollSync(inputDiv, outputCode, previewFrame);

scrollSyncCheckbox.addEventListener('change', (e) => {
  scrollSync.setEnabled(e.target.checked);
});
```

### **3. `index.html` (UPDATED)**

**Added:**
```html
<label class="feature-checkbox">
  <input type="checkbox" id="scroll-sync">
  <span>Sync scrolling between panels</span>
</label>
```

---

## 🚀 **Performance Considerations**

### **Debouncing**

Scroll events are debounced to 50ms:
```javascript
let scrollTimeout;
function debouncedScroll() {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(onScroll, 50);
}
```

This prevents excessive processing during fast scrolling.

### **Sync Lock**

The `isSyncing` flag prevents cascading scroll events:
- INPUT scrolls → syncs OUTPUT → `isSyncing = true`
- OUTPUT scroll event fires → ignored due to flag
- After 100ms → `isSyncing = false` → ready for next sync

### **Selective Element Queries**

Only queries relevant elements (h1-h6, p, li, blockquote):
```javascript
const elements = panel.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote');
```

Avoids processing every DOM node.

---

## 🎉 **Summary**

### **Feature Complete!**

- ✅ Content-based scroll synchronization
- ✅ Handles different panel heights (images in INPUT)
- ✅ Bidirectional sync (INPUT ↔ OUTPUT)
- ✅ Works with both code and preview modes
- ✅ Optional toggle (user control)
- ✅ Smart matching with fallback
- ✅ Performance optimized (debouncing, sync lock)
- ✅ No linter errors
- ✅ Clean, documented code

### **User Experience**

Users can now:
1. Enable "Sync scrolling between panels"
2. Scroll INPUT panel
3. OUTPUT automatically scrolls to same content
4. Compare input vs output side-by-side accurately
5. Navigate long documents efficiently

**This makes the Word to HTML Converter even more powerful for quality control and content comparison!** 🚀

