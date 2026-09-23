# Tic Tac Toe

A lightweight, responsive Tic Tac Toe game built with vanilla HTML, CSS, and JavaScript. The project is intentionally framework-free and works as a small browser game for casual play.

## Features

- Three computer difficulty levels: Easy, Normal, and Hard

- 3 × 3 classic board with 3 marks required to win
- 5 × 5 extended board with 5 marks required to win
- Player vs Computer mode
- Local Two Player mode
- Lightweight computer opponent that can win, block, and prefer useful positions
- Per-session X / Draw / O scoreboard
- Restart and back-to-setup controls
- Keyboard shortcuts: `R` to restart and `Esc` to return to setup
- Responsive layout for desktop and mobile
- Animated canvas background with reduced-motion support
- Accessible buttons, board labels, status updates, and visible keyboard focus

## Project structure

```text
tic-tac-toe/
├── index.html
├── README.md
├── js/
│   ├── background.js
│   ├── const.js
│   ├── handleDOM.js
│   ├── logicGame.js
│   ├── main.js
│   └── useDisplay.js
└── styles/
    ├── style.css
    ├── tic-tac-toe.css
    └── variables.css
```

## Run locally

Because the JavaScript uses ES modules, run the project through a small local web server instead of opening `index.html` directly.

For example, with Python:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

## Tech stack

- HTML5
- CSS3
- JavaScript (ES modules)
- Canvas API
- Google Fonts (Inter and Space Grotesk)

No UI framework or build step is required.
