/**
 * List Combiner Feature
 * Combines consecutive lists of the same type
 */

/**
 * Combine adjacent lists based on mode rules
 * @param {HTMLElement} root - Root element to process
 * @param {string} mode - 'regular', 'shopify-blogs', or 'shopify-shoppables'
 */
export function combineLists(root, mode) {
  const listPairs = [];

  // #region agent log
  const allLists = Array.from(root.querySelectorAll('ul, ol'));
  fetch('http://127.0.0.1:7242/ingest/d0a5da0d-7b92-4e34-bc77-29d00d6fcbf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'list-combiner.js:11',message:'combineLists entry',data:{mode,totalLists:allLists.length,listTypes:allLists.map(l => ({type:l.tagName,itemCount:l.querySelectorAll(':scope > li').length}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  // Find all consecutive list pairs
  root.querySelectorAll('ul, ol').forEach(list => {
    let nextSibling = list.nextSibling;
    let foundSeparator = null;

    // Skip whitespace and acceptable separators
    while (nextSibling) {
      if (nextSibling.nodeType === Node.TEXT_NODE && /^\s*$/.test(nextSibling.textContent)) {
        // Whitespace-only text node - acceptable
        nextSibling = nextSibling.nextSibling;
        continue;
      }

      if (nextSibling.nodeType === Node.ELEMENT_NODE) {
        const tagName = nextSibling.tagName.toLowerCase();

        // Empty paragraph - acceptable
        if (tagName === 'p' && nextSibling.innerHTML.trim() === '') {
          foundSeparator = nextSibling;
          nextSibling = nextSibling.nextSibling;
          continue;
        }

        // Spacer paragraph - mode-dependent
        if (tagName === 'p' && nextSibling.innerHTML.trim() === '&nbsp;') {
          if (mode === 'shopify-shoppables') {
            foundSeparator = nextSibling;
            nextSibling = nextSibling.nextSibling;
            continue;
          } else {
            // In Blogs/Regular mode, preserve spacer (don't combine)
            break;
          }
        }

        // Check if next element is a list of the same type
        if (tagName === list.tagName.toLowerCase()) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/d0a5da0d-7b92-4e34-bc77-29d00d6fcbf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'list-combiner.js:50',message:'Found list pair to combine',data:{firstType:list.tagName,secondType:nextSibling.tagName,firstItems:list.querySelectorAll(':scope > li').length,secondItems:nextSibling.querySelectorAll(':scope > li').length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          listPairs.push({
            first: list,
            second: nextSibling,
            separator: foundSeparator,
          });
        }

        break;
      }

      break;
    }
  });

  // Combine list pairs (in reverse to avoid DOM mutation issues)
  listPairs.reverse().forEach(({ first, second, separator }) => {
    // #region agent log
    const firstTypeBefore = first.tagName;
    const secondTypeBefore = second.tagName;
    const firstItemsBefore = first.querySelectorAll(':scope > li').length;
    const secondItemsBefore = second.querySelectorAll(':scope > li').length;
    fetch('http://127.0.0.1:7242/ingest/d0a5da0d-7b92-4e34-bc77-29d00d6fcbf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'list-combiner.js:66',message:'Combining lists',data:{firstType:firstTypeBefore,secondType:secondTypeBefore,firstItemsBefore,secondItemsBefore},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    // CRITICAL: Ensure list types match before combining
    // If types don't match, preserve the first list's type and convert second list's items
    if (first.tagName !== second.tagName) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d0a5da0d-7b92-4e34-bc77-29d00d6fcbf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'list-combiner.js:74',message:'List type mismatch detected',data:{firstType:first.tagName,secondType:second.tagName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      // This shouldn't happen as we only combine same-type lists, but add safeguard
      console.warn(`List type mismatch: ${first.tagName} vs ${second.tagName}. Skipping combination.`);
      return; // Skip this combination
    }
    
    // Move all <li> elements from second list to first list
    while (second.firstChild) {
      first.appendChild(second.firstChild);
    }

    // Remove separator if present
    if (separator) {
      separator.remove();
    }

    // Remove second list
    second.remove();
    
    // #region agent log
    const firstTypeAfter = first.tagName;
    const firstItemsAfter = first.querySelectorAll(':scope > li').length;
    fetch('http://127.0.0.1:7242/ingest/d0a5da0d-7b92-4e34-bc77-29d00d6fcbf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'list-combiner.js:95',message:'Lists combined',data:{firstTypeBefore,firstTypeAfter,firstItemsBefore,firstItemsAfter,typeChanged:firstTypeBefore !== firstTypeAfter},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    // Final safeguard: Verify type wasn't accidentally changed
    if (firstTypeBefore !== firstTypeAfter) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d0a5da0d-7b92-4e34-bc77-29d00d6fcbf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'list-combiner.js:100',message:'ERROR: List type changed during combination',data:{firstTypeBefore,firstTypeAfter},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.error(`List type unexpectedly changed from ${firstTypeBefore} to ${firstTypeAfter}`);
      // Restore original type
      const newList = document.createElement(firstTypeBefore);
      while (first.firstChild) {
        newList.appendChild(first.firstChild);
      }
      first.parentNode.replaceChild(newList, first);
    }
  });
}
