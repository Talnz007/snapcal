// AI Manager - Central orchestrator for all Chrome AI API interactions
class AIManager {
  constructor() {
    this.sessions = new Map();
    this.capabilities = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    console.log('Initializing AI Manager...');
    await this.checkAPIAvailability();
    await this.initializeSessions();
    this.initialized = true;
  }

  async checkAPIAvailability() {
    // Check for the older LanguageModel API first (more reliable)
    if (typeof LanguageModel !== 'undefined') {
      try {
        const availability = await LanguageModel.availability();
        if (availability === 'available') {
          this.capabilities.set('prompt', 'available');
          console.log('LanguageModel API available');
        } else {
          this.capabilities.set('prompt', availability);
        }
      } catch (error) {
        console.warn('LanguageModel API check failed:', error);
        this.capabilities.set('prompt', 'error');
      }
    }
    // Check for newer ai.languageModel API
    else if (typeof ai !== 'undefined' && ai.languageModel) {
      try {
        const capabilities = await ai.languageModel.capabilities();
        if (capabilities.available === 'readily') {
          this.capabilities.set('prompt', 'available');
          console.log('ai.languageModel API available');
        } else {
          this.capabilities.set('prompt', capabilities.available);
        }
      } catch (error) {
        console.warn('ai.languageModel API check failed:', error);
        this.capabilities.set('prompt', 'error');
      }
    } else {
      this.capabilities.set('prompt', 'not-available');
    }

    // Check other APIs if available
    const otherApis = [
      { name: 'summarizer', check: () => typeof ai !== 'undefined' && ai.summarizer },
      { name: 'translator', check: () => typeof ai !== 'undefined' && ai.translator },
      { name: 'rewriter', check: () => typeof ai !== 'undefined' && ai.rewriter }
    ];

    for (const api of otherApis) {
      try {
        const available = api.check();
        if (available) {
          const capability = await this.checkSpecificAPI(api.name);
          this.capabilities.set(api.name, capability);
        } else {
          this.capabilities.set(api.name, 'not-available');
        }
      } catch (error) {
        console.warn(`Error checking ${api.name} API:`, error);
        this.capabilities.set(api.name, 'error');
      }
    }
  }

  async checkSpecificAPI(apiName) {
    try {
      switch (apiName) {
        case 'prompt':
          if (ai && ai.languageModel) {
            const availability = await ai.languageModel.capabilities();
            return availability.available === 'readily' ? 'available' : availability.available;
          }
          break;
        case 'summarizer':
          if (ai && ai.summarizer) {
            const availability = await ai.summarizer.capabilities();
            return availability.available === 'readily' ? 'available' : availability.available;
          }
          break;
        case 'translator':
          if (ai && ai.translator) {
            const availability = await ai.translator.capabilities();
            return availability.available === 'readily' ? 'available' : availability.available;
          }
          break;
        case 'rewriter':
          if (ai && ai.rewriter) {
            const availability = await ai.rewriter.capabilities();
            return availability.available === 'readily' ? 'available' : availability.available;
          }
          break;
      }
      return 'not-available';
    } catch (error) {
      console.warn(`Error checking ${apiName}:`, error);
      return 'error';
    }
  }

  async initializeSessions() {
    // Initialize Prompt API session
    if (this.capabilities.get('prompt') === 'available') {
      try {
        let session;
        // Try LanguageModel first (more reliable)
        if (typeof LanguageModel !== 'undefined') {
          session = await LanguageModel.create({ 
            temperature: 0.3, 
            topK: 3, 
            outputLanguage: 'en' 
          });
        } 
        // Fallback to ai.languageModel
        else if (typeof ai !== 'undefined' && ai.languageModel) {
          session = await ai.languageModel.create({
            temperature: 0.3,
            topK: 3,
            outputLanguage: 'en'
          });
        }
        
        if (session) {
          this.sessions.set('prompt', session);
          console.log('Prompt API session initialized');
        }
      } catch (error) {
        console.warn('Failed to initialize Prompt API session:', error);
      }
    }

    // Initialize Summarizer API session
    if (this.capabilities.get('summarizer') === 'available') {
      try {
        const session = await ai.summarizer.create({
          type: 'key-points',
          format: 'plain-text',
          length: 'medium'
        });
        this.sessions.set('summarizer', session);
        console.log('Summarizer API session initialized');
      } catch (error) {
        console.warn('Failed to initialize Summarizer API session:', error);
      }
    }
  }

  async preprocessText(text) {
    // Use Proofreader API if available to clean up OCR text
    if (this.capabilities.get('proofreader') === 'available') {
      try {
        const session = await ai.proofreader.create();
        const corrected = await session.proofread(text);
        return corrected || text;
      } catch (error) {
        console.warn('Proofreader API failed, using original text:', error);
        return text;
      }
    }
    return text;
  }

