const levelConfigs = {
    1: { out: 20, in: 10, hold: 0 },
    2: { out: 30, in: 15, hold: 0 },
    3: { out: 15, in: 15, hold: 15 },
    4: { out: 40, in: 20, hold: 0 },
    5: { out: 20, in: 10, hold: 30 }
};

let timerStartTime = 0;
let expectedTickTime = 0;
let currentPhase = 'ready';
let timeLeft = 0;
let totalSeconds = 0;
let cycles = 0;
let currentNostril = 'left';
let isPaused = false;
let globalVolume = 0.02;
let isFullscreen = false;
let isDarkMode = true;
let customConfig = {};
let timer;

const elements = {
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

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let isTickPlaying = false;
let soundEnabled = false;

function createSound(frequency, duration) {
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

function playTickSound() {
    if (soundEnabled && !isTickPlaying) {
        isTickPlaying = true;
        createSound(185, 0.15);
        setTimeout(() => {
            isTickPlaying = false;
        }, 150);
    }
}

function playPhaseTransitionSound(phase) {
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

function pauseAnimation(element) {
    element.classList.add("paused");
}

function resumeAnimation(element) {
    element.classList.remove("paused");
}

function updateBreathVisualization(phase, nostril, timeLeft, duration) {
    const activeNostril = (nostril === 'left') ? elements.leftNostril : elements.rightNostril;
    const inactiveNostril = (nostril === 'left') ? elements.rightNostril : elements.leftNostril;

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
        phase === 'ready' ? 'Select a level, breathe in and press Start to begin' :
        phase === 'out' ? `Breathe out through ${nostril} nostril` :
        phase === 'in' ? `Breathe in through ${nostril} nostril` :
        'Hold breath';

    elements.breathFill.setAttribute("aria-label", `Breath indicator - ${phase}: ${timeLeft} seconds remaining`);
}

function updateBreathBarAccessibility(phase, timeLeft, duration) {
    const percentage = (duration - timeLeft) / duration * 100;
    elements.breathFill.setAttribute("aria-valuenow", percentage.toFixed(0));
    elements.breathFill.setAttribute("aria-valuemin", 0);
    elements.breathFill.setAttribute("aria-valuemax", 100);
    elements.breathBar.setAttribute("role", "progressbar");
}

function scheduleNextTick() {
    const now = performance.now();
    const delay = Math.max(0, expectedTickTime - now);
    timer = setTimeout(updateTimer, delay);
}

function updateTimer() {
    if (!isPaused && currentPhase !== 'ready') {
        const now = performance.now();
        const drift = now - expectedTickTime;
        if (drift > 150) {
            const missedTicks = Math.floor(drift / 1000);
            timeLeft -= (missedTicks + 1);
            totalSeconds += (missedTicks + 1);
        } else {
            timeLeft--;
            totalSeconds++;
        }
        expectedTickTime += 1000;

        elements.totalTime.textContent = formatTime(totalSeconds, true);
        elements.timer.textContent = formatTime(timeLeft);

        const selectedLevel = elements.levelSelect.value;
        const config = levelConfigs[selectedLevel] || customConfig;
        const duration = config[currentPhase === 'out' ? 'out' : currentPhase === 'in' ? 'in' : 'hold'];

        updateBreathVisualization(currentPhase, currentNostril, timeLeft, duration);
        playTickSound();

        if (timeLeft <= 0) {
            nextPhase();
        }
    }
    if (!isPaused && currentPhase !== 'ready') {
        scheduleNextTick();
    }
}

function nextPhase() {
    const selectedLevel = elements.levelSelect.value;
    const config = levelConfigs[selectedLevel] || customConfig;

    if (currentPhase === 'out') {
        currentPhase = 'in';
        timeLeft = config.in;
        playPhaseTransitionSound('in');
    } else if (currentPhase === 'in') {
        if (config.hold > 0) {
            currentPhase = 'hold';
            timeLeft = config.hold;
            playPhaseTransitionSound('hold');
        } else {
            currentPhase = 'out';
            currentNostril = currentNostril === 'left' ? 'right' : 'left';
            timeLeft = config.out;
            playPhaseTransitionSound('out');
            if (currentNostril === 'left') {
                cycles++;
                elements.cyclesCompleted.textContent = cycles;
            }
        }
    } else if (currentPhase === 'hold') {
        currentPhase = 'out';
        currentNostril = currentNostril === 'left' ? 'right' : 'left';
        timeLeft = config.out;
        playPhaseTransitionSound('out');
        if (currentNostril === 'left') {
            cycles++;
            elements.cyclesCompleted.textContent = cycles;
        }
    }
    updateBreathVisualization(currentPhase, currentNostril, timeLeft, config[currentPhase]);
    updateBreathBarAccessibility(currentPhase, timeLeft, config[currentPhase]);
}

function formatTime(seconds, includeHours = false) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const mStr = m.toString().padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');
    return includeHours ? `${h.toString().padStart(2, '0')}:${mStr}:${sStr}` : `${mStr}:${sStr}`;
}

elements.startBtn.addEventListener('click', () => {
    if (currentPhase === 'ready' || isPaused) {
        const selectedLevel = elements.levelSelect.value;
        let config = levelConfigs[selectedLevel];
        if (selectedLevel === 'custom') {
            config = customConfig;
        }
        if (currentPhase === 'ready') {
            currentPhase = 'out';
            timeLeft = config.out;
            currentNostril = 'left';
        }
        isPaused = false;
        timerStartTime = performance.now();
        expectedTickTime = timerStartTime + 1000;
        scheduleNextTick();
        elements.startBtn.disabled = true;
        elements.pauseBtn.disabled = false;
        elements.resetBtn.disabled = false;
        resumeAnimation(elements.leftNostril);
        resumeAnimation(elements.rightNostril);
        resumeAnimation(elements.breathFill);
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }
});

elements.pauseBtn.addEventListener('click', () => {
    clearTimeout(timer);
    isPaused = true;
    elements.startBtn.disabled = false;
    elements.startBtn.textContent = 'Resume';
    pauseAnimation(elements.leftNostril);
    pauseAnimation(elements.rightNostril);
    pauseAnimation(elements.breathFill);
});

elements.resetBtn.addEventListener('click', () => {
    clearTimeout(timer);
    resetPractice();
});

function resetPractice() {
    currentPhase = 'ready';
    timeLeft = 0;
    totalSeconds = 0;
    cycles = 0;
    currentNostril = 'left';
    isPaused = false;
    elements.startBtn.disabled = false;
    elements.startBtn.textContent = 'Start';
    elements.pauseBtn.disabled = true;
    elements.resetBtn.disabled = true;
    elements.timer.textContent = '00:00';
    elements.totalTime.textContent = '00:00:00';
    elements.cyclesCompleted.textContent = '0';
    updateBreathVisualization('ready', currentNostril, 0, 0);
    updateBreathBarAccessibility('ready', 0, 0);
}

elements.levelSelect.addEventListener('change', () => {
    if (elements.levelSelect.value === 'custom') {
        elements.customIn.value = customConfig.in || '';
        elements.customOut.value = customConfig.out || '';
        elements.customHold.value = customConfig.hold || 0;
        elements.customModal.style.display = "block";
    } else {
        resetPractice();
    }
});

const modalCloseButton = document.querySelector("#customModal .close-button");
const modalCancelButton = document.querySelector('#customModal .cancel');
const modalSaveButton = document.querySelector('#customModal .save');
const modalContent = document.querySelector('.modal-content');

modalCloseButton.addEventListener('click', closeModal);
modalCancelButton.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
    if (event.target === elements.customModal) {
        closeModal();
    }
});

