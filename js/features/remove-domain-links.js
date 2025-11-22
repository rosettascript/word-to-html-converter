/**
 * Remove Domain from Links Feature
 * Automatically detects the most common domain and converts it to relative paths
 */

/**
 * Automatically detect and remove the most common domain from links
 * @param {HTMLElement} root - Root element to process
 */
export function removeDomainFromLinks(root) {
  const links = root.querySelectorAll('a[href]');

  if (links.length === 0) {
    return;
  }

  // Step 1: Detect all domains and count their frequency
  const domainCounts = new Map();
  const linkData = [];

  links.forEach(link => {
    const href = link.getAttribute('href');

    try {
      // Skip relative URLs, anchors, and non-http protocols
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('/') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) {
        return;
      }

      const url = new URL(href, window.location.href);

      // Only process http/https URLs
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        const hostname = url.hostname;
        domainCounts.set(hostname, (domainCounts.get(hostname) || 0) + 1);
        linkData.push({ link, url, href });
      }
    } catch {
      // Invalid URL, skip it
    }
  });

  if (domainCounts.size === 0) {
    return;
  }

  // Step 2: Find the most common domain (likely the internal domain)
  let mostCommonDomain = null;
  let maxCount = 0;

  for (const [domain, count] of domainCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonDomain = domain;
    }
  }

  // Step 3: Convert links with the most common domain to relative paths
  linkData.forEach(({ link, url }) => {
    if (url.hostname === mostCommonDomain) {
      const relativePath = url.pathname + url.search + url.hash;
      link.setAttribute('href', relativePath);

      // Keep target and rel attributes (don't remove them)
      // Shopify modes want all links to open in new tabs
    }
  });
}
