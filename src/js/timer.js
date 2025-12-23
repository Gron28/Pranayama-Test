import {
  levelConfigs,
  formatTime,
} from './constants.js';
import {
  playTickSound,
  playPhaseTransitionSound,
} from './audio.js';
import {
  elements,
  updateBreathVisualization,
  updateBreathBarAccessibility,
} from './ui.js';

let timerStartTime = 0;
let expectedTickTime = 0;
let timer = null;

export const state = {
  currentPhase: 'ready',
  timeLeft: 0,
  totalSeconds: 0,
  cycles: 0,
  currentNostril: 'left',
  isPaused: false,
  customConfig: {},
};

function scheduleNextTick() {
  const now = performance.now();
  const delay = Math.max(0, expectedTickTime - now);
  timer = setTimeout(updateTimer, delay);
}

export function updateTimer() {
  if (!state.isPaused && state.currentPhase !== 'ready') {
    const now = performance.now();
    const drift = now - expectedTickTime;
    if (drift > 150) {
      const missedTicks = Math.floor(drift / 1000);
      state.timeLeft -= missedTicks + 1;
      state.totalSeconds += missedTicks + 1;
    } else {
      state.timeLeft--;
      state.totalSeconds++;
    }
    expectedTickTime += 1000;

    elements.totalTime.textContent = formatTime(state.totalSeconds, true);
    elements.timer.textContent = formatTime(state.timeLeft);

    const selectedLevel = elements.levelSelect.value;
    const config = levelConfigs[selectedLevel] || state.customConfig;
    const duration =
      config[
        state.currentPhase === 'out'
          ? 'out'
          : state.currentPhase === 'in'
            ? 'in'
            : 'hold'
      ];

    updateBreathVisualization(state.currentPhase, state.currentNostril, state.timeLeft, duration);
    playTickSound();

    if (state.timeLeft <= 0) {
      nextPhase();
    }
  }
  if (!state.isPaused && state.currentPhase !== 'ready') {
    scheduleNextTick();
  }
}

export function nextPhase() {
  const selectedLevel = elements.levelSelect.value;
  const config = levelConfigs[selectedLevel] || state.customConfig;

  if (state.currentPhase === 'out') {
    state.currentPhase = 'in';
    state.timeLeft = config.in;
    playPhaseTransitionSound('in');
  } else if (state.currentPhase === 'in') {
    if (config.hold > 0) {
      state.currentPhase = 'hold';
      state.timeLeft = config.hold;
      playPhaseTransitionSound('hold');
    } else {
      state.currentPhase = 'out';
      state.currentNostril = state.currentNostril === 'left' ? 'right' : 'left';
      state.timeLeft = config.out;
      playPhaseTransitionSound('out');
      if (state.currentNostril === 'left') {
        state.cycles++;
        elements.cyclesCompleted.textContent = state.cycles;
      }
    }
  } else if (state.currentPhase === 'hold') {
    state.currentPhase = 'out';
    state.currentNostril = state.currentNostril === 'left' ? 'right' : 'left';
    state.timeLeft = config.out;
    playPhaseTransitionSound('out');
    if (state.currentNostril === 'left') {
      state.cycles++;
      elements.cyclesCompleted.textContent = state.cycles;
    }
  }
  updateBreathVisualization(state.currentPhase, state.currentNostril, state.timeLeft, config[state.currentPhase]);
  updateBreathBarAccessibility(state.currentPhase, state.timeLeft, config[state.currentPhase]);
}

export function startPractice() {
  if (state.currentPhase === 'ready' || state.isPaused) {
    const selectedLevel = elements.levelSelect.value;
    let config = levelConfigs[selectedLevel];
    if (selectedLevel === 'custom') {
      config = state.customConfig;
    }
    if (state.currentPhase === 'ready') {
      state.currentPhase = 'out';
      state.timeLeft = config.out;
      state.currentNostril = 'left';
    }
    state.isPaused = false;
    timerStartTime = performance.now();
    expectedTickTime = timerStartTime + 1000;
    scheduleNextTick();
    elements.startBtn.disabled = true;
    elements.pauseBtn.disabled = false;
    elements.resetBtn.disabled = false;
    elements.leftNostril.classList.remove('paused');
    elements.rightNostril.classList.remove('paused');
    elements.breathFill.classList.remove('paused');
  }
}

export function pausePractice() {
  clearTimeout(timer);
  state.isPaused = true;
  elements.startBtn.disabled = false;
  elements.startBtn.textContent = 'Resume';
  elements.leftNostril.classList.add('paused');
  elements.rightNostril.classList.add('paused');
  elements.breathFill.classList.add('paused');
}

export function resetPractice() {
  clearTimeout(timer);
  state.currentPhase = 'ready';
  state.timeLeft = 0;
  state.totalSeconds = 0;
  state.cycles = 0;
  state.currentNostril = 'left';
  state.isPaused = false;
  elements.startBtn.disabled = false;
  elements.startBtn.textContent = 'Start';
  elements.pauseBtn.disabled = true;
  elements.resetBtn.disabled = true;
  elements.timer.textContent = '00:00';
  elements.totalTime.textContent = '00:00:00';
  elements.cyclesCompleted.textContent = '0';
  updateBreathVisualization('ready', state.currentNostril, 0, 0);
  updateBreathBarAccessibility('ready', 0, 0);
}
