export const elements = {
  leftNostril: document.getElementById('left-nostril'),
  rightNostril: document.getElementById('right-nostril'),
  breathFill: document.getElementById('breath-fill'),
  breathBar: document.getElementById('breath-bar'),
  instruction: document.getElementById('instruction'),
  timer: document.getElementById('timer'),
  totalTime: document.getElementById('totalTime'),
  cyclesCompleted: document.getElementById('cyclesCompleted'),
  startBtn: document.getElementById('startBtn'),
  pauseBtn: document.getElementById('pauseBtn'),
  resetBtn: document.getElementById('resetBtn'),
  levelSelect: document.getElementById('level'),
  customModal: document.getElementById('customModal'),
  customIn: document.getElementById('customIn'),
  customOut: document.getElementById('customOut'),
  customHold: document.getElementById('customHold'),
  soundBtn: document.getElementById('soundBtn'),
  volumeSlider: document.getElementById('volumeSlider'),
  customizeBtn: document.getElementById('customizeBtn'),
  customizationPanel: document.getElementById('customizationPanel'),
  fullscreenBtn: document.getElementById('fullscreenBtn'),
  darkModeToggle: document.getElementById('darkModeToggle'),
};

export function pauseAnimation(element) {
  element.classList.add('paused');
}

export function resumeAnimation(element) {
  element.classList.remove('paused');
}

export function updateBreathVisualization(phase, nostril, timeLeft, duration) {
  const activeNostril =
    nostril === 'left' ? elements.leftNostril : elements.rightNostril;
  const inactiveNostril =
    nostril === 'left' ? elements.rightNostril : elements.leftNostril;

  if (phase === 'ready' || phase === 'hold') {
    inactiveNostril.style.opacity = 1;
    activeNostril.style.opacity = 1;
  } else if (phase === 'out' || phase === 'in') {
    inactiveNostril.style.opacity = 0;
    activeNostril.style.opacity = 1;
  }

  if (phase === 'ready') {
    elements.breathFill.style.height = '100%';
    elements.breathFill.classList.remove('hold');
    activeNostril.style.transform = 'scale(1)';
    inactiveNostril.style.transform = 'scale(1)';
  } else if (phase === 'out') {
    const scale = 1 - (1 - 0.2) * ((duration - timeLeft) / duration);
    activeNostril.style.transform = `scale(${scale})`;
    inactiveNostril.style.transform = 'scale(1)';
    elements.breathFill.style.height = `${100 - ((duration - timeLeft) / duration) * 100}%`;
    elements.breathFill.classList.remove('hold');
  } else if (phase === 'in') {
    const scale = 0.2 + (1 - 0.2) * ((duration - timeLeft) / duration);
    activeNostril.style.transform = `scale(${scale})`;
    inactiveNostril.style.transform = 'scale(1)';
    elements.breathFill.style.height = `${((duration - timeLeft) / duration) * 100}%`;
    elements.breathFill.classList.remove('hold');
  } else if (phase === 'hold') {
    elements.breathFill.classList.add('hold');
    elements.breathFill.style.height = '100%';
    activeNostril.style.transform = 'scale(1)';
    inactiveNostril.style.transform = 'scale(1)';
  }

  elements.instruction.textContent =
    phase === 'ready'
      ? 'Select a level, breathe in and press Start to begin'
      : phase === 'out'
        ? `Breathe out through ${nostril} nostril`
        : phase === 'in'
          ? `Breathe in through ${nostril} nostril`
          : 'Hold breath';

  elements.breathFill.setAttribute(
    'aria-label',
    `Breath indicator - ${phase}: ${timeLeft} seconds remaining`
  );
}

export function updateBreathBarAccessibility(phase, timeLeft, duration) {
  const percentage = (duration - timeLeft) / duration * 100;
  elements.breathFill.setAttribute('aria-valuenow', percentage.toFixed(0));
  elements.breathFill.setAttribute('aria-valuemin', 0);
  elements.breathFill.setAttribute('aria-valuemax', 100);
  elements.breathBar.setAttribute('role', 'progressbar');
}

export function toggleFullscreen() {
  document.body.classList.toggle('fullscreen-mode');
  const isFullscreen = document.body.classList.contains('fullscreen-mode');
  elements.fullscreenBtn.textContent = isFullscreen ? 'Go Back' : 'Expand View';
  return isFullscreen;
}

export function setDarkMode(darkMode) {
  document.body.classList.toggle('light-mode', !darkMode);
  document.body.classList.toggle('dark-mode', darkMode);
  elements.darkModeToggle.textContent = darkMode ? 'Light Mode' : 'Dark Mode';
  localStorage.setItem('darkMode', darkMode);
}

export function toggleCustomPanel() {
  const isShowing = elements.customizationPanel.style.display === 'block';
  elements.customizationPanel.style.display = isShowing ? 'none' : 'block';
}

export function closeModal() {
  elements.customModal.style.display = 'none';
  if (elements.levelSelect.value === 'custom') {
    elements.levelSelect.value = '1';
  }
}

export function openModal() {
  elements.customModal.style.display = 'block';
}
