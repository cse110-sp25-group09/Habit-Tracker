// Daily Calendar Module for Habit Tracker
// Handles the three-card carousel display and navigation

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

// Fetch habits with multiple fallbacks
function getStoredHabits() {
  if (typeof window.getAllHabits === 'function') {
    try {
      const all = window.getAllHabits();
      if (Array.isArray(all)) return all;
    } catch {}
  }

  try {
    const rawAll = localStorage.getItem('habits');
    if (rawAll) {
      const parsed = JSON.parse(rawAll);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  const habits = [];
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('id')) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const h = JSON.parse(raw);
            h.id = key;
            habits.push(h);
          }
        } catch {}
      }
    });
  } catch {}
  return habits;
}

// Check if habit is active on date
function isHabitActiveOnDate(habit, date) {
  try {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const todayZero = new Date();
    todayZero.setHours(0, 0, 0, 0);

    if (
      checkDate.getTime() === todayZero.getTime() &&
      typeof window.isHabitForToday === 'function'
    ) {
      try {
        return window.isHabitForToday(habit);
      } catch {}
    }

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

// Check if habit is completed on date
function isHabitCompletedOnDate(habit, date) {
  try {
    const dateStr = date.toDateString();
    return Array.isArray(habit.logs) && habit.logs.includes(dateStr);
  } catch {
    return false;
  }
}

// Update habit indicators
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

  const habits = getStoredHabits();
  const activeList = habits.filter((h) => isHabitActiveOnDate(h, currentDate));

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
  `;

  const contentContainer = document.createElement('div');
  contentContainer.style.cssText = `
    max-width: 400px;
    width: 100%;
    height: 100%;
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
  countEl.textContent = `${activeList.length} habit${activeList.length === 1 ? '' : 's'}`;
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
    padding: 0 20px;
  `;

  if (activeList.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent = 'No habits for this day';
    emptyMsg.style.cssText = `
      text-align: center;
      color: #888;
      margin-top: 2rem;
    `;
    cardContainer.appendChild(emptyMsg);
  } else {
    activeList.forEach((habit) => {
      const isCompleted = isHabitCompletedOnDate(habit, currentDate);
      const habitCard = document.createElement('div');
      habitCard.className = 'habit-card';
      habitCard.style.cssText = `
        display: flex;
        align-items: center;
        padding: 12px;
        margin: 12px 0;
        background: ${isCompleted ? '#e8f5e8' : '#f8f8f8'};
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
      `;
      habitCard.dataset.id = habit.id ?? habit.habitId;

      // Add hover effect
      habitCard.addEventListener('mouseenter', () => {
        habitCard.style.background = isCompleted ? '#d4f0d4' : '#eeeeee';
      });
      habitCard.addEventListener('mouseleave', () => {
        habitCard.style.background = isCompleted ? '#e8f5e8' : '#f8f8f8';
      });

      // Checkbox icon
      const icon = document.createElement('div');
      icon.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${isCompleted ? '#4caf50' : '#ddd'};
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 12px;
        margin-right: 12px;
      `;
      icon.textContent = isCompleted ? '✓' : '';

      // Habit name
      const nameDiv = document.createElement('div');
      nameDiv.style.cssText = `
        flex-grow: 1;
        font-weight: 500;
        color: #333;
      `;
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
  closeBtn.style.cssText = `
    position: absolute;
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

// Toggle habit completion
function toggleHabitCompletion(habitId) {
  if (typeof window.logHabitCompleted === 'function') {
    try {
      if (window.logHabitCompleted(habitId)) {
        refreshUI();
        return;
      }
    } catch {}
  }

  let habitObj = null;
  try {
    if (typeof window.readHabit === 'function') {
      try {
        const raw = window.readHabit(habitId);
        habitObj = raw
          ? typeof raw === 'string'
            ? JSON.parse(raw)
            : raw
          : null;
      } catch {}
    }

    if (!habitObj) {
      const all = getStoredHabits();
      habitObj = all.find((h) => (h.id ?? h.habitId) === habitId);
    }

    if (!habitObj) return;

    const dateStr = currentDate.toDateString();
    habitObj.logs = Array.isArray(habitObj.logs) ? habitObj.logs : [];
    const wasCompleted = habitObj.logs.includes(dateStr);

    if (wasCompleted) {
      habitObj.logs = habitObj.logs.filter((d) => d !== dateStr);
    } else {
      habitObj.logs.push(dateStr);
      if (typeof window.calculateStreak === 'function') {
        try {
          habitObj.habitStreak = window.calculateStreak(habitObj);
        } catch {}
      }
    }

    localStorage.setItem(habitId, JSON.stringify(habitObj));
    refreshUI();
  } catch {}
}

// Refresh UI after toggle
function refreshUI() {
  updateHabitsForDays();
  closeDetailedView();
  setTimeout(showDetailedView, 100);
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
    const habits = getStoredHabits();
    return habits.filter((h) => isHabitActiveOnDate(h, date));
  },
};
