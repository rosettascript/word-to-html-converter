/**
 * Scroll Spy UI
 * Updates URL hash as user scrolls through sections
 */

let isScrolling = false;
let scrollTimeout = null;
let sections = [];

/**
 * Set up scroll spy
 */
export function setupScrollSpy() {
  // Wait for DOM to be fully ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScrollSpy);
  } else {
    // Small delay to ensure all styles are applied
    setTimeout(initializeScrollSpy, 100);
  }
}

/**
 * Initialize scroll spy after page is ready
 */
function initializeScrollSpy() {
  // Get all sections with IDs
  sections = Array.from(document.querySelectorAll('section[id]'))
    .map(section => ({
      id: section.id,
      element: section,
      top: 0,
      bottom: 0
    }))
    .filter(section => section.id); // Only sections with IDs
  
  if (sections.length === 0) {
    return;
  }
  
  // Calculate initial positions
  updateSectionPositions();
  
  // Listen for scroll events
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Recalculate positions on resize
  window.addEventListener('resize', handleResize, { passive: true });
  
  // Handle initial hash on page load
  handleInitialHash();
  
  // Update hash on initial scroll position (with delay to ensure layout is complete)
  setTimeout(() => {
    updateHashFromScroll();
  }, 300);
}

/**
 * Update section positions (needed after resize)
 */
function updateSectionPositions() {
  sections.forEach(section => {
    const rect = section.element.getBoundingClientRect();
    section.top = rect.top + window.scrollY;
    section.bottom = section.top + rect.height;
  });
}

/**
 * Handle window resize
 */
function handleResize() {
  updateSectionPositions();
  // Small delay to ensure layout is complete
  setTimeout(() => {
    updateHashFromScroll();
  }, 100);
}

/**
 * Handle scroll events
 */
function handleScroll() {
  if (isScrolling) {
    return; // Don't update hash during programmatic scrolling
  }
  
  // Debounce hash updates
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  
  scrollTimeout = setTimeout(() => {
    updateHashFromScroll();
  }, 150); // Wait 150ms after scrolling stops
}

/**
 * Update hash based on current scroll position
 */
function updateHashFromScroll() {
  if (isScrolling) {
    return;
  }
  
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  // Use a point slightly above the middle of viewport as trigger
  const triggerPoint = scrollY + viewportHeight * 0.4;
  
  // Find the section that contains the trigger point
  let activeSection = null;
  
  // First, try to find a section that contains the trigger point
  for (const section of sections) {
    const sectionTop = section.top;
    const sectionBottom = section.bottom;
    
    if (triggerPoint >= sectionTop && triggerPoint <= sectionBottom) {
      activeSection = section;
      break;
    }
  }
  
  // If no section found, find the closest one based on scroll position
  if (!activeSection) {
    let closestDistance = Infinity;
    for (const section of sections) {
      // Calculate distance from scroll position to section center
      const sectionCenter = (section.top + section.bottom) / 2;
      const distance = Math.abs(scrollY - sectionCenter);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        activeSection = section;
      }
    }
  }
  
  // Update hash if section changed
  if (activeSection) {
    const newHash = `#${activeSection.id}`;
    const currentHash = window.location.hash;
    
    // Only update if hash actually changed
    if (currentHash !== newHash) {
      // Use history.replaceState to update URL without triggering scroll
      // This prevents the browser from jumping to the hash
      history.replaceState(null, '', newHash);
    }
  }
}

/**
 * Handle initial hash on page load
 */
function handleInitialHash() {
  // If there's a hash in the URL, scroll to that section
  if (window.location.hash) {
    const hash = window.location.hash.substring(1); // Remove #
    const section = sections.find(s => s.id === hash);
    if (section) {
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        scrollToSection(hash, false); // Don't update hash (it's already set)
      }, 100);
    }
  }
}

/**
 * Scroll to a specific section
 * @param {string} sectionId - ID of the section to scroll to
 * @param {boolean} updateHash - Whether to update the URL hash
 */
export function scrollToSection(sectionId, updateHash = true) {
  const section = sections.find(s => s.id === sectionId);
  if (!section) {
    return;
  }
  
  isScrolling = true;
  
  // Calculate offset (account for any fixed headers)
  const offset = 0; // Adjust if you have a fixed header
  
  section.element.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
  
  // Update hash after scroll completes
  if (updateHash) {
    setTimeout(() => {
      const newHash = `#${sectionId}`;
      if (window.location.hash !== newHash) {
        history.replaceState(null, '', newHash);
      }
      isScrolling = false;
    }, 1000); // Wait for smooth scroll to complete
  } else {
    setTimeout(() => {
      isScrolling = false;
    }, 1000);
  }
}

/**
 * Handle hash changes from browser navigation (back/forward buttons)
 */
export function setupHashNavigation() {
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      scrollToSection(hash, false); // Hash is already updated by browser
    }
  });
}