function closeModal() {
    elements.customModal.style.display = "none";
    if (elements.levelSelect.value === 'custom') {
        elements.levelSelect.value = '1';
    }
}

modalSaveButton.addEventListener('click', function() {
    const inhale = parseInt(elements.customIn.value, 10);
    const exhale = parseInt(elements.customOut.value, 10);
    const hold = parseInt(elements.customHold.value, 10);

    const existingErrorMessage = modalContent.querySelector('.error-message');
    if (existingErrorMessage) {
        modalContent.removeChild(existingErrorMessage);
    }

    if (inhale > 0 && exhale > 0) {
        customConfig = { in: inhale, out: exhale, hold: hold };
        const selectedOption = elements.levelSelect.options[elements.levelSelect.selectedIndex];
        selectedOption.textContent = `Custom (In: ${inhale}s, Out: ${exhale}s, Hold: ${hold}s)`;
        elements.customModal.style.display = "none";
    } else {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = "Inhale and Exhale times must be greater than 0.";
        errorMessage.style.color = 'red';
        errorMessage.classList.add('error-message');
        modalContent.insertBefore(errorMessage, modalSaveButton);

        elements.customIn.addEventListener('input', () => {
            if (modalContent.contains(errorMessage)) errorMessage.remove();
        });
        elements.customOut.addEventListener('input', () => {
            if (modalContent.contains(errorMessage)) errorMessage.remove();
        });
    }
});

