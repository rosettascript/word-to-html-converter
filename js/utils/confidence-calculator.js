/**
 * Confidence Calculator for Shopify Blogs Mode
 * Uses threshold-based system: meeting core requirements = 100%
 * Checks structural quality and processing accuracy
 */

/**
 * Calculate confidence score for Shopify Blogs conversion
 * @param {string} html - The processed HTML
 * @param {Object} options - Processing options (removeParagraphSpacers, etc.)
 * @returns {number} Confidence score (0-100)
 */
export function calculateShopifyBlogsConfidence(html, options = {}) {
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
    hasCorrectHeaderFormatting: false,
    hasCorrectLinkPaths: false,
  };

  let metRequirements = 0;
  const totalRequirements = Object.keys(coreRequirements).length;

  // 1. Check for Key Takeaways Section (in headers OR paragraphs)
  const allHeaders = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const allParagraphs = doc.querySelectorAll('p');
  
  const hasKeyTakeawaysInHeader = allHeaders.some(h => 
    /key\s+takeaways?|main\s+points?|highlights?|summary/i.test(h.textContent.trim())
  );
  
  const hasKeyTakeawaysInParagraph = Array.from(allParagraphs).some(p => {
    const text = p.textContent.trim();
    const hasStrongOrBold = p.querySelector('strong') || p.querySelector('b');
    return hasStrongOrBold && /^key\s+takeaways?:?$/i.test(text);
  });
  
  coreRequirements.hasKeyTakeaways = hasKeyTakeawaysInHeader || hasKeyTakeawaysInParagraph;
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
  // Links should have valid href attributes regardless of relative/absolute format
  // The removeDomain option is a user preference, not a quality metric
  const links = doc.querySelectorAll('a');
  if (links.length > 0) {
    const validLinks = Array.from(links).filter(a => {
      const href = a.getAttribute('href');
      // Valid link has non-empty href that's not just a hash
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

  // 8. Check Paragraph Spacing Quality (context-aware based on options)
  if (allParagraphs.length > 0) {
    const spacers = Array.from(allParagraphs).filter(p => {
      const text = p.textContent.trim();
      return text === '' || text === '\u00A0' || /^[\s\u00A0]+$/.test(text);
    });
    const spacerRatio = spacers.length / allParagraphs.length;
    
    // Adjust expectations based on removeParagraphSpacers option
    if (options.removeParagraphSpacers) {
      // When spacers are intentionally removed, low ratio is expected and good
      // Allow 0-10% spacers (only structural ones like after lists should remain)
      coreRequirements.hasProperSpacing = spacerRatio >= 0 && spacerRatio <= 0.10;
    } else {
      // When spacers are kept (default), expect healthy ratio for readability
      // Good spacing: 5-60% of paragraphs are spacers
      // Shopify Blogs intentionally adds many spacers for readability
      coreRequirements.hasProperSpacing = spacerRatio >= 0.05 && spacerRatio <= 0.60;
    }
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

  // 10. Check Header Formatting (context-aware based on strongInHeaders option)
  if (allHeaders.length > 0) {
    if (options.strongInHeaders) {
      // When option is ON: Headers should have <strong> tags
      const headersWithStrong = allHeaders.filter(h => {
        return h.querySelector('strong') || h.querySelector('b');
      });
      // Require at least 80% of headers to have strong tags
      coreRequirements.hasCorrectHeaderFormatting = headersWithStrong.length >= (allHeaders.length * 0.8);
    } else {
      // When option is OFF: Headers should NOT have <strong> tags
      const headersWithoutStrong = allHeaders.filter(h => {
        return !h.querySelector('strong') && !h.querySelector('b');
      });
      // Require at least 80% of headers to NOT have strong tags
      coreRequirements.hasCorrectHeaderFormatting = headersWithoutStrong.length >= (allHeaders.length * 0.8);
    }
  } else {
    coreRequirements.hasCorrectHeaderFormatting = true; // No headers = auto-pass
  }
  if (coreRequirements.hasCorrectHeaderFormatting) metRequirements++;

  // 11. Check Link Path Format (context-aware based on removeDomain option)
  if (links.length > 0) {
    if (options.removeDomain) {
      // When option is ON: Check that internal links were converted to relative
      // We can't perfectly detect "internal" vs "external" without knowing the original domain,
      // but we can check that SOME links are relative (indicating conversion happened)
      const relativeLinks = Array.from(links).filter(a => {
        const href = a.getAttribute('href');
        if (!href) return false;
        // Relative links start with / or are paths without protocol
        return /^\/[^\/]/.test(href) || (!/^(https?:)?\/\//i.test(href) && href !== '#');
      });
      
      // If removeDomain is enabled, expect at least SOME relative links (>0)
      // Unless all links are external, in which case auto-pass
      const absoluteLinks = Array.from(links).filter(a => {
        const href = a.getAttribute('href');
        return href && /^https?:\/\//i.test(href);
      });
      
      // If all links are absolute (external), auto-pass
      // Otherwise, require at least some relative links to confirm conversion worked
      coreRequirements.hasCorrectLinkPaths = (absoluteLinks.length === links.length) || (relativeLinks.length > 0);
    } else {
      // When option is OFF: Any link format is acceptable
      coreRequirements.hasCorrectLinkPaths = true;
    }
  } else {
    coreRequirements.hasCorrectLinkPaths = true; // No links = auto-pass
  }
  if (coreRequirements.hasCorrectLinkPaths) metRequirements++;

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

/**
 * Get detailed confidence analysis with improvement suggestions
 * @param {string} html - The processed HTML
 * @param {Object} options - Processing options
 * @returns {Object} Analysis object with score, level, failedRequirements, and suggestions
 */
export function getConfidenceAnalysis(html, options = {}) {
  if (!html || typeof html !== 'string') {
    return {
      score: 0,
      level: 'Needs Review',
      failedRequirements: [],
      suggestions: ['Invalid HTML input']
    };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const failed = [];
  const suggestions = [];
  
  // Check each requirement
  const allHeaders = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const allParagraphs = doc.querySelectorAll('p');
  
  // 1. Key Takeaways (check both headers and paragraphs)
  const hasKeyTakeawaysInHeader = allHeaders.some(h => 
    /key\s+takeaways?|main\s+points?|highlights?|summary/i.test(h.textContent.trim())
  );
  
  const keyTakeawaysParagraph = Array.from(allParagraphs).find(p => {
    const text = p.textContent.trim();
    const hasStrongOrBold = p.querySelector('strong') || p.querySelector('b');
    return hasStrongOrBold && /^key\s+takeaways?:?$/i.test(text);
  });
  
  if (!hasKeyTakeawaysInHeader && !keyTakeawaysParagraph) {
    failed.push('Key Takeaways');
    suggestions.push('Add a "Key Takeaways" section (preferably as an H2 header) at the beginning');
  } else if (!hasKeyTakeawaysInHeader && keyTakeawaysParagraph) {
    // Found in paragraph but not in header - passes but suggest improvement
    suggestions.push('⚠️ Best Practice: Convert "Key Takeaways" from paragraph to H2 header for better SEO and structure');
  }
  
  // 2. FAQ
  const hasFAQ = allHeaders.some(h => 
    /frequently\s+asked\s+questions?|faq|common\s+questions?/i.test(h.textContent.trim())
  );
  if (!hasFAQ) {
    failed.push('FAQ Section');
    suggestions.push('Add a "Frequently Asked Questions" section');
  }
  
  // 3. Header Hierarchy
  const hasH2 = allHeaders.some(h => h.tagName === 'H2');
  const hasH3 = allHeaders.some(h => h.tagName === 'H3');
  if (!hasH2 || !hasH3) {
    failed.push('Header Hierarchy');
    suggestions.push('Use both H2 and H3 headers for proper content structure');
  }
  
  // 4. No Empty Headers
  const emptyHeaders = allHeaders.filter(h => h.textContent.trim() === '');
  if (emptyHeaders.length > 0) {
    failed.push('Empty Headers');
    suggestions.push(`Remove or fill ${emptyHeaders.length} empty header(s)`);
  }
  
  // 5. Well-Formed Lists
  const lists = doc.querySelectorAll('ul, ol');
  if (lists.length > 0) {
    const invalidLists = Array.from(lists).filter(list => {
      const items = list.querySelectorAll('li');
      return items.length === 0;
    });
    if (invalidLists.length > 0) {
      failed.push('List Structure');
      suggestions.push(`Fix ${invalidLists.length} empty list(s) - add list items or remove empty lists`);
    }
  }
  
  // 6. Valid Links
  const links = doc.querySelectorAll('a');
  if (links.length > 0) {
    const invalidLinks = Array.from(links).filter(a => {
      const href = a.getAttribute('href');
      return !href || href.trim() === '' || href === '#';
    });
    if (invalidLinks.length >= (links.length * 0.2)) {
      failed.push('Invalid Links');
      suggestions.push(`Fix ${invalidLinks.length} link(s) with missing or invalid href attributes`);
    }
  }
  
  // 7. Sources
  const sourcesElement = Array.from(allParagraphs).find(p => {
    const text = p.textContent.trim().toLowerCase();
    return /^(sources?|references?|bibliography|works?\s+cited|citations?)$/i.test(text);
  });
  
  if (sourcesElement) {
    let nextElement = sourcesElement.nextElementSibling;
    while (nextElement && nextElement.tagName === 'P' && /^[\s\u00A0]*$/.test(nextElement.textContent)) {
      nextElement = nextElement.nextElementSibling;
    }
    const isFollowedByList = nextElement && (nextElement.tagName === 'UL' || nextElement.tagName === 'OL');
    if (!isFollowedByList) {
      failed.push('Sources Format');
      suggestions.push('Sources section should be followed by a list (<ul> or <ol>)');
    }
  }
  
  // 8. Spacing
  if (allParagraphs.length > 0) {
    const spacers = Array.from(allParagraphs).filter(p => {
      const text = p.textContent.trim();
      return text === '' || text === '\u00A0' || /^[\s\u00A0]+$/.test(text);
    });
    const spacerRatio = spacers.length / allParagraphs.length;
    
    let spacingValid = false;
    if (options.removeParagraphSpacers) {
      spacingValid = spacerRatio >= 0 && spacerRatio <= 0.10;
      if (!spacingValid) {
        failed.push('Excessive Spacing');
        suggestions.push(`Too many spacers (${(spacerRatio * 100).toFixed(1)}%) with "Remove Paragraph Spacers" enabled. Expected 0-10%`);
      }
    } else {
      spacingValid = spacerRatio >= 0.05 && spacerRatio <= 0.60;
      if (!spacingValid) {
        if (spacerRatio < 0.05) {
          failed.push('Insufficient Spacing');
          suggestions.push(`Add more spacers for readability. Current: ${(spacerRatio * 100).toFixed(1)}%, Expected: 5-60%`);
        } else {
          failed.push('Excessive Spacing');
          suggestions.push(`Too many spacers (${(spacerRatio * 100).toFixed(1)}%). Expected: 5-60%`);
        }
      }
    }
  }
  
  // 9. Clean Formatting
  const hasProblematicPatterns = html.includes('<p></p>') ||
                                  html.includes('<h2></h2>') ||
                                  html.includes('<h3></h3>') ||
                                  /\s{3,}&nbsp;/.test(html) ||
                                  /<p>\s*<\/p>/.test(html);
  
  const hasSuperscript = html.includes('<sup>') || html.includes('</sup>');
  let properSuperscripts = true;
  if (hasSuperscript) {
    const supOpen = (html.match(/<sup>/g) || []).length;
    const supClose = (html.match(/<\/sup>/g) || []).length;
    properSuperscripts = supOpen === supClose;
  }
  
  if (hasProblematicPatterns) {
    failed.push('Broken HTML');
    suggestions.push('Fix empty tags (<p></p>, <h2></h2>) or excessive whitespace');
  }
  if (!properSuperscripts) {
    failed.push('Unclosed Superscripts');
    suggestions.push('Fix unclosed <sup> tags');
  }
  
  // 10. Header Formatting
  if (allHeaders.length > 0) {
    if (options.strongInHeaders) {
      const headersWithStrong = allHeaders.filter(h => h.querySelector('strong') || h.querySelector('b'));
      if (headersWithStrong.length < (allHeaders.length * 0.8)) {
        failed.push('Header Formatting');
        suggestions.push('Enable "Put <strong> tags in headers" option or ensure headers have <strong> tags');
      }
    } else {
      const headersWithoutStrong = allHeaders.filter(h => !h.querySelector('strong') && !h.querySelector('b'));
      if (headersWithoutStrong.length < (allHeaders.length * 0.8)) {
        failed.push('Header Formatting');
        suggestions.push('Disable "Put <strong> tags in headers" option or remove <strong> tags from headers');
      }
    }
  }
  
  // 11. Link Paths
  if (links.length > 0 && options.removeDomain) {
    const relativeLinks = Array.from(links).filter(a => {
      const href = a.getAttribute('href');
      if (!href) return false;
      return /^\/[^\/]/.test(href) || (!/^(https?:)?\/\//i.test(href) && href !== '#');
    });
    
    const absoluteLinks = Array.from(links).filter(a => {
      const href = a.getAttribute('href');
      return href && /^https?:\/\//i.test(href);
    });
    
    const allExternal = absoluteLinks.length === links.length;
    const hasRelative = relativeLinks.length > 0;
    
    if (!allExternal && !hasRelative) {
      failed.push('Link Conversion');
      suggestions.push('Internal links not converted to relative paths. Check domain detection or disable option');
    }
  }
  
  // 12. Detect paragraphs that may be headers (best practice warning)
  const suspiciousParagraphs = detectPossibleHeaderParagraphs(doc);
  if (suspiciousParagraphs.length > 0) {
    // Don't add to failed requirements, but warn user
    const previews = suspiciousParagraphs.slice(0, 2).map(p => {
      const text = p.textContent.trim();
      return text.length > 50 ? text.substring(0, 47) + '...' : text;
    });
    const count = suspiciousParagraphs.length;
    const exampleText = previews.length > 0 ? ` (e.g., "${previews[0]}")` : '';
    suggestions.push(`⚠️ Found ${count} paragraph(s) that may be headers${exampleText}. Verify in source document and convert to H2/H3 if needed`);
  }
  
  const score = calculateShopifyBlogsConfidence(html, options);
  const level = getConfidenceDescription(score);
  
  return {
    score,
    level,
    failedRequirements: failed,
    suggestions
  };
}

/**
 * Detect paragraphs that may actually be headers based on formatting patterns
 * @param {Document} doc - Parsed HTML document
 * @returns {Array<HTMLElement>} Array of suspicious paragraph elements
 */
function detectPossibleHeaderParagraphs(doc) {
  const paragraphs = doc.querySelectorAll('p');
  
  return Array.from(paragraphs).filter(p => {
    const text = p.textContent.trim();
    
    // Skip spacer paragraphs
    if (text === '' || text === '\u00A0' || /^[\s\u00A0]+$/.test(text)) {
      return false;
    }
    
    // Skip known special paragraphs
    if (/^(alt\s+image\s+text|sources?|references?|read\s+also|read\s+more):?/i.test(text)) {
      return false;
    }
    
    // Check for header-like characteristics
    const hasStrong = p.querySelector('strong, b');
    const isShort = text.length < 80 && text.length > 5;
    const noPeriodEnd = !text.endsWith('.');
    
    // Check if entire content is bold (strong tag wraps all text)
    let entirelyBold = false;
    if (hasStrong) {
      const strongElement = p.querySelector('strong, b');
      const strongText = strongElement ? strongElement.textContent.trim() : '';
      entirelyBold = strongText === text || strongText.length > (text.length * 0.9);
    }
    
    // A paragraph is suspicious if:
    // - It's short AND entirely bold AND doesn't end with period
    // This pattern strongly suggests it's meant to be a header
    return isShort && entirelyBold && noPeriodEnd;
  });
}

