/**
 * HTML Formatter Utility
 * Formats HTML with proper indentation and line breaks
 */

/**
 * Format HTML with proper indentation
 * @param {string} html - HTML string to format
 * @param {number} indentSize - Number of spaces for indentation (default: 4)
 * @returns {string} - Formatted HTML
 */
export function formatHTML(html, indentSize = 4) {
  if (!html || html.trim() === '') {
    return '';
  }
  
  const indent = ' '.repeat(indentSize);
  let formatted = '';
  let indentLevel = 0;
  
  // Define inline elements that should stay on one line
  const inlineElements = ['a', 'strong', 'em', 'span', 'b', 'i', 'u', 'code', 'small', 'sup', 'sub'];
  
  // Block elements that should have their content on new lines
  const blockElements = ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside', 'blockquote', 'pre', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot'];
  
  // Parse HTML into tokens (tags and text)
  const tokens = tokenizeHTML(html);
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    if (token.type === 'openingTag' || token.type === 'selfClosingTag') {
      const tagName = extractTagName(token.content);
      const isBlock = blockElements.includes(tagName);
      const isInline = inlineElements.includes(tagName);
      
      // Check if this is a block element that might contain inline content
      if (isBlock) {
        // Find the closing tag for this block element
        let closingTagIndex = -1;
        let depth = 1;
        for (let j = i + 1; j < tokens.length; j++) {
          if (tokens[j].type === 'openingTag' && extractTagName(tokens[j].content) === tagName) {
            depth++;
          } else if (tokens[j].type === 'closingTag' && extractTagName(tokens[j].content) === tagName) {
            depth--;
            if (depth === 0) {
              closingTagIndex = j;
              break;
            }
          }
        }
        
        if (closingTagIndex !== -1) {
          // Check if content between opening and closing is all inline/text
          let hasOnlyInlineContent = true;
          for (let j = i + 1; j < closingTagIndex; j++) {
            if (tokens[j].type === 'openingTag') {
              const innerTagName = extractTagName(tokens[j].content);
              if (blockElements.includes(innerTagName)) {
                hasOnlyInlineContent = false;
                break;
              }
            }
          }
          
          // If block element contains only inline content, format it on one line
          if (hasOnlyInlineContent) {
            formatted += indent.repeat(indentLevel) + token.content;
            
            // Collect all inline content (text and inline tags)
            let lastTokenWasClosingInlineTag = false;
            for (let j = i + 1; j < closingTagIndex; j++) {
              if (tokens[j].type === 'text') {
                let text = tokens[j].content;
                
                // Normalize whitespace: collapse multiple spaces to one
                text = text.replace(/\s+/g, ' ');
                
                // Trim leading space if first text node
                if (j === i + 1) {
                  text = text.replace(/^\s+/, '');
                }
                
                // Trim trailing space if last text node
                if (j === closingTagIndex - 1) {
                  text = text.replace(/\s+$/, '');
                }
                
                // Remove leading space if text starts with punctuation and previous was closing inline tag
                if (lastTokenWasClosingInlineTag && /^\s*[,:;.!?]/.test(text)) {
                  text = text.replace(/^\s+/, '');
                }
                
                if (text) {
                  formatted += text;
                  lastTokenWasClosingInlineTag = false;
                }
              } else if (tokens[j].type === 'closingTag') {
                formatted += tokens[j].content;
                const closingTagName = extractTagName(tokens[j].content);
                lastTokenWasClosingInlineTag = inlineElements.includes(closingTagName);
              } else if (tokens[j].type === 'openingTag' || tokens[j].type === 'selfClosingTag') {
                formatted += tokens[j].content;
                lastTokenWasClosingInlineTag = false;
              }
            }
            
            formatted += tokens[closingTagIndex].content + '\n';
            i = closingTagIndex; // Skip ahead
            continue;
          }
        }
        
        // Block element with nested block content - format normally
        formatted += indent.repeat(indentLevel) + token.content + '\n';
        indentLevel++;
      } else if (isInline) {
        // Inline element - should already be handled by parent block
        // This shouldn't normally be reached if parent block handles inline content
        formatted += token.content;
      } else {
        // Other tags (self-closing, etc.)
        formatted += indent.repeat(indentLevel) + token.content + '\n';
      }
      
    } else if (token.type === 'closingTag') {
      const tagName = extractTagName(token.content);
      const isBlock = blockElements.includes(tagName);
      
      if (isBlock) {
        // Decrease indent level before closing block tag
        indentLevel = Math.max(0, indentLevel - 1);
        formatted += indent.repeat(indentLevel) + token.content + '\n';
      } else {
        // Inline closing tags are handled by their parent block
        formatted += token.content;
      }
    } else if (token.type === 'text') {
      // Standalone text (shouldn't normally happen in well-formed HTML)
      const text = token.content.trim();
      if (text) {
        formatted += indent.repeat(indentLevel) + text + '\n';
      }
    } else if (token.type === 'comment') {
      // Add comment
      formatted += indent.repeat(indentLevel) + token.content + '\n';
    }
  }
  
  return formatted.trim();
}

