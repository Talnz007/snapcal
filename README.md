# 🧮 SnapCal — Offline AI Study Assistant

**Built for the Google Chrome Built-in AI Challenge 2025**  
👨‍💻 **By Talha**, BS Artificial Intelligence Student from Pakistan 🇵🇰  

---

## 🚨 The Problem

In countries like **Pakistan**, students often face:
- ⚡ Frequent **load-shedding** (power outages)
- 🌐 **Internet blackouts**
- 🚧 **Protests and instability** that disrupt connectivity  

When this happens, students can’t access online AI tools for studying, doing assignments, or solving math problems — leaving them stranded right before exams.

---

## 💡 The Solution — SnapCal

**SnapCal** is a lightweight **Chrome AI-powered web app and extension** that helps students:
- 📷 Solve **math questions from text or images**
- ✍️ Rewrite and explain study material  
- 🧠 Learn **fully offline**, even without internet  

It’s powered by **Google Chrome’s built-in Gemini Nano AI**, using the **Prompt API** and **Multimodal API**, running **directly on-device**.

---

## ⚙️ Why It Matters

✅ **Offline-first** — works even during internet blackouts  
✅ **Private** — all processing happens locally  
✅ **Fast** — zero latency, no API or server needed  
✅ **Accessible** — optimized for mid-range devices  
✅ **Built with**: Chrome Dev + Gemini Nano  

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

## 🧠 Chrome Setup (Gemini Nano Model)

1. Install **Chrome Dev** or **Chrome Canary**  
2. Enable the following flags:  
```

chrome://flags/#prompt-api-for-gemini-nano
chrome://flags/#optimization-guide-on-device-model
chrome://flags/#on-device-model-service

```
3. Relaunch Chrome  
4. Go to: `chrome://on-device-internals`  
5. Confirm **Gemini Nano model is loaded**  
   - If not → click **“Load Model”**  
6. Done! Gemini Nano is now ready to run locally 🚀  

---

## 🌐 Web App Setup

📁 Located in the `public/` folder

### Steps
1. Ensure these files exist:
```

public/
├── index.html
├── sw.js
└── manifest.json

````
2. Start a local server:
```bash
npm run dev
# or
python3 -m http.server 8000
````

3. Visit → [http://localhost:8000](http://localhost:8000)
4. SnapCal web app is ready to use offline 🎯

---

## 🧩 Chrome Extension Setup

1. Open → `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **“Load Unpacked”** → select:

   ```
   snapcal/snapcal-extension/
   ```
4. Use SnapCal:

   * Highlight text → Right-click → **“Solve with SnapCal”**
   * Or open popup → paste a math question
   * Works **offline** using **Gemini Nano**

---

## 🧰 APIs Used

| API                     | Purpose                                                |
| ----------------------- | ------------------------------------------------------ |
| **Prompt API**          | Generate and solve math/natural language tasks offline |
| **Multimodal API**      | Handle both text and image inputs                      |
| **On-Device Model API** | Run Gemini Nano locally without cloud calls            |

---

## 🎥 Demo Video

🎬 **Watch the full demo on YouTube:**
👉 [https://youtu.be/xB7bwWjI3jg](https://youtu.be/xB7bwWjI3jg)

<details>
<summary>▶️ Embedded Demo</summary>

[![SnapCal Demo](https://img.youtube.com/vi/xB7bwWjI3jg/0.jpg)](https://youtu.be/xB7bwWjI3jg)

</details>

---

## 🧪 Testing Instructions

To test SnapCal:

1. Follow the **Chrome Setup** steps above to enable Gemini Nano
2. For the **Web App**:

   * Run `python3 -m http.server 8000`
   * Open [http://localhost:8000](http://localhost:8000)
3. For the **Extension**:

   * Load unpacked → `snapcal/snapcal-extension/`
   * Try solving a text or image math problem
4. Disable Wi-Fi — SnapCal still works offline ✅

---

## 📜 License

**MIT License** © 2025 **Talha**

---

## ❤️ A Note from the Developer

> “As a student in Pakistan, I’ve seen how unstable internet and power outages kill productivity.
> SnapCal is my way to make studying possible — even when everything else is down.”
> — *Talha*
