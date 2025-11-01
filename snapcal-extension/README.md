# 🧮 SnapCal - Enhanced Chrome Extension

[![Built for Chrome AI Challenge 2025](https://img.shields.io/badge/Chrome%20AI%20Challenge-2025-4285f4?style=for-the-badge&logo=google-chrome)](https://googlechromeai.devpost.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **Enhanced AI-powered math solver using multiple Chrome built-in AI APIs**  
> Capture, type, or select math problems and get instant solutions with step-by-step explanations.

## 🎯 Prize Categories

- 🏆 **Most Helpful - Chrome Extension** ($14,000)
- 🎨 **Best Multimodal AI Application - Chrome Extension** ($9,000)
- 🔄 **Best Hybrid AI Application - Chrome Extension** ($9,000)

## ✨ Enhanced Features

### Core Functionality
- 📸 **Screen Capture** - Capture visible tab content with math problems
- 📁 **File Upload** - Upload images with mathematical content
- ✏️ **Text Input** - Type or paste math problems directly
- 🖱️ **Context Menu** - Right-click selected text to solve with SnapCal
- 🔍 **Smart OCR** - Enhanced text extraction with Tesseract.js

### AI-Powered Features
- 🧮 **Prompt API** - Advanced problem solving with Gemini Nano
- 📝 **Summarizer API** - Generate friendly explanations
- 🌐 **Translator API** - Multi-language support (when available)
- ✏️ **Rewriter API** - Simplify explanations for better understanding
- 🔧 **Proofreader API** - Clean up OCR text before processing

### User Experience
- 📐 **LaTeX Rendering** - Beautiful mathematical notation with MathJax
- 📋 **Step-by-Step Solutions** - Expandable detailed explanations
- 🔄 **Streaming Mode** - Real-time solution generation
- 📋 **Copy & Share** - Easy solution sharing and export
- 🎨 **Modern UI** - Clean, responsive interface with Tailwind CSS

## 🚀 Installation & Setup

### Prerequisites

1. **Chrome 131+** (Canary or Dev channel recommended)
2. **Enable Required Flags:**
   ```
   chrome://flags/#prompt-api → Enabled
   chrome://flags/#optimization-guide-on-device-model → Enabled BypassPerfRequirement
   chrome://flags/#summarization-api-for-gemini-nano → Enabled
   chrome://flags/#translation-api → Enabled (optional)
   chrome://flags/#rewriter-api → Enabled (optional)
   ```
3. **Restart Chrome** and wait for Gemini Nano to download (~1.7GB)
4. **Verify Download:** Check `chrome://components/` for "Optimization Guide On Device Model"

### Load Extension

1. **Download/Clone** this repository
2. **Open Chrome Extensions:** `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right)
4. **Click "Load unpacked"** and select the `snapcal-extension` folder
5. **Pin the extension** to your toolbar for easy access

## 📖 Usage

### Method 1: Screen Capture
1. Navigate to a webpage with math problems
2. Click the SnapCal extension icon
3. Click "📸 Capture Screen"
4. View the solution with steps and explanations

### Method 2: File Upload
1. Click the SnapCal extension icon
2. Click "Choose File" and select an image with math content
3. View the AI-generated solution

### Method 3: Text Input
1. Click the SnapCal extension icon
2. Click "✏️ Type Problem"
3. Enter your math problem in the text area
4. Click "🧮 Solve Problem"

### Method 4: Context Menu
1. Select mathematical text on any webpage
2. Right-click and choose "Solve with SnapCal"
3. The extension popup will open with the selected text ready to solve

## 🔧 Technical Architecture

### Chrome AI APIs Used

| API | Purpose | Status |
|-----|---------|--------|
| **Prompt API** | Core problem solving with Gemini Nano | ✅ Required |
| **Summarizer API** | Generate friendly explanations | ✅ Enhanced |
| **Translator API** | Multi-language support | 🔄 Optional |
| **Rewriter API** | Simplify explanations | 🔄 Optional |
| **Proofreader API** | Clean OCR text | 🔄 Optional |

### Key Components

- **AI Manager** - Central orchestrator for all Chrome AI API interactions
- **Input Manager** - Handles multiple input methods (capture, upload, text, selection)
- **Result Manager** - Processes and formats AI responses for display
- **Math Renderer** - LaTeX rendering with MathJax
- **Storage Manager** - Local preferences and solution history

### Browser Support

- ✅ Chrome 131+ (Canary/Dev with flags enabled)
- ❌ Other browsers (Chrome AI APIs are experimental)

## 🎥 Demo Video Script

### Recording Checklist (< 3 minutes)

✅ **Intro (15 seconds)**
- "Hi, I'm [Name], and this is SnapCal Enhanced"
- "An AI-powered math solver using Chrome's built-in AI"

✅ **Feature Demo (90 seconds)**
- Show screen capture solving a complex equation
- Demonstrate text input with step-by-step solution
- Show context menu selection and solving
- Display LaTeX rendering and explanations
- Show streaming mode in action

✅ **AI APIs Demo (45 seconds)**
- "This uses multiple Chrome AI APIs"
- Show Prompt API solving the problem
- Show Summarizer API generating explanations
- Show Rewriter API simplifying explanations
- "All processing happens on-device for privacy"

✅ **Technical Demo (20 seconds)**
- Show extension in Chrome DevTools
- Display AI API availability status
- Show offline functionality

✅ **Closing (10 seconds)**
- "Perfect for students and professionals"
- "All code is open source on GitHub"

## 🧪 Testing Checklist

Before submitting, verify:

- [ ] ✅ All Chrome AI flags are enabled
- [ ] ✅ Extension loads without errors
- [ ] ✅ Screen capture works correctly
- [ ] ✅ File upload processes images
- [ ] ✅ Text input solves problems
- [ ] ✅ Context menu appears on text selection
- [ ] ✅ LaTeX renders properly
- [ ] ✅ Step-by-step solutions expand/collapse
- [ ] ✅ AI explanations generate correctly
- [ ] ✅ Copy functionality works
- [ ] ✅ All buttons have hover effects
- [ ] ✅ Error handling works gracefully

## 🐛 Troubleshooting

### "AI APIs not available"
- ✅ Verify Chrome version ≥ 131 (`chrome://version`)
- ✅ Check all flags are enabled (`chrome://flags`)
- ✅ Restart Chrome completely
- ✅ Wait for model download (`chrome://components`)

### "Extension won't load"
- ✅ Enable Developer Mode in `chrome://extensions`
- ✅ Check console for JavaScript errors
- ✅ Verify all files are in the extension folder

### "OCR not working"
- ✅ Use clear, high-contrast images
- ✅ Ensure text is readable and not too small
- ✅ Try different image formats (PNG, JPG)

### "Math not solving correctly"
- ✅ Ensure mathematical notation is clear
- ✅ Try typing the problem manually
- ✅ Check if AI model is fully downloaded

## 🏆 Hackathon Submission

### DevPost Requirements

1. **Text Description:**

```
SnapCal Enhanced is a Chrome extension that demonstrates the full power of Chrome's 
built-in AI APIs for educational applications. It uses multiple AI APIs working 
together to provide comprehensive mathematical assistance:

🧮 Prompt API (Gemini Nano) - Core problem solving with step-by-step reasoning
📝 Summarizer API - Generate student-friendly explanations  
🌐 Translator API - Multi-language support for global accessibility
✏️ Rewriter API - Simplify complex explanations for better understanding
🔧 Proofreader API - Clean up OCR text for better accuracy

Key Features:
- Multiple input methods: screen capture, file upload, text input, context menu
- Real-time streaming solutions with progress indicators
- Beautiful LaTeX rendering for mathematical notation
- Expandable step-by-step explanations
- Copy and share functionality
- Completely offline after initial setup
- Privacy-first: all processing happens on-device

APIs Used: Prompt API, Summarizer API, Translator API, Rewriter API, Proofreader API

Problem Solved: Students and professionals need reliable math help that works 
anywhere, anytime, without privacy concerns or internet dependency. SnapCal 
Enhanced provides comprehensive mathematical assistance using Chrome's powerful 
on-device AI capabilities.
```

2. **Demo Video:** Upload to YouTube (public or unlisted)
3. **GitHub URL:** This repository (make it public!)
4. **Installation Instructions:** See above

### Submission Form Fields

- **Project Name:** SnapCal Enhanced - AI Math Solver
- **Tagline:** Comprehensive math solver using multiple Chrome AI APIs
- **Categories:** Education, Productivity, Accessibility, AI/ML
- **Built With:** Chrome Prompt API, Summarizer API, Translator API, Rewriter API, Gemini Nano, Tesseract.js, MathJax

## 📚 Additional Resources

- [Chrome Prompt API Docs](https://developer.chrome.com/docs/ai/prompt-api)
- [Summarizer API Docs](https://developer.chrome.com/docs/ai/summarizer-api)
- [Built-in AI Overview](https://developer.chrome.com/docs/ai/built-in-apis)
- [Chrome Extension Development](https://developer.chrome.com/docs/extensions/)

## 🤝 Contributing

This is a hackathon project, but improvements are welcome! Open an issue or PR.

## 📄 License

MIT License - feel free to use and modify for your own projects!

## 👨‍💻 Author

Built for the Google Chrome Built-in AI Challenge 2025

---

**Good luck with your submission! 🚀**