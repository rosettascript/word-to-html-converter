/**
 * Clean Link URLs Feature
 * Normalizes special hyphen characters in URLs to regular hyphens
 */

/**
 * Clean special hyphen characters in link URLs
 * Converts Unicode hyphen variants (like non-breaking hyphen) to regular hyphens
 * @param {HTMLElement} root - Root element to process
 */
export function cleanLinkUrls(root) {
  const links = root.querySelectorAll('a[href]');

  links.forEach(link => {
    const href = link.getAttribute('href');

    if (!href) {
      return;
    }

    // Skip relative URLs, anchors, and special protocols
    if (
      href.startsWith('#') ||
      href.startsWith('/') ||
      href.startsWith('./') ||
      href.startsWith('../') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:') ||
      href.startsWith('data:')
    ) {
      return;
    }

    try {
      // Only process absolute URLs (http/https)
      if (!href.startsWith('http://') && !href.startsWith('https://')) {
        return;
      }

      // Parse the URL to safely handle all components
      const url = new URL(href);

      // Clean the pathname (where slugs typically appear)
      let cleanedPathname = url.pathname;

      // Replace special hyphen characters (both URL-encoded and decoded forms)
      // U+2011 (NON-BREAKING HYPHEN) - URL-encoded: %E2%80%91
      // U+2010 (HYPHEN) - URL-encoded: %E2%80%90
      cleanedPathname = cleanedPathname
        .replace(/\u2011/g, '-') // Non-breaking hyphen (decoded)
        .replace(/\u2010/g, '-') // Hyphen (decoded)
        .replace(/%E2%80%91/gi, '-') // Non-breaking hyphen (URL-encoded)
        .replace(/%E2%80%90/gi, '-'); // Hyphen (URL-encoded)

      // Only update if pathname was changed
      if (cleanedPathname !== url.pathname) {
        // Dynamically reconstruct URL: modify only pathname, preserve all other components
        // The URL object automatically preserves: protocol, hostname, port, search params, hash, username, password, etc.
        url.pathname = cleanedPathname;
        link.setAttribute('href', url.href);
      }
    } catch {
      // Invalid URL, skip it (preserve as-is)
    }
  });
}

