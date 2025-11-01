// SnapCal content script for enhanced text selection and math detection
(function() {
  'use strict';
  
  console.log('SnapCal content script loaded');
  
  let selectedMathText = '';
  let selectionTimeout = null;
  
  // Math-related patterns to detect mathematical content
  const mathPatterns = [
    /[+\-*/=]/,                    // Basic operators
    /\d+[\s]*[+\-*/=][\s]*\d+/,   // Simple equations
    /[xy]\s*[+\-*/=]/,            // Variables
    /\b(sin|cos|tan|log|ln|sqrt|integral|derivative|limit)\b/i, // Math functions
    /[∫∑∏√±≤≥≠∞π]/,              // Math symbols
    /\b\d+x\b|\bx\d+\b/,          // Algebraic terms
    /\([^)]*[+\-*/=][^)]*\)/      // Expressions in parentheses
  ];
  
  // Check if text contains mathematical content
  function containsMath(text) {
    if (!text || text.length < 2) return false;
    return mathPatterns.some(pattern => pattern.test(text));
  }
  
  // Enhanced text selection handler
  function handleTextSelection() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText && containsMath(selectedText)) {
      selectedMathText = selectedText;
      
      // Clear previous timeout
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }
      
      // Store selection for a short time
      selectionTimeout = setTimeout(() => {
        selectedMathText = '';
      }, 30000); // Clear after 30 seconds
      
      console.log('Math content selected:', selectedText);
    }
  }
  
  // Listen for text selection
  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('keyup', (e) => {
    // Handle keyboard selection (Shift+Arrow keys, Ctrl+A, etc.)
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      setTimeout(handleTextSelection, 100);
    }
  });
  
  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'GET_SELECTED_MATH':
        sendResponse({ 
          text: selectedMathText,
          hasMath: containsMath(selectedMathText)
        });
        break;
        
      case 'HIGHLIGHT_MATH':
        highlightMathOnPage();
        sendResponse({ success: true });
        break;
        
      case 'CAPTURE_ELEMENT':
        captureSelectedElement(sendResponse);
        return true; // Keep message channel open
        
      default:
        sendResponse({ error: 'Unknown message type' });
    }
  });
  
  // Highlight mathematical content on the page
  function highlightMathOnPage() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
      if (containsMath(node.textContent)) {
        textNodes.push(node);
      }
    }
    
    textNodes.forEach(textNode => {
      const parent = textNode.parentNode;
      if (parent && !parent.classList.contains('snapcal-highlighted')) {
        parent.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
        parent.style.border = '1px dashed #ff6b35';
        parent.classList.add('snapcal-highlighted');
        
        // Remove highlight after 5 seconds
        setTimeout(() => {
          parent.style.backgroundColor = '';
          parent.style.border = '';
          parent.classList.remove('snapcal-highlighted');
        }, 5000);
      }
    });
  }
  
  // Capture a specific element (for future enhancement)
  function captureSelectedElement(sendResponse) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const element = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE 
        ? range.commonAncestorContainer 
        : range.commonAncestorContainer.parentElement;
      
      // Get element bounds
      const rect = element.getBoundingClientRect();
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      
      sendResponse({
        bounds: {
          x: rect.left + scrollX,
          y: rect.top + scrollY,
          width: rect.width,
          height: rect.height
        },
        text: element.textContent.trim()
      });
    } else {
      sendResponse({ error: 'No element selected' });
    }
  }
  
  // Add visual feedback for math detection
  function addMathDetectionFeedback() {
    const style = document.createElement('style');
    style.textContent = `
      .snapcal-math-hint {
        position: fixed;
        top: 10px;
        right: 10px;
        background: #4f46e5;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: opacity 0.3s ease;
      }
      .snapcal-highlighted {
        transition: all 0.3s ease;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Initialize
  addMathDetectionFeedback();
  
  // Notify that content script is ready
  chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_READY' }).catch(() => {
    // Ignore errors if background script isn't ready
  });
  
})();