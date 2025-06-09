/**
 * Daily Calendar Module for Habit Tracker
 * Handles the three-card carousel display and navigation
 *
 * @fileoverview This module manages the daily calendar view with a three-card carousel
 * showing previous, current, and next day. It handles habit display, completion tracking,
 * and provides both touch and keyboard navigation.
 *
 * @author Taha Masood and Brendan Keane
 * @version 1.0.0
 */

// Import CRUD functions
import {
  isHabitComplete,
  logHabitCompleted,
  removeHabitCompletion,
  getHabitsForDay,
} from './CRUD.js';

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
});

// Import and define the HabitCard custom element
class HabitCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
    <style>
      *{
        font-family: 'Commissioner', sans-serif;
        box-sizing: border-box;
      } 
      .flip-card {
        background-color: transparent;
        perspective: 1000px;
        width: 250px;
        height: 150px;
        margin: 1rem;
        position: relative;
        cursor: pointer;
      }
 
      .flip-card-inner {
        width: 100%;
        height: 100%;
        transition: transform 0.6s;
        transform-style: preserve-3d;
        position: relative;
      }
 
      .flip-card-inner.flipped {
        transform: rotateY(180deg);
      }

      .flip-card-front,
      .flip-card-back {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 1rem;
        padding: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        font-family: sans-serif;
        box-sizing: border-box;
        backface-visibility: hidden;
        overflow: hidden;
      }
 
      .flip-card-front {
        background: var(--card-color);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
        color: var(--text-color-front-of-card);
      }

      .flip-card-front.completed {
       background: var(--streak-card-color);
      }
     .flip-card-front.not-completed {
       background: var(--card-color);
       box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
       color: var(--text-color-front-of-card);
      }
 
      .flip-card-back {
        background-color: var(--back-card-color);
        color: var(--text-color-back-of-card);
        transform: rotateY(180deg);
      }

      #card_name {
        font-size: 1.5em;
        text-align: center;
      }

      #card_frequency {
        font-family: sans-serif;
      }
      
      .flip-card-back p {
        margin: 0.5em 0;
        font-size: 0.75em;
        line-height: 1.2;
        max-width: 90%;
        word-wrap: break-word;
        word-break: break-word;
      }
      
      .streak_number{
        color: var(--streak-color);
        font-weight:bold;
      }

      .delete-container {
        margin-top: 0.1em;
        text-align: center;
      }

      .delete-btn {
        background: transparent;
        color: white;
        border: none;
        font-size: 0.9em;
        cursor: pointer;
      }

      .confirm-dialog {
        margin-top: 0.5em;
        display: flex;
        margin-bottom: 0.5em;
        font-size: 0.9em;
      }

      .confirm-dialog button {
        margin: 0 0.25em;
        padding: 0.25em 0.5em;
        font-size: 0.8em;
        cursor: pointer;
        border-radius: 4px;
        border: none;
      }

      .confirm-yes {
        background-color: red;
        color: white;
        font-size: 0.9em;
      }

      .confirm-no {
        background-color: gray;
        color: white;
        font-size: 0.9em;
      }

      .habit-checkbox {
        accent-color: var(--checkbox-color);
      }
    </style>

    <div class="flip-card">
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <h1 id="card_name">${this.getAttribute('card-name') || 'Untitled Habit'}</h1>
          <label style="margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            Complete:
            <input type="checkbox" class="habit-checkbox" />
          </label>
        </div>
        <div class="flip-card-back">
          <p id="card_description">${this.getAttribute('card-description') || 'None'}</p>
          <p id="card_frequency">${this.getAttribute('card-frequency') || 'None'}</p>
          <p id="card_streak">${this.getAttribute('card-streak') || 'None'}</p>
          <p id="card_id" hidden>${this.getAttribute('card-id') || 'None'}</p>
          <div class="delete-container">
            <button class="delete-btn">🗑️</button>
            <div class="confirm-dialog" hidden>
              <p hidden class="delete-dialog">Delete? </p>
              <button class="confirm-yes" hidden>Yes</button>
              <button class="confirm-no" hidden>No</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    const flipCard = this.shadowRoot.querySelector('.flip-card');
    const flipInner = this.shadowRoot.querySelector('.flip-card-inner');
    const deleteBtn = this.shadowRoot.querySelector('.delete-btn');
    const confirmDialog = this.shadowRoot.querySelector('.confirm-dialog');
    const deleteDialog = this.shadowRoot.querySelector('.delete-dialog');
    const yesBtn = this.shadowRoot.querySelector('.confirm-yes');
    const noBtn = this.shadowRoot.querySelector('.confirm-no');
    const checkbox = this.shadowRoot.querySelector('.habit-checkbox');

    // Delete functionality
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDialog.hidden = false;
      yesBtn.hidden = false;
      noBtn.hidden = false;
      deleteDialog.hidden = false;
      deleteBtn.hidden = true;
    });

    noBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteBtn.hidden = false;
      confirmDialog.hidden = true;
      yesBtn.hidden = true;
      noBtn.hidden = true;
      deleteDialog.hidden = true;
    });

    yesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idElement = this.shadowRoot.querySelector('#card_id');
      if (idElement) {
        const cardId = idElement.textContent.trim();
        // Import deleteHabit function
        import('./CRUD.js').then(({ deleteHabit }) => {
          deleteHabit(cardId);
          this.remove();
          // Refresh the calendar view if we're in detailed view
          if (window.DailyCalendar) {
            window.DailyCalendar.updateHabitsForDays();
          }
        });
      }
    });

    // Card flip functionality
    flipCard.addEventListener('click', () => {
      flipInner.classList.toggle('flipped');
    });

    // Checkbox functionality
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      const isChecked = checkbox.checked;
      const idElement = this.shadowRoot.querySelector('#card_id');
      const cardFront = this.shadowRoot.querySelector('.flip-card-front');

      if (idElement && cardFront) {
        const cardId = idElement.textContent.trim();

        if (isChecked) {
          logHabitCompleted(cardId);
          cardFront.classList.remove('not-completed');
          cardFront.classList.add('completed');
        } else {
          removeHabitCompletion(cardId);
          cardFront.classList.remove('completed');
          cardFront.classList.add('not-completed');
        }

        // Update the calendar indicators
        if (window.DailyCalendar) {
          window.DailyCalendar.updateHabitsForDays();
        }
      }
    });
  }

  static get observedAttributes() {
    return [
      'card-name',
      'card-completed',
      'card-frequency',
      'card-description',
      'card-streak',
      'card-id',
    ];
  }

  connectedCallback() {
    this.updateCardContent();
  }

  attributeChangedCallback() {
    this.updateCardContent();
  }

  updateCardContent() {
    const titleEl = this.shadowRoot.getElementById('card_name');
    const freqEl = this.shadowRoot.getElementById('card_frequency');
    const descrEl = this.shadowRoot.getElementById('card_description');
    const streakEl = this.shadowRoot.getElementById('card_streak');
    const idEl = this.shadowRoot.getElementById('card_id');
    const checkbox = this.shadowRoot.querySelector('.habit-checkbox');
    const cardFront = this.shadowRoot.querySelector('.flip-card-front');

    if (titleEl) {
      titleEl.textContent = this.getAttribute('card-name') || 'Untitled Habit';
    }

    if (freqEl) {
      freqEl.textContent = `Frequency: ${this.getAttribute('card-frequency') || 'None'}`;
    }

    if (descrEl) {
      descrEl.textContent = `Description: ${this.getAttribute('card-description') || 'None'}`;
    }

    if (streakEl) {
      streakEl.innerHTML = `Current Streak: <span class="streak_number"> ${this.getAttribute('card-streak') || '0'} </span>`;
    }

    if (idEl) {
      idEl.textContent = this.getAttribute('card-id') || 'None';
    }

    if (checkbox && cardFront) {
      const isCompleted = this.getAttribute('card-completed') === 'true';
      checkbox.checked = isCompleted;

      cardFront.classList.remove('completed', 'not-completed');
      if (isCompleted) {
        cardFront.classList.add('completed');
      } else {
        cardFront.classList.add('not-completed');
      }
    }
  }
}

