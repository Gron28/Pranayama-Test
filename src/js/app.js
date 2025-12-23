import { elements, setDarkMode, toggleCustomPanel, closeModal, openModal, toggleFullscreen } from './ui.js';
import { setGlobalVolume, toggleSound, resumeAudioContext } from './audio.js';
import { startPractice, pausePractice, resetPractice, state as timerState } from './timer.js';

export function initCustomization() {
  function applyCustomizations() {
    const leftNostrilColor = document.getElementById('leftNostrilColor').value;
    const rightNostrilColor = document.getElementById('rightNostrilColor').value;
    const breathFillColor = document.getElementById('breathBarFillColor').value;
    const breathHoldColor = document.getElementById('breathBarHoldColor').value;

    document.documentElement.style.setProperty('--ida-blue', leftNostrilColor);
    document.documentElement.style.setProperty('--pingala-red', rightNostrilColor);
    document.documentElement.style.setProperty('--sushumna-yellow', breathFillColor);
    document.documentElement.style.setProperty('--sushumna-green', breathHoldColor);

    localStorage.setItem(
      'customColors',
      JSON.stringify({
        leftNostril: leftNostrilColor,
        rightNostril: rightNostrilColor,
        breathFill: breathFillColor,
        breathHold: breathHoldColor,
      })
    );

    document.getElementById('leftNostrilHex').value = leftNostrilColor;
    document.getElementById('rightNostrilHex').value = rightNostrilColor;
    document.getElementById('breathBarFillHex').value = breathFillColor;
    document.getElementById('breathBarHoldHex').value = breathHoldColor;
  }

  function resetCustomizationColors() {
    const defaultColors = {
      leftNostril: '#004dab',
      rightNostril: '#ff2a00',
      breathFill: '#fee74d',
      breathHold: '#00a550',
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

  // Color inputs
  ['leftNostrilColor', 'rightNostrilColor', 'breathBarFillColor', 'breathBarHoldColor'].forEach((id) => {
    document.getElementById(id).addEventListener('input', () => {
      const hexId = id.replace('Color', 'Hex');
      document.getElementById(hexId).value = document.getElementById(id).value;
      applyCustomizations();
    });
  });

  ['leftNostrilHex', 'rightNostrilHex', 'breathBarFillHex', 'breathBarHoldHex'].forEach((id) => {
    document.getElementById(id).addEventListener('input', () => {
      const colorId = id.replace('Hex', 'Color');
      document.getElementById(colorId).value = document.getElementById(id).value;
      applyCustomizations();
    });
  });

  document.getElementById('saveChanges').addEventListener('click', () => {
    applyCustomizations();
    toggleCustomPanel();
  });

  document.getElementById('resetChanges').addEventListener('click', () => {
    localStorage.removeItem('customColors');
    localStorage.removeItem('darkMode');
    resetCustomizationColors();
    applyCustomizations();
    setDarkMode(true);
  });

  function loadCustomizations() {
    const savedColors = JSON.parse(localStorage.getItem('customColors'));
    const isDarkMode = JSON.parse(localStorage.getItem('darkMode'));

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

    setDarkMode(isDarkMode !== false);
  }

  loadCustomizations();
}

export function initControls() {
  elements.startBtn.addEventListener('click', () => {
    startPractice();
    resumeAudioContext();
  });

  elements.pauseBtn.addEventListener('click', pausePractice);
  elements.resetBtn.addEventListener('click', resetPractice);

  elements.levelSelect.addEventListener('change', () => {
    if (elements.levelSelect.value === 'custom') {
      timerState.customConfig.in = timerState.customConfig.in || '';
      timerState.customConfig.out = timerState.customConfig.out || '';
      timerState.customConfig.hold = timerState.customConfig.hold || 0;
      elements.customIn.value = timerState.customConfig.in;
      elements.customOut.value = timerState.customConfig.out;
      elements.customHold.value = timerState.customConfig.hold;
      openModal();
    } else {
      resetPractice();
    }
  });

  // Sound controls
  elements.soundBtn.addEventListener('click', () => {
    const soundEnabled = toggleSound();
    const icon = elements.soundBtn.querySelector('i');
    icon.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
  });

  elements.volumeSlider.addEventListener('input', () => {
    setGlobalVolume(parseFloat(elements.volumeSlider.value));
  });

  elements.customizeBtn.addEventListener('click', toggleCustomPanel);
  elements.darkModeToggle.addEventListener('click', () => {
    const isDarkMode = document.body.classList.contains('dark-mode');
    setDarkMode(!isDarkMode);
  });
  elements.fullscreenBtn.addEventListener('click', toggleFullscreen);

  // Modal
  const modalCloseButton = document.querySelector('#customModal .close-button');
  const modalCancelButton = document.querySelector('#customModal .cancel');
  const modalSaveButton = document.querySelector('#customModal .save');
  const modalContent = document.querySelector('.modal-content');

  function handleModalClose() {
    closeModal();
  }

  function handleModalSave() {
    const inhale = parseInt(elements.customIn.value, 10);
    const exhale = parseInt(elements.customOut.value, 10);
    const hold = parseInt(elements.customHold.value, 10);

    const existingErrorMessage = modalContent.querySelector('.error-message');
    if (existingErrorMessage) {
      modalContent.removeChild(existingErrorMessage);
    }

    if (inhale > 0 && exhale > 0) {
      timerState.customConfig = { in: inhale, out: exhale, hold };
      const selectedOption = elements.levelSelect.options[elements.levelSelect.selectedIndex];
      selectedOption.textContent = `Custom (In: ${inhale}s, Out: ${exhale}s, Hold: ${hold}s)`;
      closeModal();
    } else {
      const errorMessage = document.createElement('p');
      errorMessage.textContent = 'Inhale and Exhale times must be greater than 0.';
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
  }

  modalCloseButton.addEventListener('click', handleModalClose);
  modalCancelButton.addEventListener('click', handleModalClose);
  modalSaveButton.addEventListener('click', handleModalSave);

  window.addEventListener('click', (event) => {
    if (event.target === elements.customModal) {
      handleModalClose();
    }
  });

  // Collapsible sections
  const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
  collapsibleHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const icon = header.querySelector('.toggle-icon');
      content.classList.toggle('collapsed');
      icon.classList.toggle('open');
    });
  });

  // Close panel when clicking outside
  document.addEventListener('click', (event) => {
    if (
      elements.customizationPanel.style.display === 'block' &&
      !event.target.closest('#customizationPanel') &&
      event.target !== elements.customizeBtn
    ) {
      toggleCustomPanel();
    }
  });
}

export function init() {
  elements.volumeSlider.value = 0.02;
  initCustomization();
  initControls();
}
