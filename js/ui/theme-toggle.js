/**
 * Theme Toggle
 * Toggles high-contrast theme using data-theme="high-contrast" on <html>
 */
export function setupThemeToggle() {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;

  // Initialize state from localStorage or system preference
  const saved = localStorage.getItem('w2hc-theme');
  const prefersDark =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isHighContrast = saved === 'high-contrast' || (!saved && prefersDark);

  function apply(high) {
    if (high) {
      document.documentElement.setAttribute('data-theme', 'high-contrast');
      btn.setAttribute('aria-pressed', 'true');
      btn.textContent = 'High contrast: On';
    } else {
      document.documentElement.removeAttribute('data-theme');
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = 'High contrast';
    }

    // Dispatch custom event for theme changes
    const event = new CustomEvent('theme-changed', {
      detail: { theme: high ? 'high-contrast' : 'normal' },
    });
    document.dispatchEvent(event);
  }

  apply(isHighContrast);

  btn.addEventListener('click', () => {
    const currently = document.documentElement.getAttribute('data-theme') === 'high-contrast';
    const next = !currently;
    apply(next);
    localStorage.setItem('w2hc-theme', next ? 'high-contrast' : 'normal');
  });
}
