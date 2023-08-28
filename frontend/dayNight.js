// night-day-mode.js
const body = document.body;
const modeToggle = document.getElementById('mode-toggle');
const STORAGE_KEY = 'nightDayMode';

function setModePreference(mode) {
  localStorage.setItem(STORAGE_KEY, mode);
}

function getModePreference() {
  return localStorage.getItem(STORAGE_KEY);
}

function setMode(mode) {
  if (mode === 'night') {
    body.classList.add('night');
    body.classList.remove('day');
  } else {
    body.classList.add('day');
    body.classList.remove('night');
  }
}

function toggleMode() {
  const currentMode = getModePreference();
  const newMode = currentMode === 'night' ? 'day' : 'night';
  setModePreference(newMode);
  setMode(newMode);
}

modeToggle.addEventListener('click', toggleMode);

// Set mode based on user's preference on page load
window.addEventListener('load', () => {
  const savedMode = getModePreference();
  if (savedMode) {
    setMode(savedMode);
  }
});
