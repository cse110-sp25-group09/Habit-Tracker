const themeSelect = document.getElementById('theme-select');
const body = document.body; // Add this line!
import { localStorageAdapter } from '../scripts/CRUD.js';
// On change, save the selection
themeSelect.addEventListener('change', (e) => {
  const selectedTheme = e.target.value;
  body.classList.remove('pink-theme', 'tritons-theme');
  if (selectedTheme !== 'default') {
    body.classList.add(`${selectedTheme}-theme`);
  }
  localStorage.setItem('selectedTheme', selectedTheme);
});

// On load, restore the theme
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme && savedTheme !== 'default') {
    body.classList.add(`${savedTheme}-theme`);
    themeSelect.value = savedTheme;
  }
});

//below is the code for the menu bar

// Wait for the DOM to load before referencing elements
document.addEventListener('DOMContentLoaded', function () {
  const home_select = document.getElementById('home-selection');
  const settings_select = document.getElementById('settings-selection');
  const calendarSelection = document.getElementById('calendar-selection');
  const calendarMenu = document.getElementById('calendar-menu');

  // Home button navigation
  home_select.addEventListener('click', () => {
    window.location.href = 'home-page.html';
  });

  // Calendar menu toggle
  calendarSelection.addEventListener('click', function (event) {
    event.stopPropagation();
    calendarMenu.classList.toggle('show');
  });

  // Close the menu if clicking outside
  document.addEventListener('click', function () {
    calendarMenu.classList.remove('show');
  });

  document
    .getElementById('daily-option')
    .addEventListener('click', function (event) {
      window.location.href = 'daily-calendar.html';
    });

  document
    .getElementById('monthly-option')
    .addEventListener('click', function (event) {
      window.location.href = 'monthly-calendar.html';
    });

  // Settings button navigation
  settings_select.addEventListener('click', () => {
    window.location.href = 'settings.html';
  });

  // Reset Cards logic
  const resetButton = document.getElementById('reset-cards');
  resetButton.addEventListener('click', () => {
    const confirmReset = window.confirm(
      'Are you sure you want to delete all your cards? This action cannot be undone.',
    );

    if (confirmReset) {
      // Loop through all keys and delete only the ones matching UUID pattern
      const keys = localStorageAdapter.keys();
      const uuidRegex =
        /^id[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      keys.forEach((key) => {
        if (uuidRegex.test(key)) {
          localStorageAdapter.del(key);
        }
      });

      alert('All cards have been reset.');
      // Optionally reload or redirect
      window.location.reload();
    }
  });
});
