// Enhanced SnapCal Popup - Multiple Chrome AI APIs Integration
class SnapCalPopup {
  constructor() {
    this.aiManager = new AIManager();
    this.lastExtractedText = '';
    this.currentSolution = null;
    this.initializeElements();
    this.setupEventListeners();
    this.initialize();
  }

  initializeElements() {
    // Input elements
    this.captureBtn = document.getElementById('captureBtn');
    this.fileInput = document.getElementById('fileInput');
    this.textInputBtn = document.getElementById('textInputBtn');
    this.textInputArea = document.getElementById('textInputArea');
    this.textInput = document.getElementById('textInput');
    this.solveTextBtn = document.getElementById('solveTextBtn');
    
    // Status elements
    this.ocrStatus = document.getElementById('ocrStatus');
    this.apiStatus = document.getElementById('apiStatus');
    this.aiCapabilities = document.getElementById('aiCapabilities');
    this.progressBar = document.getElementById('progressBar');
    this.progressFill = document.getElementById('progressFill');
    
    // Output and options
    this.output = document.getElementById('output');
    this.generateSummary = document.getElementById('generateSummary');
    this.streamingMode = document.getElementById('streamingMode');
    this.clearBtn = document.getElementById('clearBtn');
  }

  setupEventListeners() {
    this.captureBtn.addEventListener('click', () => this.captureScreen());
    this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    this.textInputBtn.addEventListener('click', () => this.toggleTextInput());
    this.solveTextBtn.addEventListener('click', () => this.solveTextInput());
    this.clearBtn.addEventListener('click', () => this.clearResults());
  }

  async initialize() {
    this.setStatus(this.apiStatus, '<div class="loading-spinner"></div>Initializing AI systems...');
    
    try {
      await this.aiManager.initialize();
      const capabilities = this.aiManager.getCapabilities();
      this.displayCapabilities(capabilities);
      this.setStatus(this.apiStatus, '✅ AI systems ready');
      
      // Check for selected text from context menu
      await this.checkForSelectedText();
    } catch (error) {
      console.error('Initialization failed:', error);
      this.setStatus(this.apiStatus, `❌ Initialization failed: ${error.message}`);
    }
  }