// Define the custom element
customElements.define('habit-card', HabitCard);

// Applies theme to the page
window.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme && savedTheme !== 'default') {
    body.classList.add(`${savedTheme}-theme`);
  }
});

/** @type {Date} Current date being displayed in the calendar */
window.currentDate = window.currentDate || new Date();

/** @type {boolean} Flag indicating if the detailed view cards are currently hidden */
let cardsHidden = false;

/** @type {string[]} Array of day names for display */
const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** @type {string[]} Array of abbreviated month names for display */
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

/**
 * Initialize the calendar by checking for required DOM elements and setting up the display
 * Uses setTimeout to retry if required elements are not yet available
 */
function initCalendar() {
  const requiredIds = ['prev-day', 'current-day', 'next-day'];
  const missing = requiredIds.filter((id) => !document.getElementById(id));
  if (missing.length > 0) {
    setTimeout(initCalendar, 100);
    return;
  }

  updateCalendarDisplay();
  updateHabitsForDays();
  setupEventListeners();
}

/**
 * Populates a calendar card element with the correct day name and date
 * If the card element or its children cannot be found, the function safely returns
 *
 * @param {string} cardId - The ID of the DOM element representing the calendar car
 * @param {Date} dateObj - A valid JavaScript Date object representing the date to display
 */
