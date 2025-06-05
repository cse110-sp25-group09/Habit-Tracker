// Daily Calendar Module for Habit Tracker
// Handles the three-card carousel display and navigation with full habit cards

// Import CRUD functions
import {
  getHabitsForDay,
  isHabitComplete,
  logHabitCompleted,
  removeHabitCompletion,
  getAllHabits,
  getHabitById
} from './CRUD.js';

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
        background: var(--card-color, #7c8efc);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
        color: var(--text-color-front-of-card, white);
      }
 
      .flip-card-back {
        background-color: var(--back-card-color, #6b7cff);
        color: var(--text-color-back-of-card, white);
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
        color: var(--streak-color, #ffeb3b);
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
            <input type="checkbox" class="habit-checkbox" />
          </label>
        </div>
        <div class="flip-card-back">
          <p id="card_description">${this.getAttribute('card-description') || 'None'}</p>
          <p id="card_frequency">${this.getAttribute('card-frequency') || 'None'}</p>
          <p id="card_time">${this.getAttribute('card-time') || 'None'}</p>
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

      if (idElement) {
        const cardId = idElement.textContent.trim();
        
        if (isChecked) {
          logHabitCompleted(cardId);
        } else {
          removeHabitCompletion(cardId);
        }
        
        // Update the calendar indicators
        if (window.DailyCalendar) {
          window.DailyCalendar.updateHabitsForDays();
        }
      }
    });
  }

  static get observedAttributes() {
    return ['card-name', 'card-completed', 'card-frequency', 'card-description', 'card-time', 'card-streak', 'card-id'];
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
    const timeEl = this.shadowRoot.getElementById('card_time');
    const streakEl = this.shadowRoot.getElementById('card_streak');
    const idEl = this.shadowRoot.getElementById('card_id');
    const checkbox = this.shadowRoot.querySelector('.habit-checkbox');

    if (titleEl) {
      titleEl.textContent = this.getAttribute('card-name') || 'Untitled Habit';
    }

    if (freqEl) {
      freqEl.textContent = `Frequency: ${this.getAttribute('card-frequency') || 'None'}`;
    }
    
    if (descrEl) {
      descrEl.textContent = `Description: ${this.getAttribute('card-description') || 'None'}`;
    }
    
    if (timeEl) {
      timeEl.textContent = `Time: ${this.getAttribute('card-time') || 'None'}`;
    }
    
    if (streakEl) {
      streakEl.innerHTML = `Current Streak: <span class="streak_number"> ${this.getAttribute('card-streak') || '0'} </span>`;
    }
    
    if (idEl) {
      idEl.textContent = this.getAttribute('card-id') || 'None';
    }
    
    if (checkbox) {
      checkbox.checked = this.getAttribute('card-completed') === 'true';
    }
  }
}

// Define the custom element
customElements.define('habit-card', HabitCard);

// Navigation event listeners
const home_select = document.getElementById('home-selection');
const calendar_select = document.getElementById('calendar-selection');
const settings_select = document.getElementById('settings-selection');

home_select?.addEventListener('click', () => {
  window.location.href = 'home-page.html';
});
calendar_select?.addEventListener('click', () => {
  window.location.href = 'monthly-calendar.html';
});
settings_select?.addEventListener('click', () => {
  window.location.href = 'settings.html';
});

// Calendar state
let currentDate = new Date();
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

// Update the visual display of the three cards
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

// Get habits for a specific date using CRUD functions
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

// Check if habit is active on date (using same logic as CRUD)
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

// Update habit indicators for all three cards
function updateHabitsForDays() {
  const prevDate = new Date(currentDate);
  prevDate.setDate(currentDate.getDate() - 1);
  const nextDate = new Date(currentDate);
  nextDate.setDate(currentDate.getDate() + 1);

  updateHabitIndicators('prev-habits', prevDate);
  updateHabitIndicators('current-habits', currentDate);
  updateHabitIndicators('next-habits', nextDate);
}

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

// Navigate calendar
function navigateCalendar(direction) {
  const newDate = new Date(currentDate);
  newDate.setDate(newDate.getDate() + direction);
  currentDate = newDate;
  updateCalendarDisplay();
  updateHabitsForDays();
}

// Handle day clicks
function handleDayClick(offset) {
  navigateCalendar(offset);
}

