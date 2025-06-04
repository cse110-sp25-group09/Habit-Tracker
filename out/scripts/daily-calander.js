// Daily Calendar Module for Habit Tracker
// Handles the three-card carousel display and navigation

// Navigation event listeners
const home_select = document.getElementById('home-selection');
const calendar_select = document.getElementById('calendar-selection');
const settings_select = document.getElementById('settings-selection');

home_select.addEventListener('click', () => {
  window.location.href = 'home-page.html';
});
calendar_select.addEventListener('click', () => {
  window.location.href = 'monthly-calendar.html';
});
settings_select.addEventListener('click', () => {
  window.location.href = 'settings.html';
});

// Calendar state
let currentDate = new Date();
let isFlipped = false;
let cardsHidden = false;

const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// Initialize calendar
function initCalendar() {
  console.log('Initializing daily calendar...');

  // Debug: Check if required elements exist
  const requiredElements = ['prev-day', 'current-day', 'next-day'];
  for (let id of requiredElements) {
    const element = document.getElementById(id);
    if (!element) {
      console.error(`Required element not found: ${id}`);
      return;
    }
  }

  updateCalendarDisplay();
  updateHabitsForDays();
  setupEventListeners();

  console.log('Daily calendar initialized successfully');
}

// Update the visual display of the calendar
function updateCalendarDisplay() {
  const prevDate = new Date(currentDate);
  prevDate.setDate(currentDate.getDate() - 1);

  const nextDate = new Date(currentDate);
  nextDate.setDate(currentDate.getDate() + 1);

  // Update previous day
  const prevCard = document.getElementById('prev-day');
  prevCard.querySelector('.day-name').textContent = dayNames[prevDate.getDay()];
  prevCard.querySelector('.day-date').textContent =
    `${monthNames[prevDate.getMonth()]} ${prevDate.getDate()}`;

  // Update current day
  const currentCard = document.getElementById('current-day');
  currentCard.querySelector('.day-name').textContent =
    dayNames[currentDate.getDay()];
  currentCard.querySelector('.day-date').textContent =
    `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`;

  // Update next day
  const nextCard = document.getElementById('next-day');
  nextCard.querySelector('.day-name').textContent = dayNames[nextDate.getDay()];
  nextCard.querySelector('.day-date').textContent =
    `${monthNames[nextDate.getMonth()]} ${nextDate.getDate()}`;
}

// Get habits using the existing CRUD functions
function getStoredHabits() {
  // Try to use the existing getAllHabits function if available
  if (typeof getAllHabits === 'function') {
    return getAllHabits() || [];
  }

  // Fallback to direct localStorage access with the structure from your files
  const habitsData = localStorage.getItem('habits');
  if (habitsData) {
    return JSON.parse(habitsData);
  }

  // Try getting individual habit objects using the CRUD pattern
  const habits = [];
  const keys = Object.keys(localStorage);
  for (let key of keys) {
    if (key.startsWith('id')) {
      // Habit IDs start with 'id' based on your CRUD
      try {
        const habitData = localStorage.getItem(key);
        if (habitData) {
          const habit = JSON.parse(habitData);
          habit.id = key; // Add the ID to the habit object
          habits.push(habit);
        }
      } catch (e) {
        console.warn('Failed to parse habit:', key);
      }
    }
  }
  return habits;
}

// Check if a habit should be active on a given date based on your CRUD structure
function isHabitActiveOnDate(habit, date) {
  // Use startDateTime from your CRUD structure
  const habitStart = new Date(habit.startDateTime || Date.now());
  const daysDiff = Math.floor((date - habitStart) / (1000 * 60 * 60 * 24));

  // Use habitFrequency from your CRUD structure
  const frequencyDays = parseInt(habit.habitFrequency) || 1;

  return daysDiff >= 0 && daysDiff % frequencyDays === 0;
}

// Check if a habit was completed on a specific date using your log structure
function isHabitCompletedOnDate(habit, date) {
  const dateStr = date.toDateString();
  // Use the logs array from your CRUD structure
  return habit.logs && habit.logs.includes(dateStr);
}

