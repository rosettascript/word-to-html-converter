/**
 * Preview Toggle UI
 * Toggles between code view and rendered preview
 */

/**
 * Set up preview toggle
 */
export function setupPreviewToggle() {
  const toggleButton = document.getElementById('toggle-preview');
  const codeView = document.getElementById('output-code-view');
  const previewView = document.getElementById('output-preview-view');
  
  if (!toggleButton || !codeView || !previewView) {
    return;
  }
  
  let isPreviewMode = false;
  
  toggleButton.addEventListener('click', () => {
    isPreviewMode = !isPreviewMode;
    
    if (isPreviewMode) {
      // Switch to preview mode
      codeView.classList.remove('active');
      previewView.classList.add('active');
      toggleButton.setAttribute('aria-label', 'Switch to code view');
      toggleButton.title = 'Code view';
    } else {
      // Switch to code mode
      previewView.classList.remove('active');
      codeView.classList.add('active');
      toggleButton.setAttribute('aria-label', 'Switch to preview');
      toggleButton.title = 'Preview';
    }
  });
}


