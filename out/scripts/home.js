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

        </div>
      </div>
    </div>
  `;
    const flipCard = shadow.querySelector('.flip-card');
    const flipInner = shadow.querySelector('.flip-card-inner');

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
    const newCard = document.createElement('habit-card');
    newCard.setAttribute('card-name', name);
    newCard.setAttribute('card-frequency', frequency);
    newCard.setAttribute('card-description', descr);
    newCard.setAttribute('card-time', timeStr);
    newCard.setAttribute('card-streak', streak);

    document.getElementById('card-container').appendChild(newCard);
  }

  // Reset and hide form
  document.getElementById('habit-name').value = '';
  document.getElementById('habitDescription').value = '';
  document.getElementById('habit-frequency').value = 'Daily';
  document.getElementById('habit-time').value = '';

  document.getElementById('habit-form').style.display = 'none';
});