  async checkForSelectedText() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SELECTED_TEXT' });
      if (response && response.text) {
        this.textInput.value = response.text;
        this.toggleTextInput(); // Show text input area
        this.setStatus(this.apiStatus, '📝 Selected text loaded - click "Solve Problem" to continue');
      }
    } catch (error) {
      // Ignore errors - no selected text available
      console.log('No selected text available');
    }
  }

  displayCapabilities(capabilities) {
    const available = Object.entries(capabilities)
      .filter(([_, status]) => status === 'available')
      .map(([name, _]) => name);
    
    if (available.length > 0) {
      this.aiCapabilities.innerHTML = `APIs: ${available.join(', ')}`;
    } else {
      this.aiCapabilities.innerHTML = 'No AI APIs available';
    }
  }

  setStatus(element, html) {
    if (element) element.innerHTML = html;
  }

  showProgress(show = true, progress = 0) {
    if (show) {
      this.progressBar.classList.remove('hidden');
      this.progressFill.style.width = `${progress}%`;
    } else {
      this.progressBar.classList.add('hidden');
    }
  }

  toggleTextInput() {
    const isHidden = this.textInputArea.classList.contains('hidden');
    if (isHidden) {
      this.textInputArea.classList.remove('hidden');
      this.textInput.focus();
      this.textInputBtn.textContent = '❌ Cancel';
    } else {
      this.textInputArea.classList.add('hidden');
      this.textInputBtn.textContent = '✏️ Type Problem';
    }
  }

  async captureScreen() {
    this.setStatus(this.ocrStatus, 'Capturing screen...');
    this.showProgress(true, 10);
    
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, async (dataUrl) => {
      if (chrome.runtime.lastError) {
        this.setStatus(this.ocrStatus, `❌ Capture failed: ${chrome.runtime.lastError.message}`);
        this.showProgress(false);
        return;
      }
      
      try {
        const blob = await this.dataUrlToBlob(dataUrl);
        const text = await this.runOCR(blob);
        if (text) {
          await this.solveProblem(text);
        }
      } catch (error) {
        console.error('Screen capture processing failed:', error);
        this.setStatus(this.ocrStatus, `❌ Processing failed: ${error.message}`);
        this.showProgress(false);
      }
    });
  }

  async handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.setStatus(this.ocrStatus, 'Processing uploaded image...');
    this.showProgress(true, 10);

    try {
      const text = await this.runOCR(file);
      if (text) {
        await this.solveProblem(text);
      }
    } catch (error) {
      console.error('File upload processing failed:', error);
      this.setStatus(this.ocrStatus, `❌ Processing failed: ${error.message}`);
      this.showProgress(false);
    }
  }

  async solveTextInput() {
    const text = this.textInput.value.trim();
    if (!text) {
      this.setStatus(this.apiStatus, '❌ Please enter a math problem');
      return;
    }

    this.toggleTextInput(); // Hide text input area
    await this.solveProblem(text);
  }

  async dataUrlToBlob(dataUrl) {
    const response = await fetch(dataUrl);
    return await response.blob();
  }

  async runOCR(blob) {
    this.setStatus(this.ocrStatus, '🔍 Extracting text from image...');
    this.showProgress(true, 20);

    try {
      // Check if Tesseract is available
      if (typeof Tesseract === 'undefined') {
        throw new Error('Tesseract is not loaded. Please refresh the extension.');
      }

      const { data: { text } } = await Tesseract.recognize(blob, 'eng', {
        logger: (m) => {
          if (m.status && m.progress) {
            const progress = 20 + (m.progress * 30); // OCR takes 20-50% of progress
            this.showProgress(true, progress);
            this.setStatus(this.ocrStatus, `🔍 OCR: ${m.status} ${(m.progress * 100).toFixed(0)}%`);
          }
        }
      });

      const extractedText = text.trim();
      this.lastExtractedText = extractedText;
      
      if (extractedText) {
        this.setStatus(this.ocrStatus, `✅ Extracted: "${extractedText}"`);
        this.showProgress(true, 50);
        return extractedText;
      } else {
        this.setStatus(this.ocrStatus, '⚠️ No text found in image');
        this.showProgress(false);
        return null;
      }
    } catch (error) {
      this.setStatus(this.ocrStatus, `❌ OCR failed: ${error.message}`);
      this.showProgress(false);
      throw error;
    }
  }

  async solveProblem(text) {
    this.setStatus(this.apiStatus, '🧮 Solving math problem...');
    this.showProgress(true, 60);

    try {
      // Check API availability using the same method as the working PWA
      let session = null;
      let apiType = null;

      // Try LanguageModel first (more reliable)
      if (typeof LanguageModel !== 'undefined') {
        try {
          const availability = await LanguageModel.availability();
          if (availability === 'available') {
            session = await LanguageModel.create({ 
              temperature: 0.3, 
              topK: 3, 
              outputLanguage: 'en' 
            });
            apiType = 'LanguageModel';
            this.setStatus(this.apiStatus, '✅ Using LanguageModel API');
          }
        } catch (error) {
          console.warn('LanguageModel failed:', error);
        }
      }

      // Fallback to ai.languageModel
      if (!session && typeof ai !== 'undefined' && ai.languageModel) {
        try {
          const capabilities = await ai.languageModel.capabilities();
          if (capabilities.available === 'readily') {
            session = await ai.languageModel.create({
              temperature: 0.3,
              topK: 3,
              outputLanguage: 'en'
            });
            apiType = 'ai.languageModel';
            this.setStatus(this.apiStatus, '✅ Using ai.languageModel API');
          }
        } catch (error) {
          console.warn('ai.languageModel failed:', error);
        }
      }

      if (!session) {
        throw new Error('No AI API available. Please check Chrome flags and Gemini Nano installation.');
      }

      const prompt = `
Solve this math problem: "${text}"

Return your answer in JSON:
{
  "answer": "the final answer in LaTeX format (e.g. x = 5)",
  "steps": ["Step 1: ...", "Step 2: ..."]
}`;

      this.showProgress(true, 70);
      
      let result;
      if (this.streamingMode.checked && session.promptStreaming) {
        // Try streaming
        let fullResponse = '';
        for await (const chunk of session.promptStreaming(prompt)) {
          fullResponse += chunk;
          this.displayPartialSolution(fullResponse);
        }
        result = fullResponse;
      } else {
        // Non-streaming
        result = await session.prompt(prompt);
      }

      this.showProgress(true, 90);
      
      // Parse the result
      const parsed = this.parseAIResponse(result);
      await this.displaySolution(parsed);
      this.showProgress(false);
      
    } catch (error) {
      console.error('Problem solving failed:', error);
      this.setStatus(this.apiStatus, `❌ Solving failed: ${error.message}`);
      this.showProgress(false);
    }
  }

  parseAIResponse(response) {
    try {
      // Try to extract JSON from response (same as working PWA)
      let jsonMatch = response.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (!jsonMatch) {
        jsonMatch = response.match(/\{[\s\S]*?\}/);
      }
      
      if (jsonMatch) {
        let jsonString = jsonMatch[1] || jsonMatch[0];
        jsonString = jsonString.replace(/\\/g, '\\\\');
        const parsed = JSON.parse(jsonString);
        return {
          answer: parsed.answer || '',
          steps: parsed.steps || [],
          explanation: parsed.explanation || '',
          solution: response
        };
      }
    } catch (error) {
      console.warn('JSON parsing failed:', error);
    }
    
    // Fallback: return raw response
    return {
      answer: response,
      steps: [],
      explanation: '',
      solution: response
    };
  }

  async handleStreamingSolution(text, options) {
    this.output.innerHTML = '<div class="text-gray-600">🔄 Streaming solution...</div>';
    
    try {
      const stream = await this.aiManager.solveMathProblem(text, options);
      let progress = 60;
      
      for await (const chunk of stream) {
        progress = Math.min(90, progress + 2);
        this.showProgress(true, progress);
        
        if (chunk.complete) {
          await this.displaySolution(chunk);
          this.showProgress(false);
          break;
        } else {
          this.displayPartialSolution(chunk.partial);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  displayPartialSolution(partialText) {
    this.output.innerHTML = `
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div class="flex items-center mb-2">
          <div class="loading-spinner"></div>
          <span class="text-blue-700 font-medium">Generating solution...</span>
        </div>
        <pre class="whitespace-pre-wrap text-sm text-gray-700">${this.escapeHtml(partialText)}</pre>
      </div>
    `;
  }

  async displaySolution(result) {
    this.currentSolution = result;
    
    const answerHtml = result.answer ? 
      `<div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <h3 class="font-bold text-green-800 mb-2">📝 Answer</h3>
        <div class="math-content bg-white p-3 rounded border">$$${result.answer}$$</div>
      </div>` : '';

    const stepsHtml = result.steps && result.steps.length > 0 ? 
      `<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <button class="accordion-toggle flex items-center justify-between w-full text-left font-bold text-blue-800 mb-2" onclick="this.nextElementSibling.classList.toggle('open')">
          <span>📋 Step-by-step Solution (${result.steps.length} steps)</span>
          <span class="text-blue-600">▼</span>
        </button>
        <div class="accordion-content">
          <div class="space-y-2 mt-2">
            ${result.steps.map((step, i) => 
              `<div class="bg-white p-3 rounded border">
                <span class="font-medium text-blue-700">Step ${i + 1}:</span>
                <span class="ml-2">${this.escapeHtml(step)}</span>
              </div>`
            ).join('')}
          </div>
        </div>
      </div>` : '';

    const summaryHtml = result.summary ? 
      `<div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
        <h3 class="font-bold text-purple-800 mb-2">💡 Summary</h3>
        <p class="text-purple-700">${this.escapeHtml(result.summary)}</p>
      </div>` : '';

    const actionsHtml = `
      <div class="flex flex-wrap gap-2 mt-4">
        <button onclick="snapcal.copySolution()" class="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
          📋 Copy
        </button>
        <button onclick="snapcal.generateSummary()" class="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700">
          💡 Explain
        </button>
        <button onclick="snapcal.rewriteExplanation()" class="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700">
          ✏️ Simplify
        </button>
      </div>
    `;

    this.output.innerHTML = answerHtml + stepsHtml + summaryHtml + actionsHtml;

    // Render MathJax
    if (window.MathJax) {
      await MathJax.startup.promise;
      await MathJax.typesetPromise([this.output]);
    }

    this.setStatus(this.apiStatus, '✅ Solution complete');
  }

  async copySolution() {
    if (!this.currentSolution) return;
    
    const text = `Problem: ${this.lastExtractedText}\n\nAnswer: ${this.currentSolution.answer}\n\nSteps:\n${this.currentSolution.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}`;
    
    try {
      await navigator.clipboard.writeText(text);
      this.setStatus(this.apiStatus, '✅ Solution copied to clipboard');
    } catch (error) {
      console.error('Copy failed:', error);
      this.setStatus(this.apiStatus, '❌ Copy failed');
    }
  }

  async generateSummary() {
    if (!this.currentSolution) return;
    
    this.setStatus(this.apiStatus, '💡 Generating explanation...');
    
    try {
      const summary = await this.aiManager.generateSummary(this.currentSolution.solution);
      
      // Add summary to the display
      const summaryDiv = document.createElement('div');
      summaryDiv.className = 'bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4';
      summaryDiv.innerHTML = `
        <h3 class="font-bold text-yellow-800 mb-2">🎯 AI Explanation</h3>
        <p class="text-yellow-700">${this.escapeHtml(summary)}</p>
      `;
      this.output.appendChild(summaryDiv);
      
      this.setStatus(this.apiStatus, '✅ Explanation generated');
    } catch (error) {
      console.error('Summary generation failed:', error);
      this.setStatus(this.apiStatus, '❌ Explanation failed');
    }
  }

  async rewriteExplanation() {
    if (!this.currentSolution) return;
    
    this.setStatus(this.apiStatus, '✏️ Simplifying explanation...');
    
    try {
      const simplified = await this.aiManager.rewriteExplanation(this.currentSolution.explanation || this.currentSolution.solution, 'simpler');
      
      // Add simplified explanation to the display
      const simplifiedDiv = document.createElement('div');
      simplifiedDiv.className = 'bg-green-50 border border-green-200 rounded-lg p-4 mt-4';
      simplifiedDiv.innerHTML = `
        <h3 class="font-bold text-green-800 mb-2">🌟 Simplified Explanation</h3>
        <p class="text-green-700">${this.escapeHtml(simplified)}</p>
      `;
      this.output.appendChild(simplifiedDiv);
      
      this.setStatus(this.apiStatus, '✅ Simplified explanation generated');
    } catch (error) {
      console.error('Rewriting failed:', error);
      this.setStatus(this.apiStatus, '❌ Simplification failed');
    }
  }

  clearResults() {
    this.output.innerHTML = '';
    this.setStatus(this.ocrStatus, '');
    this.setStatus(this.apiStatus, '');
    this.currentSolution = null;
    this.lastExtractedText = '';
    this.showProgress(false);
    if (this.fileInput) this.fileInput.value = '';
    if (this.textInput) this.textInput.value = '';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the popup when DOM is loaded
let snapcal;
document.addEventListener('DOMContentLoaded', () => {
  snapcal = new SnapCalPopup();
});

// Make functions available globally for button clicks
window.snapcal = {
  copySolution: () => snapcal?.copySolution(),
  generateSummary: () => snapcal?.generateSummary(),
  rewriteExplanation: () => snapcal?.rewriteExplanation()
};