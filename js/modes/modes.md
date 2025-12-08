3 modes: Regular / Blogs / Shoppables

## Regular Mode

Regular mode is the default output of the converter. It produces the formatted version after processing through: convert → sanitize → clean → format.

## Blogs Mode

Blogs mode has special formatting requirements that differ from Regular mode.

### 0. Heading Formatting

All headings (`<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`) must have their content wrapped in `<strong>` tags.

**Regular output format:**
```html
<h2>Key Takeaways:</h2>
<h3>Power Smoothie (20–25g)</h3>
```

**Blogs output format:**
```html
<h2><strong>Key Takeaways:</strong></h2>
<h3><strong>Power Smoothie (20–25g)</strong></h3>
```

### 1. Key Takeaways Section

The Key Takeaways section should not use italic (`<em>`) tags.

**Regular output format (the formatted output):**

```html
<h2><em>Key Takeaways:</em></h2>
<ul>
  <li><em><strong>Lower Long-Term Costs: </strong>Waterproof menus crafted from military-grade polymers significantly reduce replacement frequency, leading to lower long-term costs compared to traditional laminated options.</em></li>
  <li><em><strong>Improved Operational Efficiency: </strong>The initial investment in waterproof synthetic menus pays off with reduced labor for maintenance, decreased downtime, and streamlined operational efficiency over five years.</em></li>
  <li><em><strong>Enhanced Brand Perception: </strong>Embracing durable, waterproof menu materials enhances brand perception, providing guests with a consistent, high-quality dining experience that boosts long-term brand loyalty.</em></li>
</ul>
```

**Blogs output format:**

```html
<h2><strong>Key Takeaways:</strong></h2>
<ul>
    <li><strong>Lower Long-Term Costs:</strong> Waterproof menus crafted from military-grade polymers significantly reduce replacement frequency, leading to lower long-term costs compared to traditional laminated options.</li>
    <li><strong>Improved Operational Efficiency:</strong> The initial investment in waterproof synthetic menus pays off with reduced labor for maintenance, decreased downtime, and streamlined operational efficiency over five years.</li>
    <li><strong>Enhanced Brand Perception:</strong> Embracing durable, waterproof menu materials enhances brand perception, providing guests with a consistent, high-quality dining experience that boosts long-term brand loyalty.</li>
</ul>
```

**Rules:**
- No `<em>` tags in Key Takeaways section
- The "Key Takeaways" heading must always end with a colon (e.g., "Key Takeaways:")

### 2. Remove H1 Tags Under Key Takeaways Section

Any `<h1>` tag that appears immediately after the Key Takeaways section should be removed.

**Regular output format:**

```html
<h2><em>Key Takeaways:</em></h2>
<ul>
  <li><em><strong>Lower Long-Term Costs: </strong>Waterproof menus crafted from military-grade polymers significantly reduce replacement frequency, leading to lower long-term costs compared to traditional laminated options.</em></li>
  <li><em><strong>Improved Operational Efficiency: </strong>The initial investment in waterproof synthetic menus pays off with reduced labor for maintenance, decreased downtime, and streamlined operational efficiency over five years.</em></li>
  <li><em><strong>Enhanced Brand Perception: </strong>Embracing durable, waterproof menu materials enhances brand perception, providing guests with a consistent, high-quality dining experience that boosts long-term brand loyalty.</em></li>
</ul>
<h1>How Waterproof Menus Save Restaurants Money: 5-Year TCO Analysis</h1>
```

**Blogs output format:**

```html
<h2><strong>Key Takeaways:</strong></h2>
<ul>
    <li><strong>Lower Long-Term Costs:</strong> Waterproof menus crafted from military-grade polymers significantly reduce replacement frequency, leading to lower long-term costs compared to traditional laminated options.</li>
    <li><strong>Improved Operational Efficiency:</strong> The initial investment in waterproof synthetic menus pays off with reduced labor for maintenance, decreased downtime, and streamlined operational efficiency over five years.</li>
    <li><strong>Enhanced Brand Perception:</strong> Embracing durable, waterproof menu materials enhances brand perception, providing guests with a consistent, high-quality dining experience that boosts long-term brand loyalty.</li>
</ul>
```

**Note:** The H1 tag that was under Key Takeaways section has been removed.

### 3. Link Attributes

All links (`<a>` tags) must include the attributes: `target="_blank" rel="noopener noreferrer"`

**Regular output format:**

```html
<a href="https://www.terraslate.com/blogs/news/waterproof-paper-making-your-last-will-last-forever">Waterproof Paper: Making Your Last Will Last Forever</a>
```

**Blogs output format:**

```html
<a href="https://www.terraslate.com/blogs/news/waterproof-paper-making-your-last-will-last-forever" target="_blank" rel="noopener noreferrer">Waterproof Paper: Making Your Last Will Last Forever</a>
```

### 4. Spacing Rules

Add `<p>&nbsp;</p>` (non-breaking space paragraph) in the following locations:

1. **After Key Takeaways section:** Add `<p>&nbsp;</p>` immediately after the closing `</ul>` tag of the Key Takeaways list.

