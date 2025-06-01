// Daily Calendar Module for Habit Tracker
// Handles the three-card carousel display and navigation

// Calendar state
let currentDate = new Date();
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
    prevCard.querySelector('.day-date').textContent = `${monthNames[prevDate.getMonth()]} ${prevDate.getDate()}`;

    // Update current day
    const currentCard = document.getElementById('current-day');
    currentCard.querySelector('.day-name').textContent = dayNames[currentDate.getDay()];
    currentCard.querySelector('.day-date').textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`;

    // Update next day
    const nextCard = document.getElementById('next-day');
    nextCard.querySelector('.day-name').textContent = dayNames[nextDate.getDay()];
    nextCard.querySelector('.day-date').textContent = `${monthNames[nextDate.getMonth()]} ${nextDate.getDate()}`;
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
        if (key.startsWith('id')) { // Habit IDs start with 'id' based on your CRUD
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

    console.log(`Updating habits for ${elementId}:`, habits.length, 'habits found');
    
    const activeHabits = habits.filter(habit => isHabitActiveOnDate(habit, date));
    console.log(`Active habits for ${date.toDateString()}:`, activeHabits.length);
    
    activeHabits.forEach((habit, index) => {
        const dot = document.createElement('div');
        dot.classList.add('habit-dot');
        
        if (isHabitCompletedOnDate(habit, date)) {
            dot.classList.add('completed');
            console.log(`Habit ${habit.habitName || habit.name || index} completed on ${date.toDateString()}`);
        } else {
            dot.classList.add('pending');
            console.log(`Habit ${habit.habitName || habit.name || index} pending on ${date.toDateString()}`);
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
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Day card click handlers
    document.getElementById('prev-day').addEventListener('click', () => handleDayClick(-1));
    document.getElementById('next-day').addEventListener('click', () => handleDayClick(1));

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
    initCalendar
};

document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".day-card");
    let activeIndex = 1;

    function updateCards(newIndex) {
        if (newIndex < 0 || newIndex >= cards.length) return;
        cards.forEach((card, index) => {
            card.classList.remove("active", "inactive");
            if (index === newIndex) {
                card.classList.add("active");
            } else {
                card.classList.add("inactive");
            }
        });
        activeIndex = newIndex;
    }
});