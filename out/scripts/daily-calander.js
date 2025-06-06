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

// Import functions from CRUD.js
import {
  getAllHabits,
  getHabitById,
  readHabit,
  updateHabit,
  ratioOfCompleted,
  getHabitsForDay,
} from './CRUD.js';

// Navigation event listeners
const home_select = document.getElementById('home-selection');
const calendar_select = document.getElementById('calendar-selection');
const settings_select = document.getElementById('settings-selection');

/**
 * Event listener for home navigation button
 */
home_select?.addEventListener('click', () => {
  window.location.href = 'home-page.html';
});

/**
 * Event listener for calendar navigation button
 */
calendar_select?.addEventListener('click', () => {
  window.location.href = 'monthly-calendar.html';
});

/**
 * Event listener for settings navigation button
 */
settings_select?.addEventListener('click', () => {
  window.location.href = 'settings.html';
});

// Calendar state
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

  /**
   * Fill a specific card with date information
   * @param {string} cardId - The ID of the card element to fill
   * @param {Date} dateObj - The date object containing the date to display
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

  fillCard('prev-day', prevDate);
  fillCard('current-day', currentDate);
  fillCard('next-day', nextDate);
}

/**
 * Fetch all habits from storage using CRUD.js functions
 * Handles different return formats and provides fallback error handling
 *
 * @returns {Object[]} Array of habit objects with normalized structure
 */
function getStoredHabits() {
  try {
    const allHabits = getAllHabits();
    if (!allHabits) return [];

    // getAllHabits returns array of [habitId, habitObject] pairs
    if (Array.isArray(allHabits) && allHabits.length > 0) {
      // If it's already in the expected format, return as is
      if (Array.isArray(allHabits[0]) && allHabits[0].length === 2) {
        return allHabits.map(([id, habit]) => ({ ...habit, id }));
      }
      // If it's just an array of habit objects
      return allHabits;
    }
    return [];
  } catch (error) {
    console.warn('Error fetching habits from CRUD:', error);
    return [];
  }
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
    // Create a habit object compatible with CRUD.js functions
    const habitForCRUD = {
      ...habit,
      startDateTime: habit.startDateTime,
      habitFrequency: habit.habitFrequency,
      logs: habit.logs || [],
    };

    // Use getHabitsForDay from CRUD.js to check if habit is active
    const habitsForDay = getHabitsForDay(date);
    if (!habitsForDay) return false;

    // Check if this habit is in the list of habits for the day
    const habitId = habit.id || habit.habitId;
    return habitsForDay.some(([id, habitObj]) => id === habitId);
  } catch (error) {
    console.warn('Error checking habit active status:', error);
    // Fallback to original logic if CRUD function fails
    try {
      const start = new Date(habit.startDateTime);
      if (isNaN(start.getTime())) return false;

      const diffMs = date.getTime() - start.getTime();
      const daysDiff = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const freq = parseInt(habit.habitFrequency, 10) || 1;
      return daysDiff >= 0 && daysDiff % freq === 0;
    } catch {
      return false;
    }
  }
}

/**
 * Check if a habit is completed on a specific date using CRUD.js logic
 * Falls back to checking logs directly if CRUD functions are unavailable
 *
 * @param {Object} habit - The habit object to check
 * @param {Date} date - The date to check completion for
 * @returns {boolean} True if the habit is completed on the given date
 */
function isHabitCompletedOnDate(habit, date) {
  try {
    const habitId = habit.id || habit.habitId;
    if (!habitId) return false;

    // Try to use CRUD.js isHabitComplete function if available
    if (typeof window.isHabitComplete === 'function') {
      return window.isHabitComplete(habitId, date);
    }

    // Fallback to checking logs directly
    const dateStr = date.toDateString();
    return Array.isArray(habit.logs) && habit.logs.includes(dateStr);
  } catch (error) {
    console.warn('Error checking habit completion:', error);
    return false;
  }
}

/**
 * Update habit indicators for all three calendar cards (previous, current, next day)
 */
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

/**
 * Update habit indicators for a specific day container
 * Creates colored dots representing each active habit's completion status
 *
 * @param {string} containerId - The ID of the container element to update
 * @param {Object[]} habits - Array of all habit objects
 * @param {Date} date - The date to display habits for
 */
