# 🧮 SnapCal — Offline AI Study Assistant

**Built for the Google Chrome Built-in AI Challenge 2025**  
👨‍💻 **By Talha**, BS Artificial Intelligence Student from Pakistan 🇵🇰  

---

## 🚨 The Problem

In countries like **Pakistan**, students often face:
- ⚡ **Load-shedding** (power outages)
- 🌐 **Internet blackouts**
- 🚧 **Protests and instability** that disrupt connectivity  

When this happens, students can’t access online AI tools for studying, doing assignments, or solving math problems — leaving them stranded right before exams.

---

## 💡 The Solution — SnapCal

**SnapCal** is a lightweight **Chrome AI-powered web app and browser extension** that lets students:
- 📷 Solve math questions **from text or images**
- ✍️ Understand and rewrite study material  
- 🧠 Learn **fully offline**, even without an internet connection  

It’s powered by **Google Chrome’s built-in Gemini Nano AI**, using the **Prompt API** and **Multimodal API**, running directly on-device.

---

## ⚙️ Why It Matters

✅ **Offline-first** — works even during internet blackouts  
✅ **Private** — all processing happens locally  
✅ **Fast** — no API latency or server costs  
✅ **Accessible** — works on mid-tier or older hardware (Intel / AMD / NVIDIA)  
✅ **Built with Chrome Dev + Gemini Nano**  

---

## 🧱 Project Structure

```

snapcal/
├── public/                 # Web App
│   ├── index.html
│   ├── sw.js
│   ├── manifest.json
│   ├── test.html
│   └── README.md
└── snapcal-extension/      # Chrome Extension
├── manifest.json
├── popup.html / js / icons
└── background.js

```

---

## 🧠 Chrome Setup

1. Install **Chrome Dev** or **Chrome Canary**
2. Enable these flags:
```

chrome://flags/#prompt-api-for-gemini-nano
chrome://flags/#optimization-guide-on-device-model
chrome://flags/#on-device-model-service

```
3. Relaunch Chrome  
4. Visit `chrome://on-device-internals`
- Confirm **Gemini Nano model is loaded**
- If not, click **“Load Model”**  
5. You’re ready to run SnapCal fully offline 🚀

---

## 🌐 Web App Setup

📁 Files are inside `public/`

### Steps:
1. Ensure these files exist:
```

public/
├── index.html
├── sw.js
└── manifest.json

````
2. Start local server:
```bash
npm run dev
# or
python3 -m http.server 8000
````

3. Visit: [http://localhost:8000](http://localhost:8000)

---

## 🧩 Chrome Extension Setup

1. Open: `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **“Load Unpacked”** and select:

   ```
   snapcal/snapcal-extension/
   ```
4. Use SnapCal:

   * Highlight text → Right-click → “Solve with SnapCal”
   * Or open the popup and paste your math question

---

## 🧰 APIs Used

| API                     | Purpose                                                       |
| ----------------------- | ------------------------------------------------------------- |
| **Prompt API**          | Generate and solve natural language or math questions offline |
| **Multimodal API**      | Understand both text + image inputs                           |
| **On-Device Model API** | Leverage Gemini Nano locally without cloud calls              |

---

## 🎥 Demo Video

📺 [Watch Demo on YouTube (Coming Soon)](#)

---

## 📜 License

**MIT License** © 2025 **Talha**

---

## ❤️ A Note from the Developer

> “As a student in Pakistan, I’ve seen how unstable internet and power outages kill productivity.
> SnapCal is my way to make studying possible — even when everything else is down.”
> — *Talha*