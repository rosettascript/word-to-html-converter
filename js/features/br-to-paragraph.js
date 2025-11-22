/**
 * BR to Paragraph Converter
 * Replaces <br> tags with empty <p></p> tags
 */

/**
 * Replace all <br> tags with empty <p></p> tags
 * @param {HTMLElement} root - Root element to process
 */
export function replaceBrWithParagraph(root) {
  const brTags = Array.from(root.querySelectorAll('br'));

  brTags.forEach(br => {
    const emptyP = document.createElement('p');
    br.parentNode.replaceChild(emptyP, br);
  });
}