// Show detailed view
function handleCurrentDayClick() {
  showDetailedView();
}

// Build detailed view overlay
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
    align-items: center;
    z-index: 1000;
    overflow-y: auto;
  `;

  const contentContainer = document.createElement('div');
  contentContainer.style.cssText = `
    max-width: 400px;
    width: 100%;
    min-height: 100vh;
    position: relative;
    display: flex;
    flex-direction: column;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    flex-direction: column;
    text-align: center;
    padding: 20px 0;
    background: #7c8efc;
    color: white;
    position: sticky;
    top: 0;
    z-index: 1001;
  `;

  const dayNameEl = document.createElement('div');
  dayNameEl.textContent = dayNames[currentDate.getDay()];
  dayNameEl.style.cssText = `
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.2;
  `;

  const dateEl = document.createElement('div');
  dateEl.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`;
  dateEl.style.cssText = `
    font-size: 1rem;
    line-height: 1.1;
    margin-top: 5px;
  `;

  const countEl = document.createElement('div');
  countEl.textContent = `${habits.length} habit${habits.length === 1 ? '' : 's'}`;
  countEl.style.cssText = `
    font-size: 0.9rem;
    opacity: 0.9;
    margin-top: 8px;
    line-height: 1.1;
  `;

  header.appendChild(dayNameEl);
  header.appendChild(dateEl);
  header.appendChild(countEl);
  contentContainer.appendChild(header);

  // Habit cards container
  const cardContainer = document.createElement('div');
  cardContainer.style.cssText = `
    background-color: #fff;
    width: 100%;
    flex-grow: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  `;

  if (habits.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent = 'No habits for this day';
    emptyMsg.style.cssText = `
      text-align: center;
      color: #888;
      margin-top: 2rem;
    `;
    cardContainer.appendChild(emptyMsg);
  } else {
    habits.forEach(([habitId, habit]) => {
      // Create habit card using the custom element
      const habitCard = document.createElement('habit-card');
      
      // Convert frequency number to string
      let freqStr = '';
      const freqNum = habit.habitFrequency;
      if (freqNum === 1) {
        freqStr = 'Daily';
      } else if (freqNum === 7) {
        freqStr = 'Weekly';
      } else if (freqNum === 30) {
        freqStr = 'Monthly';
      } else {
        freqStr = `Every ${freqNum} days`;
      }

      // Set all the card attributes
      habitCard.setAttribute('card-name', habit.habitName || 'Untitled Habit');
      habitCard.setAttribute('card-frequency', freqStr);
      habitCard.setAttribute('card-description', habit.habitDescription || 'No description');
      habitCard.setAttribute('card-time', habit.startDateTime || 'No time set');
      habitCard.setAttribute('card-streak', habit.habitStreak || 0);
      habitCard.setAttribute('card-id', habitId);
      habitCard.setAttribute('card-completed', isHabitComplete(habitId, currentDate) ? 'true' : 'false');
      
      cardContainer.appendChild(habitCard);
    });
  }

  contentContainer.appendChild(cardContainer);

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕ Close';
  closeBtn.style.cssText = `
    position: sticky;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    background: #7c8efc;
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    margin: 20px auto;
  `;
  closeBtn.addEventListener('click', closeDetailedView);
  contentContainer.appendChild(closeBtn);

  overlay.appendChild(contentContainer);
  document.body.appendChild(overlay);
}

// Close detailed view
function closeDetailedView() {
  const overlay = document.getElementById('habit-detail-overlay');
  if (overlay) overlay.remove();

  const calend = document.querySelector('.calendar-container');
  if (calend) calend.style.display = 'flex';

  cardsHidden = false;
}

// Touch handling
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(e) {
  touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}

function handleSwipe() {
  const threshold = 50;
  const dx = touchEndX - touchStartX;
  if (Math.abs(dx) > threshold) {
    navigateCalendar(dx > 0 ? -1 : 1);
  }
}

// Keyboard navigation
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

// Setup event listeners
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

// Initialize calendar
document.addEventListener('DOMContentLoaded', initCalendar);

// Expose public API
window.DailyCalendar = {
  navigateCalendar,
  updateHabitsForDays,
  getCurrentDate: () => new Date(currentDate),
  initCalendar,
  showDetailedView,
  closeDetailedView,
  getHabitsForDate: (date) => {
    return getHabitsForSpecificDate(date);
  },
};