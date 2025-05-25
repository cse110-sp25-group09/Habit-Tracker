import {createCard, localStorageAdapter} from "./createCard.js"
window.addEventListener('DOMContentLoaded', init);

function init() {
  initFormHandler();
}

function getHabits() {
  return JSON.parse(localStorage.getItem('habits'));
}

function saveHabits(habits) {
  localStorage.setItem('habits', JSON.stringify(habits));
}

function initFormHandler() {
  let habitForm = document.querySelector('form');
  habitForm.addEventListener('submit', (event) => {
    event.preventDefault();
    //take data from form input 
    let habitNameOpt = document.getElementById("habitName"); 
    let habitDescriptionOpt = document.getElementById("description"); 
    let habitFrequencyOpt = document.getElementById("frequency"); 
    let habitFrequencyNumber = Number(habitFrequencyOpt.value); 
    let habitStartDateOpt = document.getElementById("startDate"); 
    let habitStartTimeOpt = document.getElementById("reminderTime"); 
    let habitStartDateTime = habitStartDateOpt.value + 'T' +habitStartTimeOpt.value; 
    //call createCard
    createCard(habitNameOpt.value,
      habitDescriptionOpt.value, 
      habitFrequencyNumber, 
      habitStartDateTime, 
      localStorageAdapter
    ); 
/*
    let habits = getHabits() || [];
    const existingHabitIndex = habits.findIndex(
      (h) => h.habitName === habit.habitName,
    );

    if (existingHabitIndex !== -1) {
      habits[existingHabitIndex] = habit;
      alert('Habit updated successfully!');
    } else {
      habits.push(habit);
      alert('New habit added!');
    }

    saveHabits(habits);

    displayHabits();
  */ 
  });

  let clearBtn = document.querySelector('button.danger');
  clearBtn.addEventListener('click', () => {
    localStorage.clear();
    alert('All habits cleared!');
    displayHabits();
  });
}

function deleteHabit(index) {
  const habits = JSON.parse(localStorage.getItem('habits')) || [];
  habits.splice(index, 1);
  localStorage.setItem('habits', JSON.stringify(habits));
  displayHabits();
}

function displayHabits() {
  const habitCards = document.getElementById('habit-cards');
  habitCards.innerHTML = '';
  const habits = JSON.parse(localStorage.getItem('habits')) || [];
  habits.forEach((habit, index) => {
    const habitCard = document.createElement('div');
    habitCard.classList.add('habit-card');

    habitCard.innerHTML = `
      <h3>${habit.habitName}</h3>
      <p>Frequency: ${habit.frequency}</p>
      <p>Priority: ${habit.priority}</p>
      <p>Streak: ${habit.streakCount}</p>
    `;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteHabit(index));

    habitCard.appendChild(deleteButton);
    habitCards.appendChild(habitCard);
  });
}

window.addEventListener('load', displayHabits);
