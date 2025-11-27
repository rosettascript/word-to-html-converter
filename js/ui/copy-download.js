/**
 * Copy & Download UI
 * Handles copy to clipboard and download functionality
 */

import { showToast } from './toast.js';
import { logError } from '../utils/error-handler.js';

/**
 * Set up copy and download buttons
 */
export function setupCopyDownload() {
  const copyButton = document.getElementById('copy-output');
  const downloadButton = document.getElementById('download-output');
  const outputCode = document.getElementById('output-html');

  // Copy to Clipboard
  if (copyButton && outputCode) {
    copyButton.addEventListener('click', async () => {
      const html = outputCode.textContent;

      if (!html || html.trim() === '') {
        showToast('Nothing to copy', 'warning');
        return;
      }

      try {
        await navigator.clipboard.writeText(html);
        showToast('✓ Copied to clipboard');
      } catch (error) {
        logError('Copy failed', error);
        showToast('Copy failed. Please select and copy manually.', 'error');
      }
    });
  }

  // Download as File
  if (downloadButton && outputCode) {
    downloadButton.addEventListener('click', () => {
      const html = outputCode.textContent;

      if (!html || html.trim() === '') {
        showToast('Nothing to download', 'warning');
        return;
      }

      try {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cleaned-html.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('✓ Downloaded cleaned-html.html');
      } catch (error) {
        logError('Download failed', error);
        showToast('Download failed. Please copy manually.', 'error');
      }
    });
  }
}