elements.soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    const icon = elements.soundBtn.querySelector('i');
    icon.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
});

elements.volumeSlider.addEventListener('input', () => {
    globalVolume = parseFloat(elements.volumeSlider.value);
});

const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
collapsibleHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const icon = header.querySelector('.toggle-icon');
        content.classList.toggle('collapsed');
        icon.classList.toggle('open');
    });
});

elements.customizeBtn.addEventListener('click', () => {
    elements.customizationPanel.style.display = (elements.customizationPanel.style.display === 'block' ? 'none' : 'block');
});

function applyCustomizations() {
    const leftNostrilColor = document.getElementById('leftNostrilColor').value;
    const rightNostrilColor = document.getElementById('rightNostrilColor').value;
    const breathFillColor = document.getElementById('breathBarFillColor').value;
    const breathHoldColor = document.getElementById('breathBarHoldColor').value;

    document.documentElement.style.setProperty('--ida-blue', leftNostrilColor);
    document.documentElement.style.setProperty('--pingala-red', rightNostrilColor);
    document.documentElement.style.setProperty('--sushumna-yellow', breathFillColor);
    document.documentElement.style.setProperty('--sushumna-green', breathHoldColor);

    localStorage.setItem('customColors', JSON.stringify({
        leftNostril: leftNostrilColor,
        rightNostril: rightNostrilColor,
        breathFill: breathFillColor,
        breathHold: breathHoldColor
    }));

    document.getElementById('leftNostrilHex').value = leftNostrilColor;
    document.getElementById('rightNostrilHex').value = rightNostrilColor;
    document.getElementById('breathBarFillHex').value = breathFillColor;
    document.getElementById('breathBarHoldHex').value = breathHoldColor;
}

function loadCustomizations() {
    const savedColors = JSON.parse(localStorage.getItem('customColors'));
    isDarkMode = JSON.parse(localStorage.getItem('darkMode'));

    if (savedColors) {
        document.getElementById('leftNostrilColor').value = savedColors.leftNostril;
        document.getElementById('rightNostrilColor').value = savedColors.rightNostril;
        document.getElementById('breathBarFillColor').value = savedColors.breathFill;
        document.getElementById('breathBarHoldColor').value = savedColors.breathHold;
        document.documentElement.style.setProperty('--ida-blue', savedColors.leftNostril);
        document.documentElement.style.setProperty('--pingala-red', savedColors.rightNostril);
        document.documentElement.style.setProperty('--sushumna-yellow', savedColors.breathFill);
        document.documentElement.style.setProperty('--sushumna-green', savedColors.breathHold);
        document.getElementById('leftNostrilHex').value = savedColors.leftNostril;
        document.getElementById('rightNostrilHex').value = savedColors.rightNostril;
        document.getElementById('breathBarFillHex').value = savedColors.breathFill;
        document.getElementById('breathBarHoldHex').value = savedColors.breathHold;
    }

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        elements.darkModeToggle.textContent = 'Light Mode';
    } else {
        document.body.classList.remove('dark-mode');
        elements.darkModeToggle.textContent = 'Dark Mode';
    }
}

