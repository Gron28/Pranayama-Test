# Pranayama Practice Guide

A modern, interactive web-based tool for guided pranayama (alternate nostril breathing) practice based on *Liber E* by Aleister Crowley. Built with vanilla JavaScript, Sass, and a professional modular architecture.

## Features

✨ **Interactive Breathing Practice**
- 5 preset breathing levels with varying timing
- Custom breath configuration
- Real-time visual feedback (nostril animation and breath bar)
- Audible phase transition cues
- Cycle counter

🎨 **Customization**
- Light/dark mode toggle
- Customizable colors for left/right nostrils and breath visualization
- Persisted settings via localStorage

🎵 **Audio Controls**
- Adjustable volume slider
- Sound toggle for ticking and phase transitions
- Web Audio API for frequency synthesis

⌨️ **Controls**
- Start/Pause/Reset buttons
- Level selector with custom mode
- Fullscreen expansion view
- Responsive design for desktop and mobile

📚 **Information Sections**
- Context about pranayama practice
- Recommendations from *Liber E*
- Excerpts from the original text
- About the app
- Further reading resources

## Project Structure

```
pranayama-test/
├── src/
│   ├── scss/
│   │   ├── _variables.scss    # Design tokens (colors, spacing, typography)
│   │   ├── _mixins.scss       # Reusable style patterns
│   │   └── main.scss          # Main stylesheet
│   ├── js/
│   │   ├── constants.js       # Level configs and utilities
│   │   ├── audio.js           # Web Audio API wrapper
│   │   ├── ui.js              # DOM cache and animation handlers
│   │   ├── timer.js           # Breathing state machine
│   │   └── app.js             # Event initialization
│   ├── partials/
│   │   ├── 00-head.html       # Meta tags, links to assets
│   │   ├── 01-styles.html     # (empty, CSS from SCSS)
│   │   ├── 02-main.html       # Main UI markup
│   │   ├── 03-customization.html
│   │   ├── 04-collapsibles.html
│   │   ├── 05-modal.html
│   │   └── 06-scripts.html    # Script tags
│   └── build.js               # HTML concatenation script
├── dist/
│   ├── assets/
│   │   ├── app.css            # Compiled Sass
│   │   └── app.js             # Bundled JavaScript
│   └── index.html             # Generated entry point
├── package.json
└── README.md
```

## Setup

### Prerequisites
- Node.js 14+ (download from [nodejs.org](https://nodejs.org))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Pranayama-Test
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Open `dist/index.html` in your browser or serve locally:
```bash
cd dist
python3 -m http.server 8000
# or with Node
npx http-server
```

Then visit `http://localhost:8000`

## Development

### Watch Mode
To automatically rebuild on file changes:
```bash
npm run watch
```

This runs three concurrent processes:
- SCSS compilation watcher
- JavaScript bundling watcher
- HTML partial concatenation watcher

### Build Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Full build (SCSS + JS + HTML) |
| `npm run build:scss` | Compile Sass only |
| `npm run build:js` | Bundle JavaScript only |
| `npm run build:html` | Concatenate HTML partials only |
| `npm run watch` | Watch all sources for changes |
| `npm run watch:scss` | Watch SCSS only |
| `npm run watch:js` | Watch JS only |

## Architecture

### Modular JavaScript (ES6)

The codebase is organized into focused modules with clear responsibilities:

- **`constants.js`**: Immutable configuration (breathing levels, time formatting utilities)
- **`audio.js`**: Web Audio API abstraction (sound generation, volume control)
- **`ui.js`**: DOM manipulation and visual updates (animations, theme toggling, modals)
- **`timer.js`**: Core breathing state machine and 1-second timer loop with drift compensation
- **`app.js`**: Event listener initialization and feature coordination

All modules export functions/objects used by other modules, avoiding global state pollution.

### Modular Sass (SCSS)

- **`_variables.scss`**: Design tokens (25+ CSS custom properties for colors, typography, spacing, transitions)
- **`_mixins.scss`**: Reusable patterns (@media queries, transitions, themed text, button styling)
- **`main.scss`**: Component-organized styles importing variables and mixins

### Static Site Builder

A simple Node.js script (`src/build.js`) concatenates HTML partials in alphabetical order (`00-*` through `06-*`) to produce a single `dist/index.html`. This allows splitting a large HTML file into logical sections without introducing a frontend framework.

## Deployment to GitHub Pages

1. Ensure the build output is in the `dist/` folder:
```bash
npm run build
```

2. Commit and push to your repository:
```bash
git add -A
git commit -m "refactor: modularize into professional structure"
git push origin main
```

3. In your GitHub repository settings:
   - Go to **Settings** → **Pages**
   - Under "Source", select **Deploy from a branch**
   - Choose **main** branch and **`/dist` folder**
   - Click **Save**

Your site will be live at `https://<username>.github.io/Pranayama-Test/`

## Browser Support

- Chrome/Edge 60+
- Firefox 55+
- Safari 12+
- Modern mobile browsers (iOS Safari, Chrome Android)

Requires JavaScript enabled and Web Audio API support.

## Customization

### Changing Colors

Edit `src/scss/_variables.scss` to modify the color palette:

```scss
$ida-blue: #004dab;           // Left nostril
$pingala-red: #ff2a00;        // Right nostril
$sushumna-yellow: #fee74d;    // Breath inhale
$sushumna-green: #00a550;     // Breath hold
```

Then rebuild:
```bash
npm run build:scss
```

### Adding New Breathing Levels

Edit `src/js/constants.js`:

```javascript
const levelConfigs = {
    1: { out: 20, in: 10, hold: 0 },
    2: { out: 30, in: 15, hold: 0 },
    3: { out: 15, in: 15, hold: 15 },
    4: { out: 40, in: 20, hold: 0 },
    5: { out: 20, in: 10, hold: 30 },
    // Add new level:
    6: { out: 25, in: 12, hold: 12 }
};
```

Then update the select element in `src/partials/02-main.html` and rebuild.

## Browser Console Errors & Debugging

To check for errors:
1. Open the browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Reload the page

Common issues:
- **Script not loading**: Verify `dist/assets/app.js` exists (run `npm run build`)
- **Styles not applying**: Check that `dist/assets/app.css` is linked in the HTML
- **Audio not working**: Some browsers require user interaction before playing sounds

## License

This project is for educational purposes, inspired by *Liber E* by Aleister Crowley.

## Contributing

To improve this project:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and rebuild: `npm run build`
3. Test thoroughly in `dist/index.html`
4. Commit: `git commit -m "feat: description"`
5. Push and open a pull request

## Resources

- **Pranayama**: https://en.wikipedia.org/wiki/Pranayama
- **Liber E by Aleister Crowley**: Available in *Magick in Theory and Practice*
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Sass Documentation**: https://sass-lang.com/documentation

---

**Built with modern web standards:** Vanilla JavaScript (ES6 modules), Sass, HTML5, and Web Audio API.
