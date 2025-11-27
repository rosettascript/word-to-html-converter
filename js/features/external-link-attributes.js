/**
 * External Link Attributes Feature
 * Adds target="_blank" and rel="noopener noreferrer" to links
 */

import { logWarning } from '../utils/error-handler.js';

/**
 * Add target="_blank" and rel="noopener noreferrer" to links
 * @param {HTMLElement} root - Root element to process
 * @param {string} baseDomain - Optional base domain for internal link detection
 * @param {boolean} allLinks - If true, applies to ALL links; if false, only external links
 */
export function addExternalLinkAttributes(root, baseDomain = null, allLinks = false) {
  const links = root.querySelectorAll('a[href]');

  links.forEach(link => {
    const href = link.getAttribute('href');
    const linkType = classifyLink(href, baseDomain);

    // Skip special links (mailto, tel) - these should never open in new tab
    if (linkType === 'special') {
      return;
    }

    // Apply to all links or just external ones
    if (allLinks || linkType === 'external') {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

/**
 * Classify link as internal, external, or special
 * @param {string} href - Link href attribute
 * @param {string} baseDomain - Optional base domain for internal link detection
 * @returns {string} - 'internal', 'external', or 'special'
 */
function classifyLink(href, baseDomain = null) {
  const normalized = href.trim();

  // Relative paths → Internal
  if (normalized.startsWith('/') || normalized.startsWith('./') || normalized.startsWith('../')) {
    return 'internal';
  }

  // Anchor links → Internal
  if (normalized.startsWith('#')) {
    return 'internal';
  }

  // Mailto/tel links → Special (no target="_blank")
  if (normalized.startsWith('mailto:') || normalized.startsWith('tel:')) {
    return 'special';
  }

  // Check against configured domain (if provided)
  if (baseDomain) {
    try {
      const linkUrl = new URL(normalized, window.location.href);
      const configUrl = new URL(baseDomain);

      // Compare hostname (ignore protocol, port, path)
      if (linkUrl.hostname === configUrl.hostname) {
        return 'internal';
      }
    } catch (error) {
      // Invalid URL, log warning in development but treat as internal (preserve as-is)
      logWarning(`URL parsing failed for href: ${normalized}`, error);
      return 'internal';
    }
  }

  // Absolute URLs without configured domain → External
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return 'external';
  }

  // Unknown/malformed → Internal (preserve as-is)
  return 'internal';
}
