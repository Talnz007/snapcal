// Enhanced SnapCal background service worker with context menu support
self.addEventListener('install', () => {
  console.log('SnapCal background installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SnapCal background active');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      setupContextMenus()
    ])
  );
});

// Setup context menus for text selection
async function setupContextMenus() {
  try {
    // Remove existing context menus first
    await chrome.contextMenus.removeAll();
    
    // Create context menu for selected text
    chrome.contextMenus.create({
      id: 'solve-selected-math',
      title: 'Solve with SnapCal',
      contexts: ['selection'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    }, () => {
      if (chrome.runtime.lastError) {
        console.warn('Context menu creation warning:', chrome.runtime.lastError.message);
      } else {
        console.log('Context menus created successfully');
      }
    });
    
  } catch (error) {
    console.error('Failed to create context menus:', error);
  }
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'solve-selected-math') {
    try {
      // Store the selected text for the popup to access
      await chrome.storage.local.set({
        selectedText: info.selectionText,
        timestamp: Date.now()
      });
      
      console.log('Context menu clicked, stored text:', info.selectionText);
      
      // Try to open the extension popup
      try {
        await chrome.action.openPopup();
      } catch (popupError) {
        console.warn('Could not open popup automatically:', popupError);
        // Fallback: user will need to click the extension icon manually
      }
    } catch (error) {
      console.error('Failed to handle context menu click:', error);
    }
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_SELECTED_TEXT':
      chrome.storage.local.get(['selectedText', 'timestamp']).then(result => {
        // Only return text if it's recent (within 10 seconds)
        if (result.selectedText && result.timestamp && (Date.now() - result.timestamp < 10000)) {
          sendResponse({ text: result.selectedText });
          // Clear the stored text after use
          chrome.storage.local.remove(['selectedText', 'timestamp']);
        } else {
          sendResponse({ text: null });
        }
      });
      return true; // Keep message channel open for async response
      
    case 'CAPTURE_TAB':
      // Get the current active tab and capture it
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
          sendResponse({ error: 'No active tab found' });
          return;
        }
        
        chrome.tabs.captureVisibleTab(tabs[0].windowId, { format: 'png' }, (dataUrl) => {
          if (chrome.runtime.lastError) {
            sendResponse({ error: chrome.runtime.lastError.message });
          } else {
            sendResponse({ dataUrl });
          }
        });
      });
      return true;
      
    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('SnapCal extension started');
});

// Handle extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
  console.log('SnapCal extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    // Show welcome notification or open options page
    console.log('Welcome to SnapCal! Make sure to enable Chrome AI flags.');
  }
});