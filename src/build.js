const fs = require('fs');
const path = require('path');

const partialsDir = path.join(__dirname, 'partials');
const outDir = path.join(__dirname, '..');
const outFile = path.join(outDir, 'dist', 'index.html');

function build() {
  const files = fs.readdirSync(partialsDir)
    .filter(f => f.endsWith('.html'))
    .sort();

  const parts = files.map(f => fs.readFileSync(path.join(partialsDir, f), 'utf8'));
  if (!fs.existsSync(path.dirname(outFile))) fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, parts.join('\n'), 'utf8');
  console.log(`Built ${outFile}`);
}

if (process.argv.includes('--watch')) {
  build();
  console.log('Watching partials for changes...');
  fs.watch(partialsDir, { recursive: false }, (eventType, filename) => {
    if (filename && filename.endsWith('.html')) {
      try { build(); } catch (e) { console.error(e); }
    }
  });
} else {
  build();
}
