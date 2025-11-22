/**
 * Preview Toggle UI
 * Toggles between code view and rendered preview
 */

let isPreviewMode = false;
let toggleButton = null;
let codeView = null;
let previewView = null;

/**
 * Set up preview toggle
 */
export function setupPreviewToggle() {
  toggleButton = document.getElementById('toggle-preview');
  codeView = document.getElementById('output-code-view');
  previewView = document.getElementById('output-preview-view');

  if (!toggleButton || !codeView || !previewView) {
    console.warn('Preview toggle elements not found');
    return;
  }

  // Ensure initial state: code view is active
  if (!codeView.classList.contains('active')) {
    codeView.classList.add('active');
  }
  if (previewView.classList.contains('active')) {
    previewView.classList.remove('active');
  }

  isPreviewMode = false;

  toggleButton.addEventListener('click', handleToggle);
}

/**
 * Handle toggle between code and preview views
 */
function handleToggle() {
  if (!toggleButton || !codeView || !previewView) {
    return;
  }

  isPreviewMode = !isPreviewMode;

  if (isPreviewMode) {
    // Switch to preview mode
    codeView.classList.remove('active');
    previewView.classList.add('active');
    toggleButton.setAttribute('aria-label', 'Switch to code view');
    toggleButton.title = 'Code view';

    // Change icon to code view (</>)
    const svg = toggleButton.querySelector('svg');
    if (svg) {
      svg.innerHTML =
        '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>';
    }

    // Trigger preview rendering if content exists
    triggerPreviewRender();
  } else {
    // Switch to code mode
    previewView.classList.remove('active');
    codeView.classList.add('active');
    toggleButton.setAttribute('aria-label', 'Switch to preview');
    toggleButton.title = 'Preview';

    // Change icon back to eye
    const svg = toggleButton.querySelector('svg');
    if (svg) {
      svg.innerHTML =
        '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }

    // Clear preview content to save resources
    clearPreviewContent();
  }
}

/**
 * Trigger preview rendering (called when switching to preview mode)
 */
function triggerPreviewRender() {
  const previewFrame = document.getElementById('preview-frame');
  if (!previewFrame) return;

  // Get the current output HTML
  const outputCode = document.getElementById('output-html');
  if (!outputCode) return;

  // If there's content, trigger a reprocess to update preview
  const inputDiv = document.getElementById('input-html');
  if (inputDiv && inputDiv.innerHTML.trim() !== '') {
    // Dispatch a custom event to trigger reprocessing
    const event = new CustomEvent('preview-requested');
    document.dispatchEvent(event);
  }
}

/**
 * Clear preview content when switching to code view
 */
function clearPreviewContent() {
  const previewFrame = document.getElementById('preview-frame');
  if (previewFrame) {
    previewFrame.srcdoc = '';
  }
}

/**
 * Get current preview mode state
 * @returns {boolean} True if preview mode is active
 */
export function isPreviewModeActive() {
  return isPreviewMode;
}