2. **Before headings:** Add `<p>&nbsp;</p>` before every heading (`<h1>`, `<h2>`, `<h3>`, etc.) EXCEPT:
   - The "Key Takeaways" heading itself (no spacing before)
   - The first question heading under the FAQ section (no spacing before)

3. **Before "Read also:" / "Read more:" / "See more:" sections:** Add `<p>&nbsp;</p>` before these sections (only if they exist in the document). The exact text may vary (e.g., "Read also:", "Read more:", "See more:"), but the pattern should be recognized.

4. **Before "Sources:" section:** Add `<p>&nbsp;</p>` before the "Sources:" section (only if it exists in the document).

5. **Before "Disclaimer:" section:** Add `<p>&nbsp;</p>` before the "Disclaimer:" section (only if it exists in the document).

6. **Before "Alt Image Text:" paragraphs:** Add `<p>&nbsp;</p>` before any paragraph containing "Alt Image Text:" text.

**Regular output format example:**

```html
<h2><em>Key Takeaways:</em></h2>
<ul>
  <li><em><strong>Lower Long-Term Costs: </strong>Waterproof menus crafted from military-grade polymers significantly reduce replacement frequency, leading to lower long-term costs compared to traditional laminated options.</em></li>
  <li><em><strong>Improved Operational Efficiency: </strong>The initial investment in waterproof synthetic menus pays off with reduced labor for maintenance, decreased downtime, and streamlined operational efficiency over five years.</em></li>
  <li><em><strong>Enhanced Brand Perception: </strong>Embracing durable, waterproof menu materials enhances brand perception, providing guests with a consistent, high-quality dining experience that boosts long-term brand loyalty.</em></li>
</ul>
<h1>How Waterproof Menus Save Restaurants Money: 5-Year TCO Analysis</h1>
<p>Waterproof menus change the equation for restaurants...</p>
<h2>Understanding Menu Lifespan and Cost of Ownership</h2>
```

**Blogs output format example:**

```html
<h2><strong>Key Takeaways:</strong></h2>
<ul>
    <li><strong>Lower Long-Term Costs:</strong> Waterproof menus crafted from military-grade polymers significantly reduce replacement frequency, leading to lower long-term costs compared to traditional laminated options.</li>
    <li><strong>Improved Operational Efficiency:</strong> The initial investment in waterproof synthetic menus pays off with reduced labor for maintenance, decreased downtime, and streamlined operational efficiency over five years.</li>
    <li><strong>Enhanced Brand Perception:</strong> Embracing durable, waterproof menu materials enhances brand perception, providing guests with a consistent, high-quality dining experience that boosts long-term brand loyalty.</li>
</ul>
<p>&nbsp;</p>
<p>Waterproof menus change the equation for restaurants...</p>
<p>&nbsp;</p>
<h2><strong>Understanding Menu Lifespan and Cost of Ownership</strong></h2>
<p>A menu's durability goes far beyond appearance...</p>
<p>&nbsp;</p>
<h3><strong>Hidden Costs of Traditional Menus</strong></h3>
<p>Paper menus may seem affordable initially...</p>
<p>&nbsp;</p>
<p><em>Alt Image Text: TasteAI Menu Engineer</em></p>
<p><a href="https://form.asana.com/?k=RWA5WE0M-RM3rDlEGXHW7g&amp;d=420654990081002" target="_blank" rel="noopener noreferrer">https://form.asana.com/?k=RWA5WE0M-RM3rDlEGXHW7g&amp;d=420654990081002</a></p>
<p>&nbsp;</p>
<h2><strong>The Hidden Costs of Traditional Paper and Lamination</strong></h2>
...
<p>&nbsp;</p>
<p><strong>Read also:</strong></p>
<ul>
    <li><a href="https://www.terraslate.com/blogs/news/waterproof-paper-making-your-last-will-last-forever" target="_blank" rel="noopener noreferrer">Waterproof Paper: Making Your Last Will Last Forever</a></li>
    ...
</ul>
<p>&nbsp;</p>
<h2><strong>Frequently Asked Questions About Restaurant Menu Costs</strong></h2>
<h3><strong>What is a waterproof menu?</strong></h3>
<p>A waterproof menu is printed on synthetic paper...</p>
<p>&nbsp;</p>
<h3><strong>How do waterproof menus differ from traditional paper menus?</strong></h3>
...
<p>&nbsp;</p>
<p><strong><em>Sources:</em></strong></p>
<ol>
    <li><em>TerraSlate. (2025, September)...</em></li>
</ol>
```

## Shoppables Mode

Shoppables mode uses the same formatting as Blogs mode, but with the following differences:

**Included features (same as Blogs):**
- Heading formatting: All headings must have their content wrapped in `<strong>` tags
- Link attributes: All links must include `target="_blank" rel="noopener noreferrer"`

**Excluded features (different from Blogs):**
- Key Takeaways formatting: Does NOT remove `<em>` tags from Key Takeaways section
- H1 removal: Does NOT remove H1 tags under Key Takeaways section
- Spacing rules: Does NOT add any `<p>&nbsp;</p>` spacing elements

**Note:** Create a separate utility file for each functionality (e.g., one for Key Takeaways formatting, one for link attributes, one for spacing, one for H1 removal, etc.).