  async solveMathProblem(text, options = {}) {
    await this.initialize();
    
    const cleanedText = await this.preprocessText(text);
    const promptSession = this.sessions.get('prompt');
    
    if (!promptSession) {
      throw new Error('Prompt API not available');
    }

    const prompt = this.buildMathPrompt(cleanedText, options);
    
    try {
      let result;
      if (promptSession.promptStreaming && options.streaming) {
        // Return streaming iterator
        return this.streamSolution(promptSession, prompt);
      } else {
        result = await promptSession.prompt(prompt);
      }
      
      const parsed = this.parseResponse(result);
      
      // Generate summary if requested and Summarizer API is available
      if (options.generateSummary && this.sessions.has('summarizer')) {
        try {
          const summary = await this.generateSummary(parsed.solution || result);
          parsed.summary = summary;
        } catch (error) {
          console.warn('Summary generation failed:', error);
        }
      }
      
      return parsed;
    } catch (error) {
      console.error('Math problem solving failed:', error);
      throw error;
    }
  }

  buildMathPrompt(text, options = {}) {
    const difficulty = options.difficulty || 'intermediate';
    const includeSteps = options.includeSteps !== false;
    
    return `
You are an expert mathematics tutor. Solve this math problem step by step.

Problem: "${text}"

Please provide your response in JSON format:
{
  "answer": "the final answer in LaTeX format",
  "steps": ["Step 1: explanation", "Step 2: explanation", ...],
  "explanation": "brief explanation of the approach used",
  "domain": "mathematical domain (algebra, calculus, geometry, etc.)"
}

${includeSteps ? 'Include detailed step-by-step reasoning.' : ''}
Difficulty level: ${difficulty}
Use proper mathematical notation and LaTeX formatting for equations.
`;
  }

  async *streamSolution(session, prompt) {
    let accumulator = '';
    try {
      for await (const chunk of session.promptStreaming(prompt)) {
        accumulator += chunk;
        yield { partial: accumulator, complete: false };
      }
      const parsed = this.parseResponse(accumulator);
      yield { ...parsed, complete: true };
    } catch (error) {
      throw error;
    }
  }

  parseResponse(response) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/```json\s*([\s\S]*?)```/i) || 
                       response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        let jsonStr = jsonMatch[1] || jsonMatch[0];
        // Fix common JSON issues with LaTeX
        jsonStr = jsonStr.replace(/\\\\/g, '\\\\');
        jsonStr = jsonStr.replace(/\\(?!["\\/bfnrtu\\])/g, '\\\\');
        
        const parsed = JSON.parse(jsonStr);
        return {
          answer: parsed.answer || '',
          steps: parsed.steps || [],
          explanation: parsed.explanation || '',
          domain: parsed.domain || 'general',
          solution: response
        };
      }
    } catch (error) {
      console.warn('Failed to parse JSON response:', error);
    }
    
    // Fallback: return raw response
    return {
      answer: response,
      steps: [],
      explanation: '',
      domain: 'general',
      solution: response
    };
  }

  async generateSummary(text) {
    const summarizerSession = this.sessions.get('summarizer');
    if (!summarizerSession) {
      throw new Error('Summarizer API not available');
    }
    
    try {
      const summary = await summarizerSession.summarize(text);
      return summary;
    } catch (error) {
      console.warn('Summary generation failed:', error);
      throw error;
    }
  }

  async translateSolution(solution, targetLanguage = 'es') {
    if (this.capabilities.get('translator') === 'available') {
      try {
        const session = await ai.translator.create({
          sourceLanguage: 'en',
          targetLanguage: targetLanguage
        });
        const translated = await session.translate(solution);
        return translated;
      } catch (error) {
        console.warn('Translation failed:', error);
        throw error;
      }
    }
    throw new Error('Translator API not available');
  }

  async rewriteExplanation(explanation, style = 'simpler') {
    if (this.capabilities.get('rewriter') === 'available') {
      try {
        const session = await ai.rewriter.create({
          tone: style === 'simpler' ? 'casual' : 'formal',
          format: 'plain-text'
        });
        const rewritten = await session.rewrite(explanation);
        return rewritten;
      } catch (error) {
        console.warn('Rewriting failed:', error);
        throw error;
      }
    }
    throw new Error('Rewriter API not available');
  }

  getCapabilities() {
    return Object.fromEntries(this.capabilities);
  }

  async cleanup() {
    for (const [name, session] of this.sessions) {
      try {
        if (session.destroy) {
          await session.destroy();
        }
      } catch (error) {
        console.warn(`Failed to cleanup ${name} session:`, error);
      }
    }
    this.sessions.clear();
    this.initialized = false;
  }
}

// Export for use in popup
window.AIManager = AIManager;