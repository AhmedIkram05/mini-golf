# 2D Mini-Golf Game ⛳

A browser-based 2D mini-golf game built with vanilla JavaScript and HTML5 Canvas. Use your mouse to aim, set your power, and sink the ball in as few strokes as possible.

## 📸 Screenshot

![2D Mini-Golf gameplay](assets/images/screenshot.png)

## 🧠 Tech Stack

- **HTML5 Canvas** — Game rendering and animation loop
- **CSS3** — Layout and UI styling
- **JavaScript (ES6)** — Game physics, collision detection, input handling, and state management
- **Web Audio API** — Sound effects for shots and ball interactions

## 🎮 How to Play

1. **Aim** — Move your mouse to set the shot direction
2. **Power** — Click and hold to charge your shot; release to hit
3. **Objective** — Get the ball into the hole in as few strokes as possible

## ✨ Features

- Ball physics with velocity, friction, and boundary collision
- Mouse-based aim and power system with visual feedback
- Stroke counter with par tracking
- Sound effects via Web Audio API
- Responsive canvas scaling for different screen sizes

## 📁 Project Structure

```
2d-mini-golf/
├── index.html        # Game entry point
├── styles.css        # Layout and UI styles
├── script.js         # Game logic, physics, and input handling
└── assets/
    ├── images/       # Background and UI assets
    └── sounds/       # Sound effect files
```

## 🧪 How to Run

No installation required — open `index.html` directly in any modern browser, or serve locally:

```bash
git clone https://github.com/AhmedIkram05/2d-mini-golf.git
cd 2d-mini-golf
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

> **Note:** If you update any JS or CSS files, bump the `v=` query string on asset references in `index.html` to force browsers to fetch the latest version (e.g. `styles.css?v=2`).
