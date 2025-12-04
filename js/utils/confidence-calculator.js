/**
 * Confidence Calculator for Shopify Blogs Mode
 * Uses threshold-based system: meeting core requirements = 100%
 * Checks structural quality and processing accuracy
 */

/**
 * Calculate confidence score for Shopify Blogs conversion
 * @param {string} html - The processed HTML
 * @returns {number} Confidence score (0-100)
 */
export function calculateShopifyBlogsConfidence(html) {
  if (!html || typeof html !== 'string') {
    return 0;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Core Requirements Checklist
  const coreRequirements = {
    hasKeyTakeaways: false,
    hasFAQ: false,
    hasProperHeaders: false,
    hasNoEmptyHeaders: false,
    hasWellFormedLists: false,
    hasValidLinks: false,
    hasValidSources: false,
    hasProperSpacing: false,
    hasCleanFormatting: false,
  };

  let metRequirements = 0;
  const totalRequirements = Object.keys(coreRequirements).length;

  // 1. Check for Key Takeaways Section
  const allHeaders = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  coreRequirements.hasKeyTakeaways = allHeaders.some(h => 
    /key\s+takeaways?|main\s+points?|highlights?|summary/i.test(h.textContent.trim())
  );
  if (coreRequirements.hasKeyTakeaways) metRequirements++;

  // 2. Check for FAQ Section
  coreRequirements.hasFAQ = allHeaders.some(h => 
    /frequently\s+asked\s+questions?|faq|common\s+questions?/i.test(h.textContent.trim())
  );
  if (coreRequirements.hasFAQ) metRequirements++;

  // 3. Check for Proper Header Hierarchy (H2 and H3)
  const hasH2 = allHeaders.some(h => h.tagName === 'H2');
  const hasH3 = allHeaders.some(h => h.tagName === 'H3');
  coreRequirements.hasProperHeaders = hasH2 && hasH3;
  if (coreRequirements.hasProperHeaders) metRequirements++;

  // 4. Check for No Empty Headers
  const emptyHeaders = allHeaders.filter(h => h.textContent.trim() === '');
  coreRequirements.hasNoEmptyHeaders = emptyHeaders.length === 0;
  if (coreRequirements.hasNoEmptyHeaders) metRequirements++;

  // 5. Check for Well-Formed Lists
  const lists = doc.querySelectorAll('ul, ol');
  if (lists.length > 0) {
    const validLists = Array.from(lists).filter(list => {
      const items = list.querySelectorAll('li');
      return items.length > 0;
    });
    coreRequirements.hasWellFormedLists = validLists.length === lists.length;
  } else {
    // If no lists, consider this requirement met (not all blogs need lists)
    coreRequirements.hasWellFormedLists = true;
  }
  if (coreRequirements.hasWellFormedLists) metRequirements++;

  // 6. Check for Valid Links
  const links = doc.querySelectorAll('a');
  if (links.length > 0) {
    const validLinks = Array.from(links).filter(a => {
      const href = a.getAttribute('href');
      return href && href.trim() !== '' && href !== '#';
    });
    // Require at least 80% of links to be valid
    coreRequirements.hasValidLinks = validLinks.length >= (links.length * 0.8);
  } else {
    // If no links, consider this requirement met
    coreRequirements.hasValidLinks = true;
  }
  if (coreRequirements.hasValidLinks) metRequirements++;

  // 7. Check for Sources/References Section (Optional - auto-pass if not present)
  const allParagraphs = doc.querySelectorAll('p');
  const hasSourcesSection = Array.from(allParagraphs).some(p => {
    const text = p.textContent.trim().toLowerCase();
    return /^(sources?|references?|bibliography|works?\s+cited|citations?)$/i.test(text);
  });
  
  if (hasSourcesSection) {
    // If Sources section exists, check it's followed by a list or ordered list
    const sourcesElement = Array.from(allParagraphs).find(p => {
      const text = p.textContent.trim().toLowerCase();
      return /^(sources?|references?|bibliography|works?\s+cited|citations?)$/i.test(text);
    });
    
    if (sourcesElement) {
      let nextElement = sourcesElement.nextElementSibling;
      // Skip spacers
      while (nextElement && nextElement.tagName === 'P' && /^[\s\u00A0]*$/.test(nextElement.textContent)) {
        nextElement = nextElement.nextElementSibling;
      }
      // Check if followed by list
      const isFollowedByList = nextElement && (nextElement.tagName === 'UL' || nextElement.tagName === 'OL');
      coreRequirements.hasValidSources = isFollowedByList;
    }
  } else {
    // If no Sources section, auto-pass (not all blogs need sources)
    coreRequirements.hasValidSources = true;
  }
  if (coreRequirements.hasValidSources) metRequirements++;

  // 8. Check Paragraph Spacing Quality
  const paragraphs = doc.querySelectorAll('p');
  if (paragraphs.length > 0) {
    const spacers = Array.from(paragraphs).filter(p => {
      const text = p.textContent.trim();
      return text === '' || text === '\u00A0' || /^[\s\u00A0]+$/.test(text);
    });
    const spacerRatio = spacers.length / paragraphs.length;
    
    // Good spacing: 5-60% of paragraphs are spacers
    // Shopify Blogs intentionally adds many spacers for readability
    // Too few = poor readability, too many (>60%) = excessive spacing
    coreRequirements.hasProperSpacing = spacerRatio >= 0.05 && spacerRatio <= 0.60;
  } else {
    coreRequirements.hasProperSpacing = true; // No paragraphs = auto-pass
  }
  if (coreRequirements.hasProperSpacing) metRequirements++;

  // 9. Check for Clean Formatting (no broken HTML, proper superscripts, etc.)
  const hasProblematicPatterns = html.includes('<p></p>') || // Empty paragraphs
                                  html.includes('<h2></h2>') || // Empty headers
                                  html.includes('<h3></h3>') ||
                                  /\s{3,}&nbsp;/.test(html) || // Multiple spaces before nbsp
                                  /<p>\s*<\/p>/.test(html); // Whitespace-only paragraphs (not spacers)
  
  // Check for proper superscript tags (if any superscripts exist)
  const hasSuperscript = html.includes('<sup>') || html.includes('</sup>');
  let properSuperscripts = true;
  if (hasSuperscript) {
    // Check that all <sup> tags are properly closed
    const supOpen = (html.match(/<sup>/g) || []).length;
    const supClose = (html.match(/<\/sup>/g) || []).length;
    properSuperscripts = supOpen === supClose;
  }
  
  coreRequirements.hasCleanFormatting = !hasProblematicPatterns && properSuperscripts;
  if (coreRequirements.hasCleanFormatting) metRequirements++;

  // Threshold Logic: If all core requirements met = 100%
  if (metRequirements === totalRequirements) {
    return 100;
  }

  // Otherwise, calculate proportional score
  // Give partial credit for each requirement met
  const baseScore = Math.round((metRequirements / totalRequirements) * 100);
  
  // Ensure confidence is between 0 and 100
  return Math.max(0, Math.min(100, baseScore));
}

/**
 * Get confidence level description
 * @param {number} score - Confidence score (0-100)
 * @returns {string} Description of confidence level
 */
export function getConfidenceDescription(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 50) return 'Moderate';
  return 'Needs Review';
}

