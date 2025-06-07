//below is the code for the menu bar
// Wait for the DOM to load before referencing elements
import {
  getHabitsForDay,
  createHabit,
  deleteHabit,
  logHabitCompleted,
  removeHabitCompletion,
  isHabitComplete,
} from './CRUD.js';

/* Sets up navigation, calendar menu toggle, and loads habit cards on page load */
document.addEventListener('DOMContentLoaded', function () {
  const home_select = document.getElementById('home-selection');
  const settings_select = document.getElementById('settings-selection');
  const calendarSelection = document.getElementById('calendar-selection');
  const calendarMenu = document.getElementById('calendar-menu');
  populateCards();
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



/**
 * HabitCard - A custom HTML element representing a single habit tracking card.
 * 
 * This component provides an interactive visual representation of a user's habit.
 * It uses Shadow DOM to encapsulate its structure and styles, ensuring clean integration
 * with the rest of the app. The card displays basic habit information on the front,
 * and reveals additional details on the back when clicked (flip animation).
 * 
 * Core Features:
 * --------------
 * 1. Flip Behavior:
 *    - The card has a front and back face.
 *    - Clicking anywhere on the card flips it to reveal the other side.
 * 
 * 2. Completion Toggle:
 *    - A checkbox on the front allows users to mark the habit as complete or incomplete.
 *    - Completion state is saved in localStorage and affects the visual styling of the card.
 *    - Completion changes also call `logHabitCompleted()` or `removeHabitCompletion()` and trigger a UI refresh via `populateCards()`.
 * 
 * 3. Delete Habit:
 *    - The back side contains a delete button with a confirmation prompt.
 *    - On confirmation, the habit is removed from the DOM and `deleteHabit()` is called with the card ID.
 * 
 * 4. Dynamic Content:
 *    - Card data (name, frequency, description, streak, ID, and completed state) is passed via attributes.
 *    - These attributes are used to populate the card UI and keep it in sync with the app's data model.
 * 
 * 5. Initialization:
 *    - The component reads initial completion state from localStorage (if available).
 *    - Attributes are used to render current values such as title, frequency, and description.
 * 
 */
class HabitCard extends HTMLElement {
  constructor() {
    super();
     /*Creates a flip card layout with:
      Front: habit name and completion checkbox
      Back: description, frequency, streak, and delete button */
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
  
     .habit-checkbox {
         accent-color: var(--checkbox-color); /* or any color you want */
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
         <p id= "card_id" hidden>${this.getAttribute('card-id') || 'None'}</p>
         <div class="delete-container">
           <button class="delete-btn">🗑️</button>
           <div class="confirm-dialog" hidden>
             <p  hidden class="delete-dialog">Delete? </p>
             <button class="confirm-yes" hidden>Yes</button>
             <button class="confirm-no" hidden>No</button>
           </div>
         </div>




       </div>
     </div>
   </div>
 `;
    const flipCard = shadow.querySelector('.flip-card');
    const flipInner = shadow.querySelector('.flip-card-inner');

    const deleteBtn = this.shadowRoot.querySelector('.delete-btn');
    const confirmDialog = this.shadowRoot.querySelector('.confirm-dialog');
    const deleteDialog = this.shadowRoot.querySelector('.delete-dialog');

    const yesBtn = this.shadowRoot.querySelector('.confirm-yes');
    const noBtn = this.shadowRoot.querySelector('.confirm-no');

   /*Delete Confirmation
     shows a confirmation dialog (Yes/No)
     If Yes: Removes card from the DOM*/
    deleteBtn.addEventListener('click', () => {
      confirmDialog.hidden = false;
      yesBtn.hidden = false;
      noBtn.hidden = false;
      deleteDialog.hidden = false;

      deleteBtn.hidden = true;
    });

    noBtn.addEventListener('click', () => {
      deleteBtn.hidden = false;
      confirmDialog.hidden = true;
      yesBtn.hidden = true;
      noBtn.hidden = true;
      deleteDialog.hidden = true;
    });

    yesBtn?.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent card flip

      const idElement = this.shadowRoot.querySelector('#card_id');
      if (idElement) {
        const cardId = idElement.textContent.trim();
        deleteHabit(cardId);
        this.remove(); // This removes the custom element from the DOM
      }
    });

    [deleteBtn, yesBtn, noBtn].forEach((btn) => {
      btn?.addEventListener('click', (e) => e.stopPropagation());
    });

    //Clicking the card flips it between front and back views using CSS transforms.
    flipCard.addEventListener('click', () => {
      flipInner.classList.toggle('flipped');
    });

    //listeners for the complete functionality
    const checkbox = shadow.querySelector('.habit-checkbox');

    //Checkbox for Marking Habit Complete/Incomplete
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      const isChecked = checkbox.checked;
      const idElement = this.shadowRoot.querySelector('#card_id');
      const cardFront = this.shadowRoot.querySelector('.flip-card-front');
      if (!idElement || !cardFront) return;

      const cardId = idElement.textContent.trim();

      if (idElement && cardFront) {
        const cardId = idElement.textContent.trim();

        if (isChecked) {
          logHabitCompleted(cardId);
          localStorage.setItem(`habit-${cardId}-completed`, 'true');
          cardFront.classList.remove('not-completed');
          cardFront.classList.add('completed');

          populateCards();
        } else {
          removeHabitCompletion(cardId);
          localStorage.setItem(`habit-${cardId}-completed`, 'false');

          cardFront.classList.remove('completed');
          cardFront.classList.add('not-completed');

          populateCards();
        }
      }
    });
  }

  static get observedAttributes() {
    return ['card-name', 'card-completed'];
  }

  connectedCallback() {
    const titleEl = this.shadowRoot.getElementById('card_name');
    const freqEl = this.shadowRoot.getElementById('card_frequency');
    const descrEl = this.shadowRoot.getElementById('card_description');
    //const timeEl = this.shadowRoot.getElementById('card_time');
    const streakEl = this.shadowRoot.getElementById('card_streak');
    const idEl = this.shadowRoot.getElementById('card_id');
    const checkbox = this.shadowRoot.querySelector('.habit-checkbox');
    const cardFront = this.shadowRoot.querySelector('.flip-card-front');

    // Get unique cardId from attribute, not from idEl textContent
    const cardIdAttr = this.getAttribute('card-id');
    const cardId = cardIdAttr ? cardIdAttr.trim() : null;

    if (!cardId) {
      console.warn('Habit card missing unique card-id attribute!');
      return; // Stop if no valid ID
    }

    // Load completion state from localStorage or fallback to attribute
    const savedCompleted = localStorage.getItem(`habit-${cardId}-completed`);
    const isCompleted = savedCompleted === 'true';
    const completedState =
      savedCompleted !== null
        ? isCompleted
        : this.getAttribute('card-completed') === 'true';

    // Set checkbox and card front style
    if (checkbox && cardFront) {
      checkbox.checked = completedState;

      cardFront.classList.remove('completed', 'not-completed');
      if (completedState) {
        cardFront.classList.add('completed');
      } else {
        cardFront.classList.add('not-completed');
      }

      // Add listener to update localStorage and styles on change
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          localStorage.setItem(`habit-${cardId}-completed`, 'true');
          cardFront.classList.add('completed');
          cardFront.classList.remove('not-completed');
        } else {
          localStorage.setItem(`habit-${cardId}-completed`, 'false');
          cardFront.classList.remove('completed');
          cardFront.classList.add('not-completed');
        }
      });
    }

    // Populate other fields
    if (titleEl) {
      titleEl.textContent = this.getAttribute('card-name') || 'Untitled Habit';
    }
    if (freqEl) {
      freqEl.textContent = `Frequency: ${this.getAttribute('card-frequency') || 'None'}`;
    }
    if (descrEl) {
      descrEl.textContent = `Description: ${this.getAttribute('card-description') || 'None'}`;
    }
    // if (timeEl) {
    //   timeEl.textContent = `Time: ${this.getAttribute('card-time') || 'None'}`;
    // }
    if (streakEl) {
      streakEl.innerHTML = `Current Streak: <span class="streak_number">${this.getAttribute('card-streak') || 'None'}</span>`;
    }
    if (idEl) {
      idEl.textContent = cardId; // use trimmed attribute value
    }
  }
}

customElements.define('habit-card', HabitCard);

// Submits the habit form, saves the habit, refreshes the cards, and resets the form.
document.getElementById('create-button').addEventListener('click', () => {
  document.getElementById('habit-form').style.display = 'block';
  document.getElementById('blur-overlay').classList.remove('hidden');
});
// Shows the form on "+" click, hides it when overlay is clicked.
document.getElementById('blur-overlay').addEventListener('click', () => {
  document.getElementById('habit-form').style.display = 'none';
  document.getElementById('blur-overlay').classList.add('hidden');
});

/* Handles form submission: creates a new habit, updates the UI, and resets the form */
document.getElementById('submit-habit').addEventListener('click', () => {
  const name = document.getElementById('habit-name').value.trim();
  const frequency = document.getElementById('habit-frequency').value;
  const descr = document.getElementById('habitDescription').value;
  //const timeStr = document.getElementById('habit-time').value;
  let time_dict = { Daily: 1, Weekly: 7, Monthly: 30 }; //Maps Frequency to a Number
  let streak = 0;

  //Validates and Submits Habit
  if (name !== '') { 
    // const newCard = document.createElement('habit-card');
    // newCard.setAttribute('card-name', name);
    // newCard.setAttribute('card-frequency', frequency);
    // newCard.setAttribute('card-description', descr);
    // newCard.setAttribute('card-time', timeStr);
    // newCard.setAttribute('card-streak', streak);
    let timeNum = time_dict[frequency];

    // document.getElementById('card-container').appendChild(newCard);
    createHabit(name, descr, timeNum);
    populateCards();
  }

  // Reset and hide form
  document.getElementById('habit-name').value = '';
  document.getElementById('habitDescription').value = '';
  document.getElementById('habit-frequency').value = 'Daily';
  //.getElementById('habit-time').value = '';

  document.getElementById('habit-form').style.display = 'none';
  document.getElementById('blur-overlay').classList.add('hidden');
});

window.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme && savedTheme !== 'default') {
    body.classList.add(`${savedTheme}-theme`);
  }
});

/*Gnerates and inserts a list of habit cards into the page 
based on the current day's habits, with each card reflecting the habit's 
name,frequency, description, streak, and completion status*/ 
function populateCards() {
  document.getElementById('card-container').innerHTML = ''; //clears existing card
  let habits = getHabitsForDay(); //fetches habit for the day
  for (let i = 0; i < habits.length; i++) {
    //console.log(habits[i][0]);
    //console.log(habits[i]);
    const newCard = document.createElement('habit-card');

    //Converts Frequency Number to a String
    let freqNum = habits[i][1].habitFrequency; 
    let freqStr = '';
    if (freqNum == 1) {
      freqStr = 'Daily';
    } else if (freqNum == 7) {
      freqStr = 'Weekly';
    } else {
      freqStr = 'Monthly';
    }

    //Sets Attributes on the Card
    newCard.setAttribute('card-name', habits[i][1].habitName);
    newCard.setAttribute('card-frequency', freqStr);
    newCard.setAttribute('card-description', habits[i][1].habitDescription);
    //newCard.setAttribute('card-time', habits[i][1].startDateTime);
    newCard.setAttribute('card-streak', habits[i][1].habitStreak);
    newCard.setAttribute('card-id', habits[i][0]);
    newCard.setAttribute(
      'card-completed',
      isHabitComplete(habits[i][0]) ? 'true' : 'false',
    );
    //console.log("new card " + isHabitComplete(habits[i][0]) );
    document.getElementById('card-container').appendChild(newCard);
  }
}
