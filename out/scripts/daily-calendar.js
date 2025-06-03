// Wait for the DOM to load before referencing elements
document.addEventListener('DOMContentLoaded', function () {
  // Navigation bar functionality (same as home.js)
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
});

// Date management
let currentDate = new Date();
const currentDateElement = document.getElementById('current-date');
const currentDayElement = document.getElementById('current-day');
const cardContainer = document.getElementById('card-container');
const noHabitsMessage = document.getElementById('no-habits-message');

// Day navigation
const prevDayButton = document.getElementById('prev-day');
const nextDayButton = document.getElementById('next-day');

// Days of the week
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Function to format date
function formatDate(date) {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

// Function to get day name
function getDayName(date) {
  return daysOfWeek[date.getDay()];
}

// Function to convert frequency string to days
function getFrequencyInDays(frequency) {
  switch(frequency.toLowerCase()) {
    case 'daily': return 1;
    case 'weekly': return 7;
    case 'monthly': return 30; // approximation
    default: return 1;
  }
}

// Helper function to check if two dates are the same day
function isSameDay(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}

// Function to update date display
function updateDateDisplay() {
  const today = new Date();
  const isToday = currentDate.toDateString() === today.toDateString();
  
  if (isToday) {
    currentDateElement.textContent = 'Today';
  } else {
    const daysDiff = Math.floor((currentDate - today) / (1000 * 60 * 60 * 24));
    if (daysDiff === 1) {
      currentDateElement.textContent = 'Tomorrow';
    } else if (daysDiff === -1) {
      currentDateElement.textContent = 'Yesterday';
    } else {
      currentDateElement.textContent = formatDate(currentDate);
    }
  }
  
  currentDayElement.textContent = getDayName(currentDate);
  displayHabitsForDay(currentDate);
}

// Event listeners for navigation
prevDayButton.addEventListener('click', () => {
  currentDate.setDate(currentDate.getDate() - 1);
  updateDateDisplay();
});

nextDayButton.addEventListener('click', () => {
  currentDate.setDate(currentDate.getDate() + 1);
  updateDateDisplay();
});

// Initialize the page
updateDateDisplay();