/**
 * Extract tag name from a tag string
 * @param {string} tag - Tag string (e.g., '<a href="...">', '</a>')
 * @returns {string} - Tag name (e.g., 'a')
 */
function extractTagName(tag) {
  const match = tag.match(/<\/?([a-zA-Z0-9]+)/);
  return match ? match[1] : '';
}

/**
 * Tokenize HTML into tags and text
 * @param {string} html - HTML string
 * @returns {Array} - Array of tokens
 */
function tokenizeHTML(html) {
  const tokens = [];
  const regex = /<!--[\s\S]*?-->|<\/?[^>]+\/?>/g;
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    // Add text before tag (if any)
    if (match.index > lastIndex) {
      const text = html.substring(lastIndex, match.index);
      if (text.trim()) {
        tokens.push({ type: 'text', content: text });
      }
    }
    
    const tag = match[0];
    
    // Determine token type
    if (tag.startsWith('<!--')) {
      tokens.push({ type: 'comment', content: tag });
    } else if (tag.startsWith('</')) {
      tokens.push({ type: 'closingTag', content: tag });
    } else if (tag.endsWith('/>')) {
      tokens.push({ type: 'selfClosingTag', content: tag });
    } else {
      tokens.push({ type: 'openingTag', content: tag });
    }
    
    lastIndex = regex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < html.length) {
    const text = html.substring(lastIndex);
    if (text.trim()) {
      tokens.push({ type: 'text', content: text });
    }
  }
  
  return tokens;
}

/**
 * Apply syntax highlighting to formatted HTML
 * Optimized for performance with large HTML content
 * @param {string} html - Formatted HTML string
 * @returns {string} - HTML with syntax highlighting markup
 */
export function applySyntaxHighlighting(html) {
  if (!html) return '';
  
  // Performance optimization: Skip highlighting for very large content
  // Syntax highlighting can be expensive for large HTML
  const MAX_HIGHLIGHT_SIZE = 500 * 1024; // 500KB
  if (html.length > MAX_HIGHLIGHT_SIZE) {
    // For very large content, return unhighlighted HTML
    // This prevents UI freezing
    return html;
  }
  
  let highlighted = html;
  
  // Pre-compile regex patterns for better performance
  const commentRegex = /(<!--[\s\S]*?-->)/g;
  const tagRegex = /(&lt;\/?)([a-zA-Z0-9]+)((?:\s+[a-zA-Z-]+(?:=(?:"[^"]*"|'[^']*'))?)*\s*)(\/?)(&gt;)/g;
  const attrRegex = /([a-zA-Z-]+)(=)?((?:"[^"]*"|'[^']*')?)/g;
  
  // Highlight HTML comments (process first to avoid conflicts)
  highlighted = highlighted.replace(
    commentRegex,
    '<span class="syntax-comment">$1</span>'
  );
  
  // Highlight HTML tags with attributes
  // Use a more efficient approach: process in chunks if content is large
  if (html.length > 100 * 1024) { // 100KB threshold
    // For large content, use a simpler highlighting approach
    highlighted = highlighted.replace(
      tagRegex,
      (match, openBracket, tagName) => {
        return '<span class="syntax-bracket">' + openBracket + '</span>' +
               '<span class="syntax-tag">' + tagName + '</span>' +
               match.substring(openBracket.length + tagName.length);
      }
    );
  } else {
    // Full highlighting for smaller content
    highlighted = highlighted.replace(
      tagRegex,
      (match, openBracket, tagName, attributes, slash, closeBracket) => {
        let result = '<span class="syntax-bracket">' + openBracket + '</span>';
        result += '<span class="syntax-tag">' + tagName + '</span>';
        
        // Highlight attributes
        if (attributes && attributes.trim()) {
          result += attributes.replace(
            attrRegex,
            (attrMatch, attrName, equals, attrValue) => {
              let attrResult = '<span class="syntax-attribute">' + attrName + '</span>';
              if (equals) {
                attrResult += '<span class="syntax-operator">=</span>';
              }
              if (attrValue) {
                attrResult += '<span class="syntax-string">' + attrValue + '</span>';
              }
              return attrResult;
            }
          );
        }
        
        if (slash) {
          result += '<span class="syntax-bracket">' + slash + '</span>';
        }
        result += '<span class="syntax-bracket">' + closeBracket + '</span>';
        
        return result;
      }
    );
  }
  
  return highlighted;
}