function updateHabitIndicators(containerId, habits, date) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const activeList = habits.filter((h) => isHabitActiveOnDate(h, date));
  activeList.forEach((habit) => {
    const dot = document.createElement('div');
    dot.classList.add('habit-dot');
    dot.classList.add(
      isHabitCompletedOnDate(habit, date) ? 'completed' : 'pending',
    );
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
 * Handle clicks on the current day card to show detailed view
 */
function handleCurrentDayClick() {
  showDetailedView();
}

/**
 * Show the detailed view overlay for the current day
 * Creates and displays a modal with all active habits and their completion status
 */
function showDetailedView() {
  const calend = document.querySelector('.calendar-container');
  if (calend) calend.style.display = 'none';
  cardsHidden = true;

  const habits = getStoredHabits();
  const activeList = habits.filter((h) => isHabitActiveOnDate(h, currentDate));

  const overlay = document.createElement('div');
  overlay.id = 'habit-detail-overlay';
  overlay.className = 'habit-detail-overlay';

  const contentContainer = document.createElement('div');
  contentContainer.className = 'detail-content-container';

  // Header
  const header = document.createElement('div');
  header.className = 'detail-header';

  const dayNameEl = document.createElement('div');
  dayNameEl.textContent = dayNames[currentDate.getDay()];
  dayNameEl.className = 'detail-day-name';

  const dateEl = document.createElement('div');
  dateEl.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`;
  dateEl.className = 'detail-date';

  const countEl = document.createElement('div');
  countEl.textContent = `${activeList.length} habit${activeList.length === 1 ? '' : 's'}`;
  countEl.className = 'detail-count';

  header.appendChild(dayNameEl);
  header.appendChild(dateEl);
  header.appendChild(countEl);
  contentContainer.appendChild(header);

  // Habit cards container
  const cardContainer = document.createElement('div');
  cardContainer.className = 'detail-card-container';

  if (activeList.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent = 'No habits for this day';
    emptyMsg.className = 'detail-empty-message';
    cardContainer.appendChild(emptyMsg);
  } else {
    activeList.forEach((habit) => {
      const isCompleted = isHabitCompletedOnDate(habit, currentDate);
      const habitCard = document.createElement('div');
      habitCard.className = `habit-card${isCompleted ? ' completed' : ''}`;
      habitCard.dataset.id = habit.id ?? habit.habitId;

      // Checkbox icon
      const icon = document.createElement('div');
      icon.className = `habit-icon${isCompleted ? ' completed' : ''}`;
      icon.textContent = isCompleted ? '✓' : '';

      // Habit name
      const nameDiv = document.createElement('div');
      nameDiv.className = 'habit-name';
      nameDiv.textContent = habit.habitName || 'Unnamed Habit';

      habitCard.appendChild(icon);
      habitCard.appendChild(nameDiv);
      habitCard.addEventListener('click', () => {
        toggleHabitCompletion(habit.id ?? habit.habitId);
      });
      cardContainer.appendChild(habitCard);
    });
  }

  contentContainer.appendChild(cardContainer);

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕ Close';
  closeBtn.className = 'detail-close-btn';
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

/**
 * Toggle the completion status of a habit for the current date
 * Uses CRUD.js functions with fallback to manual localStorage operations
 *
 * @param {string} habitId - The unique identifier of the habit to toggle
 */
function toggleHabitCompletion(habitId) {
  try {
    // Try to use CRUD.js logHabitCompleted function
    if (typeof window.logHabitCompleted === 'function') {
      try {
        window.logHabitCompleted(habitId);
        refreshUI();
        return;
      } catch (error) {
        console.warn('CRUD logHabitCompleted failed:', error);
      }
    }

    // Fallback to manual implementation using CRUD.js readHabit
    let habitObj = null;
    try {
      const habitData = readHabit(habitId);
      habitObj = habitData ? JSON.parse(habitData) : null;
    } catch (error) {
      console.warn('Error reading habit from CRUD:', error);
    }

    // If CRUD readHabit failed, try alternative approach
    if (!habitObj) {
      try {
        habitObj = getHabitById(habitId);
      } catch (error) {
        console.warn('Error getting habit by ID from CRUD:', error);
      }
    }

    // Final fallback to stored habits
    if (!habitObj) {
      const all = getStoredHabits();
      habitObj = all.find((h) => (h.id ?? h.habitId) === habitId);
    }

    if (!habitObj) {
      console.error('Could not find habit with ID:', habitId);
      return;
    }

    // Toggle completion
    const dateStr = currentDate.toDateString();
    habitObj.logs = Array.isArray(habitObj.logs) ? habitObj.logs : [];
    const wasCompleted = habitObj.logs.includes(dateStr);

    if (wasCompleted) {
      habitObj.logs = habitObj.logs.filter((d) => d !== dateStr);
    } else {
      habitObj.logs.push(dateStr);

      // Try to update streak using CRUD function
      if (typeof window.calculateStreak === 'function') {
        try {
          habitObj.habitStreak = window.calculateStreak(habitObj);
        } catch (error) {
          console.warn('Error calculating streak:', error);
        }
      }
    }

    // Save using CRUD updateHabit if available, otherwise use localStorage
    try {
      if (typeof updateHabit === 'function') {
        updateHabit(
          habitId,
          ['logs', 'habitStreak'],
          [habitObj.logs, habitObj.habitStreak || 0],
        );
      } else {
        localStorage.setItem(habitId, JSON.stringify(habitObj));
      }
    } catch (error) {
      console.warn('Error updating habit:', error);
      // Fallback to localStorage
      localStorage.setItem(habitId, JSON.stringify(habitObj));
    }

    refreshUI();
  } catch (error) {
    console.error('Error toggling habit completion:', error);
  }
}

/**
 * Refresh the user interface after toggling habit completion
 * Updates habit indicators and refreshes the detailed view
 */
function refreshUI() {
  updateHabitsForDays();
  closeDetailedView();
  setTimeout(showDetailedView, 100);
}

// Touch handling variables
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
  if (currCard) currCard.addEventListener('click', handleCurrentDayClick);
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

  /**
   * Get all habits that are active for a specific date
   * @param {Date} date - The date to get habits for
   * @returns {Object[]} Array of habit objects active on the given date
   */
  getHabitsForDate: (date) => {
    const habits = getStoredHabits();
    return habits.filter((h) => isHabitActiveOnDate(h, date));
  },
};

/**
 * Load the saved theme from localStorage and apply it to the document body
 * Used for maintaining theme consistency across page loads
 */
function loadSavedTheme() {
  const body = document.body;
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme && savedTheme !== 'default') {
    body.classList.add(`${savedTheme}-theme`);
  }
}

// Load theme when DOM is ready
window.addEventListener('DOMContentLoaded', loadSavedTheme);

// Also load theme immediately in case DOMContentLoaded has already fired
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSavedTheme);
} else {
  loadSavedTheme();
}
