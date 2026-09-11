# Desktop Chaos 🌸🏎️🐈☠️

A deliberately useless desktop application designed to randomly interrupt your productivity with overlapping, uncoordinated desktop chaos.

---

## 🌸 Core Concept

Unlike typical apps that pick one random event at a time, **Desktop Chaos has NO centralized event selector**. 

Every single system operates on its own **independent timer**:
- 🌸 **Flower Spawner**: Spawns retro pixel-art flowers (Sakura, Sunflower, Rose, Bluebell, Violet, Daisy) at random screen coordinates.
- 🌺 **Flower Bursts**: Drops sudden clusters of 6–12 pixelated flowers simultaneously.
- 🧹 **Clear All System**: A floating button appears offering to clean the mess, but 50% of the time it mocks you and says `NOPE 😈`.
- 🏎️ **F1 Car**: Zooms across your desktop with engine roar audio (`neow.mp3`), speed trails (`VROOOOM!!`), and violently scatters flowers in its wake.
- 🐈 **ASCII Cat**: An ASCII feline strolls across the screen humming `nyan-cat_1.mp3`, swats at nearby flowers, and speaks when clicked.
- 💬 **Praise System**: Congratulates you for "handling this well" after you click and pop enough flowers.
- 🎵 **Productivity Alert (Rickroll)**: A rare alert that opens the Rick Astley music video in your default browser.

All of these can happen at the exact same time: flowers spawning while a cat strolls and an F1 car blasts past, scattering petals everywhere!

---

## 🖥️ Desktop Overlay Behavior

- **Transparent & Frameless**: Runs as an invisible overlay on top of all other windows.
- **Mouse Click-Through**: Clicks on empty screen space pass straight through to whatever background applications you are using (browser, code editor, office apps).
- **Interactive Targets**: Hovering over flowers, popups, the cat, or buttons immediately captures mouse interaction so you can click them.
- **Non-Focus-Stealing**: Does not steal your active keyboard focus, so you can continue typing.

---

## 🚀 How to Run

### Prerequisites
- Node.js (v18+) and npm installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Application
```bash
npm start
```

### 3. Packaging into Windows Executable (.exe)
```bash
npm run build
```
This generates a standalone `.exe` (portable and installer) in the `dist/` directory.

---

## ☠️ How to Quit

You can exit Desktop Chaos at any time using either method:
1. **Click the Corner Button**: Click the bright red `☠ QUIT CHAOS` button anchored in the bottom-right corner.
2. **Emergency Keyboard Shortcut**: Press `Ctrl + Shift + Q`.

---

## 📂 Project Architecture

```
useless-project/
├── package.json        # Dependencies, scripts (npm start, npm run build)
├── main.js             # Electron main process (overlay window, click-through, IPC)
├── preload.js          # Secure ContextBridge for mouse events & system browser
├── index.html          # Transparent layout and stage containers
├── style.css           # Styling, animations (popIn, wobble, shake, smoke trails)
├── renderer.js         # Independent timer engines & scatter physics
└── README.md           # Documentation
```
