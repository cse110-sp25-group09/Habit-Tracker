/**
 * Daily Calendar Module for Habit Tracker
 * Handles the three-card carousel display and navigation
 *
 * @fileoverview This module manages the daily calendar view with a three-card carousel
 * showing previous, current, and next day. It handles habit display, completion tracking,
 * and provides both touch and keyboard navigation.
 *
 * @author Your Name
 * @version 1.0.0
 */

// Import CRUD functions
import {
  isHabitComplete,
  logHabitCompleted,
  removeHabitCompletion,
  getAllHabits,
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
        font-size: 2em;
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
    </style>

    <div class="flip-card">
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <h1 id="card_name">${this.getAttribute('card-name') || 'Untitled Habit'}</h1>
          <label style="margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            Complete:
            <input type="checkbox" class="habit-checkbox" disabled />
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
    //const timeEl = this.shadowRoot.getElementById('card_time');
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

    if (checkbox) {
      checkbox.checked = this.getAttribute('card-completed') === 'true';
      if (checkbox.checked) {
        cardFront.classList.add('completed');
      }
    }
  }
}

// Define the custom element
customElements.define('habit-card', HabitCard);

window.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme && savedTheme !== 'default') {
    body.classList.add(`${savedTheme}-theme`);
  }
});

/** @type {Date} Current date being displayed in the calendar */
let currentDate = new Date();

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
 * Update the visual display of the three calendar cards (previous, current, next day)
 * Populates each card with the appropriate day name and date
 */
function updateCalendarDisplay() {
  const prevDate = new Date(currentDate);
  prevDate.setDate(currentDate.getDate() - 1);

  const nextDate = new Date(currentDate);
  nextDate.setDate(currentDate.getDate() + 1);

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

  fillCard('prev-day', prevDate);
  fillCard('current-day', currentDate);
  fillCard('next-day', nextDate);
}

/**
 * Fetch all habits from storage using CRUD.js functions for a specific date
 * for a specific date
 *
 * @param {Date} date - The date to check activity for
 * @returns {Object[]} Array of habit objects with normalized structure
 */
function getHabitsForSpecificDate(date) {
  const allHabits = getAllHabits();
  if (!allHabits) return [];

  // Filter habits that should be active on the given date
  const activeHabits = [];

  for (const [habitId, habit] of allHabits) {
    if (isHabitActiveOnDate(habit, date)) {
      activeHabits.push([habitId, habit]);
    }
  }

  return activeHabits;
}

/**
 * Check if a habit is active on a specific date using CRUD.js logic
 * Falls back to frequency-based calculation if CRUD functions fail
 *
 * @param {Object} habit - The habit object to check
 * @param {Date} date - The date to check activity for
 * @returns {boolean} True if the habit is active on the given date
 */
function isHabitActiveOnDate(habit, date) {
  try {
    const startDate = new Date(habit.startDateTime);
    if (isNaN(startDate.getTime())) return false;

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    if (targetDate < startDate) return false;

    const timeDiff = targetDate.getTime() - startDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    return daysDiff % habit.habitFrequency === 0;
  } catch {
    return false;
  }
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

  // Hourly layout in 2 columns on wide screens
  const scheduleContainer = document.createElement('div');
  scheduleContainer.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    padding: 16px;
    box-sizing: border-box;
    width: 100%;
  `;

  const hourSequence = [...Array(24).keys()]
    .slice(6)
    .concat([...Array(6).keys()]);
  for (const hour of hourSequence) {
    const matchingHabits = habits.filter(([_, habit]) => {
      const time = new Date(habit.startDateTime);
      return time.getHours() === hour;
    });

    if (matchingHabits.length === 0) continue;

    const hourBlock = document.createElement('div');
    hourBlock.style.cssText = `
      border-top: 1px solid #ddd;
      padding-top: 8px;
      padding-left: 8px;
      background: #fff;
      border-radius: 8px;
    `;

    const label = document.createElement('div');
    const ampmHour = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour < 12 ? 'AM' : 'PM';
    label.textContent = `${ampmHour}:00 ${period}`;
    label.style.cssText = `font-weight: bold; color: #555; margin-bottom: 5px;`;

    hourBlock.appendChild(label);

    matchingHabits.forEach(([habitId, habit]) => {
      const habitCard = document.createElement('habit-card');

      const freqMap = {
        1: 'Daily',
        7: 'Weekly',
        30: 'Monthly',
      };
      const freqStr =
        freqMap[habit.habitFrequency] || `Every ${habit.habitFrequency} days`;

      habitCard.setAttribute('card-name', habit.habitName || 'Untitled Habit');
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

      hourBlock.appendChild(habitCard);
    });

    scheduleContainer.appendChild(hourBlock);
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
  /**
   * Navigate the calendar by specified number of days
   * @param {number} direction - Number of days to navigate
   */
  navigateCalendar,

  /**
   * Update habit indicators for all displayed days
   */
  updateHabitsForDays,

  /**
   * Get a copy of the current date being displayed
   * @returns {Date} Copy of the current date
   */
  getCurrentDate: () => new Date(currentDate),

  /**
   * Initialize the calendar display and event listeners
   */
  initCalendar,

  /**
   * Show the detailed view modal for the current day
   */
  showDetailedView,

  /**
   * Close the detailed view modal
   */
  closeDetailedView,

  isHabitActiveOnDate,

  /**
   * Get all habits that are active for a specific date
   * @param {Date} date - The date to get habits for
   * @returns {Object[]} Array of habit objects active on the given date
   */
  getHabitsForDate: (date) => {
    return getHabitsForSpecificDate(date);
  },
};