// Update habit indicators for all three days
function updateHabitsForDays() {
  const habits = getStoredHabits();

  const prevDate = new Date(currentDate);
  prevDate.setDate(currentDate.getDate() - 1);

  const nextDate = new Date(currentDate);
  nextDate.setDate(currentDate.getDate() + 1);

  updateHabitIndicators('prev-habits', habits, prevDate);
  updateHabitIndicators('current-habits', habits, currentDate);
  updateHabitIndicators('next-habits', habits, nextDate);
}

// Update habit indicators for a specific day
function updateHabitIndicators(elementId, habits, date) {
  const container = document.getElementById(elementId);
  if (!container) {
    console.warn(`Container not found: ${elementId}`);
    return;
  }

  container.innerHTML = '';

  console.log(
    `Updating habits for ${elementId}:`,
    habits.length,
    'habits found',
  );

  const activeHabits = habits.filter((habit) =>
    isHabitActiveOnDate(habit, date),
  );
  console.log(`Active habits for ${date.toDateString()}:`, activeHabits.length);

  activeHabits.forEach((habit, index) => {
    const dot = document.createElement('div');
    dot.classList.add('habit-dot');

    if (isHabitCompletedOnDate(habit, date)) {
      dot.classList.add('completed');
      console.log(
        `Habit ${habit.habitName || habit.name || index} completed on ${date.toDateString()}`,
      );
    } else {
      dot.classList.add('pending');
      console.log(
        `Habit ${habit.habitName || habit.name || index} pending on ${date.toDateString()}`,
      );
    }

    // Add title for debugging
    dot.title = habit.habitName || habit.name || `Habit ${index + 1}`;

    container.appendChild(dot);
  });
}

// Navigate the calendar
function navigateCalendar(direction) {
  currentDate.setDate(currentDate.getDate() + direction);
  updateCalendarDisplay();
  updateHabitsForDays();
}

// Handle day card clicks
function handleDayClick(dayOffset) {
  const targetDate = new Date(currentDate);
  targetDate.setDate(currentDate.getDate() + dayOffset);
  currentDate = targetDate;
  updateCalendarDisplay();
  updateHabitsForDays();
}

// Handle current day click - show detailed view
function handleCurrentDayClick() {
  console.log('Current day clicked - showing detailed view');
  showDetailedView();
}

// Show detailed habit view for current day
function showDetailedView() {
  // Hide the calendar cards
  const calendarContainer = document.querySelector('.calendar-container');
  calendarContainer.style.display = 'none';
  cardsHidden = true;

  const habits = getStoredHabits();
  const activeHabits = habits.filter((habit) =>
    isHabitActiveOnDate(habit, currentDate),
  );

  if (activeHabits.length === 0) {
    console.log('No habits for today');
    return;
  }

  // Create a simple detailed view overlay
  const overlay = document.createElement('div');
  overlay.id = 'habit-detail-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    max-width: 400px;
    margin: 0 auto;
  `;

  const detailCard = document.createElement('div');
  detailCard.style.cssText = `
    background: white;
    border-radius: 15px;
    padding: 20px;
    max-width: 320px;
    width: 90%;
    max-height: 70vh;
    overflow-y: auto;
  `;

  let detailHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #667eea; margin-bottom: 5px;">
        ${dayNames[currentDate.getDay()]}
      </h2>
      <p style="color: #666; font-size: 14px;">
        ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}
      </p>
      <p style="color: #888; font-size: 12px; margin-top: 10px;">
        ${activeHabits.length} habit${activeHabits.length !== 1 ? 's' : ''}
      </p>
    </div>
    <div style="margin-bottom: 20px;">
  `;

  activeHabits.forEach((habit) => {
    const isCompleted = isHabitCompletedOnDate(habit, currentDate);
    detailHTML += `
      <div class="habit-detail-item" data-id="${habit.id}" style="
        display: flex;
        align-items: center;
        padding: 12px;
        margin-bottom: 8px;
        background: ${isCompleted ? '#e8f5e8' : '#f8f8f8'};
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      " onmouseover="this.style.background='${isCompleted ? '#d4f0d4' : '#eeeeee'}'" 
         onmouseout="this.style.background='${isCompleted ? '#e8f5e8' : '#f8f8f8'}'">
        <div style="
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${isCompleted ? '#4caf50' : '#ddd'};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-size: 12px;
        ">
          ${isCompleted ? '✓' : ''}
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 500; color: #333;">
            ${habit.habitName || habit.name || 'Unnamed Habit'}
          </div>
        </div>
      </div>
    `;
  });

  detailHTML += `
    </div>
    <button id="close-detail" style="
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
    ">Close</button>
  `;

  detailCard.innerHTML = detailHTML;
  overlay.appendChild(detailCard);
  document.body.appendChild(overlay);

  // Add event listeners
  document
    .getElementById('close-detail')
    .addEventListener('click', closeDetailedView);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDetailedView();
  });

  // Add habit toggle listeners
  document.querySelectorAll('.habit-detail-item').forEach((item) => {
    item.addEventListener('click', function () {
      const habitId = this.getAttribute('data-id');
      toggleHabitCompletion(habitId);
    });
  });
}