function fillCard(cardId, dateObj) {
  const card = document.getElementById(cardId);
  if (!card) return;
  const dayNameEl = card.querySelector('.day-name');
  const dayDateEl = card.querySelector('.day-date');

  if (dayNameEl) {
    dayNameEl.textContent = dayNames[dateObj.getDay()];
  }
  if (dayDateEl) {
    dayDateEl.textContent = `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}`;
  }
}

/**
 * Update the visual display of the three calendar cards (previous, current, next day)
 * Populates each card with the appropriate day name and date
 */
function updateCalendarDisplay() {
  const prevDate = new Date(currentDate);
  prevDate.setDate(currentDate.getDate() - 1);

  const nextDate = new Date(currentDate);
  nextDate.setDate(currentDate.getDate() + 1);

  fillCard('prev-day', prevDate);
  fillCard('current-day', currentDate);
  fillCard('next-day', nextDate);
}

/**
 * Check if a habit was active (created) on or before a specific date
 * @param {Object} habit - The habit object
 * @param {Date} checkDate - The date to check against
 * @returns {boolean} True if habit was active on the given date
 */
function isHabitActiveOnDate(habit, checkDate) {
  if (!habit.startDateTime) {
    // If no start date, assume it's always been active (backward compatibility)
    return true;
  }

  // Parse the habit's start date
  let habitStartDate;
  try {
    habitStartDate = new Date(habit.startDateTime);
    // If parsing fails, try alternative parsing
    if (isNaN(habitStartDate.getTime())) {
      habitStartDate = new Date(Date.parse(habit.startDateTime));
    }
    // If still invalid, assume it's always been active
    if (isNaN(habitStartDate.getTime())) {
      return true;
    }
  } catch (error) {
    // If any error in parsing, assume it's always been active
    return true;
  }

  // Check if the habit was created on or before the check date
  // We only compare dates, not times
  const habitStartDay = new Date(
    habitStartDate.getFullYear(),
    habitStartDate.getMonth(),
    habitStartDate.getDate(),
  );
  const checkDay = new Date(
    checkDate.getFullYear(),
    checkDate.getMonth(),
    checkDate.getDate(),
  );

  return habitStartDay <= checkDay;
}

/**
 * Fetch all habits from storage using CRUD.js getHabitsForDay function
 * for a specific date - now filters out habits that weren't created yet
 *
 * @param {Date} date - The date to check activity for
 * @returns {Object[]} Array of habit objects with normalized structure that were active on the given date
 */
function getHabitsForSpecificDate(date) {
  // Get all habits that would be scheduled for this day
  const allHabits = getHabitsForDay(date) || [];

  // Filter out habits that weren't created yet on this date
  const activeHabits = allHabits.filter(([habitId, habit]) => {
    return isHabitActiveOnDate(habit, date);
  });

  return activeHabits;
}

/**
 * Update habit indicators for all three calendar cards (previous, current, next day)
 */
function updateHabitsForDays() {
  const prevDate = new Date(currentDate);
  prevDate.setDate(currentDate.getDate() - 1);
  const nextDate = new Date(currentDate);
  nextDate.setDate(currentDate.getDate() + 1);

  updateHabitIndicators('prev-habits', prevDate);
  updateHabitIndicators('current-habits', currentDate);
  updateHabitIndicators('next-habits', nextDate);
}

/**
 * Update habit indicators for a specific day container
 * Creates colored dots representing each active habit's completion status
 *
 * @param {string} containerId - The ID of the container element to update
 * @param {Date} date - The date to display habits for
 */
function updateHabitIndicators(containerId, date) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const habits = getHabitsForSpecificDate(date);

  habits.forEach(([habitId, habit]) => {
    const dot = document.createElement('div');
    dot.classList.add('habit-dot');

    // Check if habit is completed on this date
    const isCompleted = isHabitComplete(habitId, date);
    dot.classList.add(isCompleted ? 'completed' : 'pending');
    dot.title = habit.habitName || 'Unnamed Habit';
    container.appendChild(dot);
  });
}

