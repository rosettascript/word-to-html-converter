/**
 * Split Section Markers
 * Splits paragraphs when section markers like "Read also:" appear mid-paragraph
 */

import { setSafeHTML } from '../utils/safe-html.js';

/**
 * Split paragraphs containing section markers into separate paragraphs
 * Handles cases like: <p>Some text...<strong>Read also:</strong></p>
 * Converts to: <p>Some text...</p><p><strong>Read also:</strong></p>
 * @param {HTMLElement} root - Root element to process
 */
export function splitSectionMarkers(root) {
  const paragraphs = Array.from(root.querySelectorAll('p'));
  
  paragraphs.forEach(p => {
    // Look for section markers (Read also, Sources, etc.) within strong tags
    const strongElements = p.querySelectorAll('strong, b');
    
    strongElements.forEach(strong => {
      const strongText = strong.textContent.trim();
      
      // Check if this strong tag contains a section marker
      const isSectionMarker = 
        /^(read\s+(also|more)|related|sources?|references?|bibliography):?$/i.test(strongText) ||
        /^(check\s+out|want\s+to\s+learn|learn\s+more|further\s+reading):?$/i.test(strongText);
      
      if (!isSectionMarker) {
        return; // Not a section marker
      }
      
      // Check if there's content before this strong tag in the paragraph
      const paragraphHTML = p.innerHTML;
      const strongHTML = strong.outerHTML;
      const indexOfStrong = paragraphHTML.indexOf(strongHTML);
      
      if (indexOfStrong <= 0) {
        return; // Strong tag is at the beginning, no split needed
      }
      
      const contentBefore = paragraphHTML.substring(0, indexOfStrong).trim();
      if (!contentBefore || /^[\s\u00A0]*$/.test(contentBefore)) {
        return; // No meaningful content before, no split needed
      }
      
      // Split the paragraph
      const contentAfter = paragraphHTML.substring(indexOfStrong).trim();
      
      // Create new paragraph with content before the marker
      const newParagraph = document.createElement('p');
      setSafeHTML(newParagraph, contentBefore);
      
      // Update current paragraph to only contain the marker and anything after
      setSafeHTML(p, contentAfter);
      
      // Insert the new paragraph before the current one
      p.parentNode.insertBefore(newParagraph, p);
    });
  });
}

