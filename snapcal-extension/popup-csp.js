// SnapCal Chrome Extension Popup - CSP Compliant Version
// Core variables
let session = null;
let extractedText = '';

// Check for selected text from context menu
async function checkForSelectedText() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_SELECTED_TEXT' });
    if (response && response.text) {
      document.getElementById('textInput').value = response.text;
      toggleTextInput();
      setStatus('ocrStatus', `<span class='text-green'>✅ Selected text loaded: "${response.text}"</span>`);
    }
  } catch (error) {
    console.log('No selected text available');
  }
}

// Utility functions
function setStatus(elementId, html) {
  const element = document.getElementById(elementId);
  if (element) element.innerHTML = html;
}

// Toggle text input area
function toggleTextInput() {
  const area = document.getElementById('textInputArea');
  const btn = document.getElementById('textInputBtn');
  if (area.classList.contains('hidden')) {
    area.classList.remove('hidden');
    btn.textContent = '❌ Cancel';
    document.getElementById('textInput').focus();
  } else {
    area.classList.add('hidden');
    btn.textContent = '✏️ Type Problem';
  }
}

// API detection with enhanced debugging
async function checkAvailability(retries = 3) {
  console.log("=== Checking API Availability ===");

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1}/${retries}`);

      // Check for LanguageModel first (more reliable)
      if (typeof LanguageModel !== "undefined") {
        console.log("LanguageModel found, checking availability...");
        const availability = await LanguageModel.availability();
        console.log("LanguageModel availability:", availability);

        if (availability === "available") {
          setStatus("apiStatus", "✅ Gemini Nano ready (LanguageModel API)!");
          return "prompt";
        }
      }

      // Fallback to Chat API
      if (typeof ai !== "undefined" && ai.canCreateTextSession) {
        console.log("ai.canCreateTextSession found, checking availability...");
        const availability = await ai.canCreateTextSession();
        console.log("Chat API availability:", availability);

        if (availability === "readily") {
          setStatus("apiStatus", "✅ Gemini Nano ready (Chat API)!");
          return "chat";
        }
      }

      console.log("No APIs available on this attempt");
      setStatus("apiStatus", "❌ Gemini Nano API not available.");
      return false;

    } catch (err) {
      console.error("Availability check error:", err);
      setStatus("apiStatus", `⚠️ Error: ${err.message}`);
      if (i === retries - 1) return false;
    }
  }
}

async function initSession(apiType) {
  if (session) return session;
  try {
    console.log("Creating session with apiType:", apiType);

    if (apiType === "chat") {
      console.log("Using ai.createTextSession()");
      session = await ai.createTextSession();
    } else if (apiType === "prompt") {
      console.log("Using LanguageModel.create() with outputLanguage");
      session = await LanguageModel.create({
        temperature: 0.3,
        topK: 3,
        outputLanguage: 'en'
      });
    } else {
      console.log("Fallback: trying LanguageModel.create() with outputLanguage");
      session = await LanguageModel.create({
        temperature: 0.3,
        topK: 3,
        outputLanguage: 'en'
      });
    }

    console.log("✅ Session created successfully:", session);
    return session;
  } catch (e) {
    console.error("❌ Session creation failed:", e);
    setStatus("apiStatus", `❌ Session failed: ${e.message}`);
    return null;
  }
}

// OCR placeholder - Chrome extensions have CSP restrictions that prevent Tesseract.js
async function performOCR(imageDataUrl) {
  setStatus('ocrStatus', '<span class="text-blue">🔍 Processing image...</span>');

  // For now, OCR is not available in Chrome extensions due to CSP restrictions
  // Users should use the "Type Problem" feature instead
  setStatus('ocrStatus', '<span class="text-red">❌ OCR not available in Chrome extensions due to security restrictions. Please use "Type Problem" to enter your math problem manually.</span>');

  return '';
}

// Capture tab screenshot
async function captureTab() {
  try {
    setStatus('ocrStatus', '<span class="text-blue">📸 Capturing tab...</span>');
    const response = await chrome.runtime.sendMessage({ type: 'CAPTURE_TAB' });

    if (!response) {
      throw new Error('No response from background script');
    }

    if (response.error) {
      throw new Error(response.error);
    }

    if (response.dataUrl) {
      setStatus('ocrStatus', '<span class="text-green">✅ Tab captured! Running OCR...</span>');
      await performOCR(response.dataUrl);
    } else {
      throw new Error('No image data received');
    }

  } catch (error) {
    console.error('Capture error:', error);
    setStatus("ocrStatus", `<span class='text-red'>❌ Capture failed: ${error.message}</span>`);
  }
}



// Display result
function displayResult(parsed) {
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = `
    <div class="mb-3">
      <h3 class="text-sm font-bold mb-1" style="color: #4338ca;">Answer:</h3>
      <div class="text-lg bg-white p-2 rounded border shadow-sm">${parsed.answer || 'No answer'}</div>
    </div>
    <div>
      <h3 class="text-sm font-bold mb-1" style="color: #4338ca;">Steps:</h3>
      <div class="space-y-1">
        ${(parsed.steps || []).map((s, i) => `<div class="bg-white p-2 rounded border shadow-sm text-xs break-words">${i + 1}. ${s}</div>`).join("")}
      </div>
    </div>
  `;
}

// Main solve function (exact same as working PWA)
async function solveProblem() {
  const apiType = await checkAvailability();
  if (!apiType) return;

  if (!extractedText) {
    setStatus("apiStatus", "❌ Please type a math problem first.");
    return;
  }

  const aiSession = await initSession(apiType);
  if (!aiSession) return;

  const button = document.getElementById("solveBtn");
  button.disabled = true;
  button.textContent = "⏳ Solving…";

  const prompt = `