/**
 * Navigate the calendar by a specified number of days
 * Updates the current date and refreshes the display
 *
 * @param {number} direction - Number of days to navigate (positive for forward, negative for backward)
 */
function navigateCalendar(direction) {
  const newDate = new Date(currentDate);
  newDate.setDate(newDate.getDate() + direction);
  currentDate = newDate;
  updateCalendarDisplay();
  updateHabitsForDays();
}

/**
 * Handle clicks on day cards for navigation
 *
 * @param {number} offset - The offset from current day (-1 for previous, 1 for next)
 */
function handleDayClick(offset) {
  navigateCalendar(offset);
}

/**
 * Get the hour from a habit's start date time
 * @param {Object} habit - The habit object
 * @returns {number} - The hour (0-23)
 */
function getHabitHour(habit) {
  if (!habit.startDateTime) return 12; // default to noon if no start time

  const startDate = new Date(habit.startDateTime);
  if (isNaN(startDate.getTime())) {
    // If parsing fails, try to parse as a locale string
    const parsedDate = new Date(Date.parse(habit.startDateTime));
    if (isNaN(parsedDate.getTime())) {
      return 12; // default to noon if parsing fails
    }
    return parsedDate.getHours();
  }
  return startDate.getHours();
}

/**
 * Show the detailed view overlay for the current day
 * Creates and displays a modal with all active habits and their completion status
 */