document.getElementById('leftNostrilColor').addEventListener('input', () => {
    document.getElementById('leftNostrilHex').value = document.getElementById('leftNostrilColor').value;
    applyCustomizations();
});
document.getElementById('rightNostrilColor').addEventListener('input', () => {
    document.getElementById('rightNostrilHex').value = document.getElementById('rightNostrilColor').value;
    applyCustomizations();
});
document.getElementById('breathBarFillColor').addEventListener('input', () => {
    document.getElementById('breathBarFillHex').value = document.getElementById('breathBarFillColor').value;
    applyCustomizations();
});
document.getElementById('breathBarHoldColor').addEventListener('input', () => {
    document.getElementById('breathBarHoldHex').value = document.getElementById('breathBarHoldColor').value;
    applyCustomizations();
});

document.getElementById('leftNostrilHex').addEventListener('input', () => {
    document.getElementById('leftNostrilColor').value = document.getElementById('leftNostrilHex').value;
    applyCustomizations();
});
document.getElementById('rightNostrilHex').addEventListener('input', () => {
    document.getElementById('rightNostrilColor').value = document.getElementById('rightNostrilHex').value;
    applyCustomizations();
});
document.getElementById('breathBarFillHex').addEventListener('input', () => {
    document.getElementById('breathBarFillColor').value = document.getElementById('breathBarFillHex').value;
    applyCustomizations();
});
document.getElementById('breathBarHoldHex').addEventListener('input', () => {
    document.getElementById('breathBarHoldColor').value = document.getElementById('breathBarHoldHex').value;
    applyCustomizations();
});

document.getElementById('saveChanges').addEventListener('click', () => {
    applyCustomizations();
    elements.customizationPanel.style.display = 'none';
});

document.getElementById('resetChanges').addEventListener('click', () => {
    localStorage.removeItem('customColors');
    localStorage.removeItem('darkMode');
    resetCustomizationColors();
    applyCustomizations();
    setDarkMode(true);
});

function resetCustomizationColors() {
    const defaultColors = {
        leftNostril: "#004dab",
        rightNostril: "#ff2a00",
        breathFill: "#fee74d",
        breathHold: "#00a550"
    };
    document.getElementById('leftNostrilColor').value = defaultColors.leftNostril;
    document.getElementById('rightNostrilColor').value = defaultColors.rightNostril;
    document.getElementById('breathBarFillColor').value = defaultColors.breathFill;
    document.getElementById('breathBarHoldColor').value = defaultColors.breathHold;
    document.getElementById('leftNostrilHex').value = defaultColors.leftNostril;
    document.getElementById('rightNostrilHex').value = defaultColors.rightNostril;
    document.getElementById('breathBarFillHex').value = defaultColors.breathFill;
    document.getElementById('breathBarHoldHex').value = defaultColors.breathHold;
    applyCustomizations();
}

elements.darkModeToggle.addEventListener('click', () => {
    setDarkMode(!isDarkMode);
});

function setDarkMode(darkMode) {
    isDarkMode = darkMode;
    document.body.classList.toggle('light-mode', !darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
    elements.darkModeToggle.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
    localStorage.setItem('darkMode', darkMode);
}

elements.fullscreenBtn.addEventListener('click', toggleFullscreen);

function toggleFullscreen() {
    document.body.classList.toggle('fullscreen-mode');
    isFullscreen = !isFullscreen;
    elements.fullscreenBtn.textContent = isFullscreen ? 'Go Back' : 'Expand View';
}

document.addEventListener('click', (event) => {
    if (elements.customizationPanel.style.display === 'block' && !event.target.closest('#customizationPanel') && event.target !== elements.customizeBtn) {
        elements.customizationPanel.style.display = 'none';
    }
});

window.addEventListener('DOMContentLoaded', () => {
    elements.volumeSlider.value = globalVolume;
    setDarkMode(true);
    loadCustomizations();
});
