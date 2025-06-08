//Imports helper function for calculating task completion ratios of a given date
import { ratioOfCompleted } from './CRUD.js';

//Menu Navigation Bar
const home_select = document.getElementById('home-selection');
const daily_calendar_select = document.getElementById(
  'daily-calendar-selection',
);
const calendar_select = document.getElementById('calendar-selection');
const settings_select = document.getElementById('settings-selection');

home_select.addEventListener('click', () => {
  window.location.href = 'home-page.html';
});
daily_calendar_select.addEventListener('click', () => {
  window.location.href = 'daily-calendar.html';
});
calendar_select.addEventListener('click', () => {
  window.location.href = 'monthly-calendar.html';
});
settings_select.addEventListener('click', () => {
  window.location.href = 'settings.html';
});

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

// Function to update the day element's completion status based on tasks completed
function updateDayCompletion(dayElement, tasksCompleted, totalTasks) {
  // Clear old completion classes
  dayElement.classList.remove(
    'completed-day',
    'completed-one',
    'completed-half',
  );

  // Assign new class based on number of tasks
  if (tasksCompleted >= totalTasks) {
    dayElement.classList.add('completed-day');
  } else if (tasksCompleted >= totalTasks / 2) {
    dayElement.classList.add('completed-half');
  } else if (tasksCompleted >= 1) {
    dayElement.classList.add('completed-one');
  }

  // Allow tests to access it indirectly
  if (typeof window !== 'undefined') {
    window.updateDayCompletion = updateDayCompletion;
  }
  
}

// Function to generate the calendar for a given year
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
    const today = new Date(); //this is purely visual, to highlight today's date
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

      //update the day completion status and color coding it
      let date = new Date(year, month, day);
      let ratio = ratioOfCompleted(date);

      updateDayCompletion(dayDiv, ratio[0], ratio[1]); // Assuming 0 tasks completed for now

      grid.appendChild(dayDiv);
    }

    // Fill remaining cells with next month overflow to make full 6 rows (if needed)
    const totalCells = grid.children.length;
    const totalNeeded = 7 * 6; // 7 days x 6 rows
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

// Function to set up event listeners for year navigation
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

// Function to handle theme selection
window.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme && savedTheme !== 'default') {
    body.classList.add(`${savedTheme}-theme`);
  }
  generateCalendar(currentYear);
  setupEventListeners();
});