function showDetailedView() {
  const calend = document.querySelector('.calendar-container');
  if (calend) calend.style.display = 'none';
  cardsHidden = true;

  const habits = getHabitsForSpecificDate(currentDate);

  const overlay = document.createElement('div');
  overlay.id = 'habit-detail-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    z-index: 1000;
    overflow-y: auto;
  `;

  const contentContainer = document.createElement('div');
  contentContainer.style.cssText = `
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    flex-direction: column;
    text-align: center;
    padding: 20px 0;
    background: var(--primary-color);
    color: var(--text-color);
    position: sticky;
    top: 0;
    z-index: 1001;
  `;

  const dayNameEl = document.createElement('div');
  dayNameEl.textContent = dayNames[currentDate.getDay()];
  dayNameEl.style.fontSize = '1.5rem';

  const dateEl = document.createElement('div');
  dateEl.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`;

  const countEl = document.createElement('div');
  countEl.textContent = `${habits.length} habit${habits.length === 1 ? '' : 's'}`;

  header.appendChild(dayNameEl);
  header.appendChild(dateEl);
  header.appendChild(countEl);
  contentContainer.appendChild(header);

  // Habit cards container - organized by hour
  const scheduleContainer = document.createElement('div');
  scheduleContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    box-sizing: border-box;
    width: 100%;
  `;

  // Group habits by hour
  const habitsByHour = {};
  habits.forEach(([habitId, habit]) => {
    const hour = getHabitHour(habit);
    if (!habitsByHour[hour]) {
      habitsByHour[hour] = [];
    }
    habitsByHour[hour].push([habitId, habit]);
  });

  // Sort hours and display habits
  const sortedHours = Object.keys(habitsByHour)
    .map((h) => parseInt(h))
    .sort((a, b) => a - b);

  if (sortedHours.length === 0) {
    // No habits for this day
    const noHabitsMsg = document.createElement('div');
    noHabitsMsg.textContent = 'No habits scheduled for this day';
    noHabitsMsg.style.cssText = `
      text-align: center;
      padding: 40px;
      font-size: 1.2em;
      color: #666;
    `;
    scheduleContainer.appendChild(noHabitsMsg);
  } else {
    sortedHours.forEach((hour) => {
      const hourBlock = document.createElement('div');
      hourBlock.style.cssText = `
        border-top: 2px solid #ddd;
        padding: 16px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      `;

      const label = document.createElement('div');
      const ampmHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour < 12 ? 'AM' : 'PM';
      label.textContent = `${ampmHour}:00 ${period}`;
      label.style.cssText = `font-weight: bold; color: #555; margin-bottom: 16px; font-size: 1.1em;`;

      hourBlock.appendChild(label);

      // Create a container for habit cards in this hour
      const cardsContainer = document.createElement('div');
      cardsContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
      `;

      habitsByHour[hour].forEach(([habitId, habit]) => {
        const habitCard = document.createElement('habit-card');

        const freqMap = {
          1: 'Daily',
          7: 'Weekly',
          30: 'Monthly',
        };
        const freqStr =
          freqMap[habit.habitFrequency] || `Every ${habit.habitFrequency} days`;

        habitCard.setAttribute(
          'card-name',
          habit.habitName || 'Untitled Habit',
        );
        habitCard.setAttribute('card-frequency', freqStr);
        habitCard.setAttribute(
          'card-description',
          habit.habitDescription || 'No description',
        );
        habitCard.setAttribute('card-streak', habit.habitStreak || 0);
        habitCard.setAttribute('card-id', habitId);
        habitCard.setAttribute(
          'card-completed',
          isHabitComplete(habitId, currentDate) ? 'true' : 'false',
        );

        cardsContainer.appendChild(habitCard);
      });

      hourBlock.appendChild(cardsContainer);
      scheduleContainer.appendChild(hourBlock);
    });
  }

  contentContainer.appendChild(scheduleContainer);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕ Close';
  closeBtn.style.cssText = `
    margin: 30px auto;
    padding: 12px 24px;
    background: var(--primary-color);
    color: var(--text-color);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
  `;
  closeBtn.addEventListener('click', closeDetailedView);
  contentContainer.appendChild(closeBtn);

  overlay.appendChild(contentContainer);
  document.body.appendChild(overlay);
}

/**
 * Close the detailed view overlay and restore the calendar display
 */
function closeDetailedView() {
  const overlay = document.getElementById('habit-detail-overlay');
  if (overlay) overlay.remove();

  const calend = document.querySelector('.calendar-container');
  if (calend) calend.style.display = 'flex';

  cardsHidden = false;
}

/** @type {number} X coordinate where touch started */
let touchStartX = 0;
/** @type {number} X coordinate where touch ended */
let touchEndX = 0;

/**
 * Handle touch start events for swipe navigation
 * @param {TouchEvent} e - The touch start event
 */
function handleTouchStart(e) {
  touchStartX = e.changedTouches[0].screenX;
}

/**
 * Handle touch end events for swipe navigation
 * @param {TouchEvent} e - The touch end event
 */
function handleTouchEnd(e) {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}

/**
 * Process swipe gesture and navigate calendar if threshold is met
 * Swipe left navigates forward, swipe right navigates backward
 */
function handleSwipe() {
  const threshold = 50;
  const dx = touchEndX - touchStartX;
  if (Math.abs(dx) > threshold) {
    navigateCalendar(dx > 0 ? -1 : 1);
  }
}

/**
 * Handle keyboard navigation events
 * Arrow keys navigate the calendar, Escape closes detailed view
 *
 * @param {KeyboardEvent} e - The keyboard event
 */
function handleKeyDown(e) {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
    navigateCalendar(e.key === 'ArrowLeft' ? -1 : 1);

    if (cardsHidden) {
      const existing = document.getElementById('habit-detail-overlay');
      if (existing) existing.remove();
      showDetailedView();
    }
  } else if (e.key === 'Escape' && cardsHidden) {
    e.preventDefault();
    closeDetailedView();
  }
}

/**
 * Set up all event listeners for calendar interaction
 * Includes click handlers, keyboard navigation, touch gestures, and storage events
 */
function setupEventListeners() {
  const prevCard = document.getElementById('prev-day');
  const currCard = document.getElementById('current-day');
  const nextCard = document.getElementById('next-day');

  if (prevCard) prevCard.addEventListener('click', () => handleDayClick(-1));
  if (currCard) currCard.addEventListener('click', showDetailedView);
  if (nextCard) nextCard.addEventListener('click', () => handleDayClick(1));

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchend', handleTouchEnd, { passive: true });
  window.addEventListener('storage', updateHabitsForDays);
}

// Initialize calendar when DOM is ready
document.addEventListener('DOMContentLoaded', initCalendar);

/**
 * Public API for the Daily Calendar module
 * Exposes key functions for external use
 *
 * @namespace DailyCalendar
 */
window.DailyCalendar = {
  navigateCalendar,

  updateHabitsForDays,

  getCurrentDate: () => new Date(currentDate),

  initCalendar,

  showDetailedView,

  closeDetailedView,

  updateHabitIndicators,

  fillCard,

  /**
   * Get all habits that are active for a specific date
   * @param {Date} date - The date to get habits for
   * @returns {Object[]} Array of habit objects active on the given date
   */
  getHabitsForDate: (date) => {
    return getHabitsForSpecificDate(date);
  },
};
