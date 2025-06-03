//below is the code for the menu bar
// Wait for the DOM to load before referencing elements
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

//shadow card code below
class HabitCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
    <style>
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
        background: #b8bcfc;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
        color: white;
      }
 
      .flip-card-back {
        background-color: rgb(34, 12, 95);
        color: white;
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
        line-height: 1.4;
        max-width: 90%;
        word-wrap: break-word;
        word-break: break-word;
      }
      .streak_number{
        color: orange;
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
        </div>
        <div class="flip-card-back">

          <p id="card_description">${this.getAttribute('card-description') || 'None'}</p>
          <p id="card_frequency">${this.getAttribute('card-frequency') || 'None'}</p>
          <p id="card_time">${this.getAttribute('card-time') || 'None'}</p>
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

    // yesBtn.addEventListener('click', () => {

    //   this.remove(); // removes the card from the DOM

    // });
    yesBtn?.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent card flip

      const idElement = this.shadowRoot.querySelector('#card_id');
      if (idElement) {
        const cardId = idElement.textContent.trim();
        console.log(cardId);
        deleteHabit(cardId);
        this.remove(); // This removes the custom element from the DOM
      }
    });

    [deleteBtn, yesBtn, noBtn].forEach((btn) => {
      btn?.addEventListener('click', (e) => e.stopPropagation());
    });

    flipCard.addEventListener('click', () => {
      flipInner.classList.toggle('flipped');
    });
  }

  static get observedAttributes() {
    return ['card-name'];
  }

  connectedCallback() {
    const titleEl = this.shadowRoot.getElementById('card_name');
    const freqEl = this.shadowRoot.getElementById('card_frequency');
    const descrEl = this.shadowRoot.getElementById('card_description');
    const timeEl = this.shadowRoot.getElementById('card_time');
    const streakEl = this.shadowRoot.getElementById('card_streak');
    const idEl = this.shadowRoot.getElementById('card_id');

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
      streakEl.innerHTML = `Current Streak: <span class="streak_number"> ${this.getAttribute('card-streak') || 'None'} </span>`;
    }
    if (idEl) {
      idEl.innerHTML = `Current ID: ${this.getAttribute('card-id') || 'None'} `;
    }
  }
}

customElements.define('habit-card', HabitCard);

// Show form when "+" is clicked
document.getElementById('create-button').addEventListener('click', () => {
  document.getElementById('habit-form').style.display = 'block';
});

// On form submit
document.getElementById('submit-habit').addEventListener('click', () => {
  const name = document.getElementById('habit-name').value.trim();
  const frequency = document.getElementById('habit-frequency').value;
  const descr = document.getElementById('habitDescription').value;
  const timeStr = document.getElementById('habit-time').value;

  let streak = 0;

  if (name !== '') {
    // const newCard = document.createElement('habit-card');
    // newCard.setAttribute('card-name', name);
    // newCard.setAttribute('card-frequency', frequency);
    // newCard.setAttribute('card-description', descr);
    // newCard.setAttribute('card-time', timeStr);
    // newCard.setAttribute('card-streak', streak);

    // document.getElementById('card-container').appendChild(newCard);
    createHabit(name, descr, frequency, timeStr);
    populateCards();
  }

  // Reset and hide form
  document.getElementById('habit-name').value = '';
  document.getElementById('habitDescription').value = '';
  document.getElementById('habit-frequency').value = 'Daily';
  document.getElementById('habit-time').value = '';

  document.getElementById('habit-form').style.display = 'none';
});

function populateCards() {
  document.getElementById('card-container').innerHTML = '';
  let habits = getHabitsForToday();
  for (let i = 0; i < habits.length; i++) {
    //console.log(habits[i][0]);
    const newCard = document.createElement('habit-card');
    newCard.setAttribute('card-name', habits[i].name);
    newCard.setAttribute('card-frequency', habits[i].frequency);
    newCard.setAttribute('card-description', habits[i].description);
    newCard.setAttribute('card-time', habits[i].notif);
    newCard.setAttribute('card-streak', habits[i].streak);
    newCard.setAttribute('card-id', habits[i].id);
    document.getElementById('card-container').appendChild(newCard);
  }
}

// mark as complete / change color / add check
//delete = delete id and populate
