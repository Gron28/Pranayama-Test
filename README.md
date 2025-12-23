# Breathing Exercise Visualizer

A simple, interactive tool to visualize and practice breathing exercises with real-time feedback.

## Features

- 5 preset breathing levels (customizable)
- Real-time visual feedback with animations
- Sound cues (optional)
- Dark/light mode
- Customizable colors
- Timer and cycle counter
- Fullscreen mode

## Quick Start

```bash
npm install
npm run build
cd dist
python3 -m http.server 8000
```

Visit `http://localhost:8000`

## Development

```bash
npm run watch  # Auto-rebuild on changes
```

## Build

```bash
npm run build      # Full build
npm run build:scss # CSS only
npm run build:js   # JavaScript only
npm run build:html # HTML only
```

## Customization

### Change Colors

Edit `src/scss/_variables.scss`:

```scss
$ida-blue: #004dab;           // Left side
$pingala-red: #ff2a00;        // Right side
$sushumna-yellow: #fee74d;    // Inhale
$sushumna-green: #00a550;     // Hold
```

### Add Breathing Levels

Edit `src/js/constants.js`:

```javascript
const levelConfigs = {
    1: { out: 20, in: 10, hold: 0 },
    2: { out: 30, in: 15, hold: 0 },
    // Add new level here
};
```

Then update the select element in `src/partials/02-main.html`.

## Deploy to GitHub Pages

```bash
npm run build
git add -A
git commit -m "build update"
git push origin main
```

Then configure GitHub Pages to use the `/dist` folder in your repo settings.