// Close detailed view
function closeDetailedView() {
  const overlay = document.getElementById('habit-detail-overlay');
  if (overlay) {
    overlay.remove();
  }

  // Show the calendar cards again
  const calendarContainer = document.querySelector('.calendar-container');
  calendarContainer.style.display = 'flex';
  cardsHidden = false;
}

// Toggle habit completion
function toggleHabitCompletion(habitId) {
  const habits = getStoredHabits();
  const habit = habits.find((h) => h.id === habitId);
  if (!habit) return;

  const dateStr = currentDate.toDateString();
  habit.logs = habit.logs || [];

  if (isHabitCompletedOnDate(habit, currentDate)) {
    // Remove completion
    habit.logs = habit.logs.filter((d) => d !== dateStr);
  } else {
    // Add completion
    habit.logs.push(dateStr);
  }

  // Save updated habit back to localStorage
  localStorage.setItem(habitId, JSON.stringify(habit));

  // Update UI
  updateHabitsForDays();

  // Refresh the detailed view
  closeDetailedView();
  setTimeout(() => showDetailedView(), 100);
}

// Handle touch/swipe gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(event) {
  touchStartX = event.changedTouches[0].screenX;
}

function handleTouchEnd(event) {
  touchEndX = event.changedTouches[0].screenX;
  handleSwipe();
}

function handleSwipe() {
  const swipeThreshold = 50;
  const swipeDistance = touchEndX - touchStartX;

  if (Math.abs(swipeDistance) > swipeThreshold) {
    if (swipeDistance > 0) {
      navigateCalendar(-1); // Swipe right - go to previous day
    } else {
      navigateCalendar(1); // Swipe left - go to next day
    }
  }
}

// Handle keyboard navigation
function handleKeyDown(event) {
  if (event.key === 'ArrowLeft') {
    navigateCalendar(-1);
  } else if (event.key === 'ArrowRight') {
    navigateCalendar(1);
  } else if (event.key === 'Escape') {
    closeDetailedView();
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Day card click handlers
  document
    .getElementById('prev-day')
    .addEventListener('click', () => handleDayClick(-1));

  // Current day click handler
  document
    .getElementById('current-day')
    .addEventListener('click', handleCurrentDayClick);

  document
    .getElementById('next-day')
    .addEventListener('click', () => handleDayClick(1));

  // Keyboard navigation
  document.addEventListener('keydown', handleKeyDown);

  // Touch/swipe gestures
  document.addEventListener('touchstart', handleTouchStart);
  document.addEventListener('touchend', handleTouchEnd);

  // Listen for storage changes to update habit indicators
  window.addEventListener('storage', updateHabitsForDays);
}

// Initialize the calendar when the page loads
document.addEventListener('DOMContentLoaded', initCalendar);

// Expose functions for external use
window.DailyCalendar = {
  navigateCalendar,
  updateHabitsForDays,
  getCurrentDate: () => new Date(currentDate),
  initCalendar,
};
