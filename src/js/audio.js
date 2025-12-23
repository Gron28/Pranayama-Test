let globalVolume = 0.02;
let soundEnabled = false;
let isTickPlaying = false;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export function createSound(frequency, duration) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  gainNode.gain.setValueAtTime(globalVolume, audioCtx.currentTime);

  const stopTime = audioCtx.currentTime + duration;
  gainNode.gain.linearRampToValueAtTime(0, stopTime);

  oscillator.start();
  oscillator.stop(stopTime);
}

export function playTickSound() {
  if (soundEnabled && !isTickPlaying) {
    isTickPlaying = true;
    createSound(185, 0.15);
    setTimeout(() => {
      isTickPlaying = false;
    }, 150);
  }
}

export function playPhaseTransitionSound(phase) {
  if (soundEnabled) {
    let frequency = 220;
    if (phase === 'in') frequency = 200;
    else if (phase === 'out') frequency = 200;
    else if (phase === 'hold') frequency = 280;

    const delay = isTickPlaying ? 150 : 0;
    setTimeout(() => {
      createSound(frequency, 0.75);
    }, delay);
  }
}

export function getGlobalVolume() {
  return globalVolume;
}

export function setGlobalVolume(volume) {
  globalVolume = volume;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function toggleSound() {
  soundEnabled = !soundEnabled;
  return soundEnabled;
}

export function resumeAudioContext() {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}
