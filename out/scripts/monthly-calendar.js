//Imports helper function for calculating task completion ratios of a given date
import { ratioOfCompleted } from './CRUD.js';

/**
 * @return sets up navigation and menu toggle behavior for the page
 */
export function initNavigation() {
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

  // Daily calendar button navigation
  document
    .getElementById('daily-option')
    .addEventListener('click', function (event) {
      window.location.href = 'daily-calendar.html';
    });

  // Monthly calendar button navigation
  document
    .getElementById('monthly-option')
    .addEventListener('click', function (event) {
      window.location.href = 'monthly-calendar.html';
    });

  // Settings button navigation
  settings_select.addEventListener('click', () => {
    window.location.href = 'settings.html';
  });
}

// Initialize the current year to the current date
let currentYear = new Date().getFullYear();
export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * @param dayElement HTML element representing a calendar day
 * @param tasksCompleted number of tasks completed on that day
 * @param totalTasks total number of tasks scheduled on that day
 * @return updates the CSS class of the day element based on completion ratio for heat mapping
 */
export function updateDayCompletion(dayElement, tasksCompleted, totalTasks) {
  // Clear old completion classes
  dayElement.classList.remove(
    'completed-day',
    'completed-one',
    'completed-half',
  );

  // If the day is in the past, do not modify it
  const today = new Date();
  const elementDateStr = dayElement.getAttribute('data-date'); // assumed format: "YYYY-MM-DD"
  if (elementDateStr) {
    const elementDate = new Date(elementDateStr);
    if (
      elementDate <
      new Date(today.getFullYear(), today.getMonth(), today.getDate())
    ) {
      return; // Don't modify past days
    }
  }

  // Assign new class based on number of tasks
  if (totalTasks === 0) {
    return; // No tasks, no class change
  } else if (tasksCompleted >= totalTasks) {
    dayElement.classList.add('completed-day');
  } else if (tasksCompleted >= totalTasks / 2) {
    dayElement.classList.add('completed-half');
  } else if (tasksCompleted >= 1) {
    dayElement.classList.add('completed-one');
  }
}

// Allow tests to access it indirectly
if (typeof window !== 'undefined') {
  window.updateDayCompletion = updateDayCompletion;
  window.generateCalendar = generateCalendar;
}

/**
 * @param year the year to generate the calendar for
 * @return populates the DOM with monthly calendars and completion status
 */
export function generateCalendar(year) {
  const calendarContainer = document.getElementById('calendar');
  const monthLabel = document.getElementById('month-label');
  calendarContainer.innerHTML = '';
  monthLabel.textContent = year;

  // Clear previous calendar content
  for (let month = 0; month < 12; month++) {
    const monthDiv = document.createElement('div');
    monthDiv.className = 'month';

    const title = document.createElement('div');
    title.className = 'month-label';
    title.textContent = `${monthNames[month]} ${year}`;
    monthDiv.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach((day) => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'day-header';
      dayHeader.textContent = day;
      grid.appendChild(dayHeader);
    });

    // Date logic
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    // Fill overflow from previous month
    for (let i = 0; i < firstDay; i++) {
      const overflow = document.createElement('div');
      overflow.className = 'day inactive';
      overflow.textContent = prevMonthDays - firstDay + 1 + i;
      grid.appendChild(overflow);
    }

    // Fill current month
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'day';
      dayDiv.textContent = day;

      if (day === todayDate && month === todayMonth && year === todayYear) {
        dayDiv.classList.add('today');
      }

      let date = new Date(year, month, day);
      let ratio = ratioOfCompleted(date);
      updateDayCompletion(dayDiv, ratio[0], ratio[1]);

      grid.appendChild(dayDiv);
    }

    // Fill remaining cells
    const totalCells = grid.children.length;
    const totalNeeded = 7 * 6;
    for (let i = totalCells; i < totalNeeded; i++) {
      const overflow = document.createElement('div');
      overflow.className = 'day inactive';
      overflow.textContent = i - totalCells + 1;
      grid.appendChild(overflow);
    }

    monthDiv.appendChild(grid);
    calendarContainer.appendChild(monthDiv);
  }
}

/**
 * @return adds click listeners for previous and next year buttons
 */
export function setupEventListeners() {
  document.getElementById('prev-year').addEventListener('click', () => {
    currentYear--;
    generateCalendar(currentYear);
  });

  document.getElementById('next-year').addEventListener('click', () => {
    currentYear++;
    generateCalendar(currentYear);
  });
}

// Applies saved theme, generates the calendar, sets up listeners and navigation bar
window.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme && savedTheme !== 'default') {
    body.classList.add(`${savedTheme}-theme`);
  }
  generateCalendar(currentYear);
  setupEventListeners();
  initNavigation();
});