Solve this math problem: "${extractedText}"

Return your answer in JSON:
{
  "answer": "the final answer in LaTeX format (e.g. x = 5)",
  "steps": ["Step 1: ...", "Step 2: ..."]
}`;

  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = "<div class='text-center' style='color: #6b7280;'>⏳ Solving…</div>";

  try {
    let fullResponse = '';
    let parsed;

    if (apiType === "chat") {
      // Streaming with Chat API
      const stream = aiSession.promptStreaming(prompt);
      let chunkCount = 0;
      for await (const chunk of stream) {
        fullResponse += chunk;
        chunkCount++;
        // Update UI progressively every few chunks
        if (chunkCount % 5 === 0) {
          updateUI(fullResponse);
        }
      }
      updateUI(fullResponse); // Final update
    } else {
      // Non-streaming with Prompt API
      const result = await aiSession.prompt(prompt);
      fullResponse = result;
      updateUI(fullResponse);
    }

    // Parse and finalize UI (same as PWA)
    try {
      let jsonMatch = fullResponse.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (!jsonMatch) {
        jsonMatch = fullResponse.match(/\{[\s\S]*?\}/);
      }
      if (jsonMatch) {
        let jsonString = jsonMatch[1] || jsonMatch[0];
        jsonString = jsonString.replace(/\\/g, '\\\\');
        parsed = JSON.parse(jsonString);
        console.log("Parsed JSON:", parsed);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("JSON parsing failed:", parseError);
      parsed = { answer: fullResponse, steps: [] };
    }

    displayResult(parsed);
    setStatus("apiStatus", "✅ Problem solved successfully!");
  } catch (e) {
    console.error("Error solving:", e);
    outputDiv.innerHTML = `<p class="text-center" style="color: #dc2626;">❌ ${e.message}</p>`;
    setStatus("apiStatus", `❌ Solving failed: ${e.message}`);
  } finally {
    button.disabled = false;
    button.textContent = "🧮 Solve Problem";
  }
}

// Progressive UI update during streaming (same as PWA)
function updateUI(response) {
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = `<div style="color: #374151; word-wrap: break-word;">${response.replace(/\n/g, '<br>')}</div>`;
}



// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("textInputBtn").addEventListener("click", toggleTextInput);
  document.getElementById("captureBtn").addEventListener("click", captureTab);

  // File upload handler
  document.getElementById("imageInput").addEventListener("change", async (event) => {
    const imageFile = event.target.files[0];
    if (imageFile) {
      setStatus('ocrStatus', '<span class="text-blue">📷 Processing uploaded image...</span>');
      await performOCR(imageFile);
    }
  });

  document.getElementById("solveTextBtn").addEventListener("click", () => {
    const text = document.getElementById('textInput').value.trim();
    if (text) {
      extractedText = text;
      toggleTextInput();
      setStatus("ocrStatus", `<span class='text-green'>✅ Ready to solve: "${text}"</span>`);
      setStatus("apiStatus", "Click 'Solve Problem' button below to get the solution!");
    } else {
      setStatus("ocrStatus", `<span class='text-red'>❌ Please enter a math problem</span>`);
    }
  });

  document.getElementById("solveBtn").addEventListener("click", solveProblem);

  // Initialize
  checkAvailability();
  checkForSelectedText();
});