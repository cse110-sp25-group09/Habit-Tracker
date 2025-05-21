
//below is the code for the menu bar

const home_select = document.getElementById("home-selection");
const calendar_select = document.getElementById("calendar-selection");
const settings_select = document.getElementById("settings-selection");

home_select.addEventListener("click",() =>{
    window.location.href = "home-page.html"
});
calendar_select.addEventListener("click",() =>{
    window.location.href = "monthly-calendar.html"
});
settings_select.addEventListener("click",() =>{
    window.location.href = "settings.html"
});

//shadow card code below
class HabitCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

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
  
      :host(:hover) .flip-card-inner {
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
        font-family: sans-serif;
        box-sizing: border-box;
        backface-visibility: hidden;
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
    </style>
  
    <div class="flip-card">
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <h1 id="card_name">${this.getAttribute("card-name") || "Untitled Habit"}</h1>
        </div>
        <div class="flip-card-back">
          <h1>Testing</h1> 
        </div>
      </div>
    </div>
  `;
  }
  static get observedAttributes() {
    return ["card-name"];
  }
  
  connectedCallback() {
    const titleEl = this.shadowRoot.getElementById("card_name");
    if (titleEl) {
        titleEl.textContent = this.getAttribute("card-name") || "Untitled Habit";
    }
    }
}

customElements.define("habit-card", HabitCard);
 

// Show form when "+" is clicked
document.getElementById("create-button").addEventListener("click", () => {
  document.getElementById("habit-form").style.display = "block";
});

// On form submit
document.getElementById("submit-habit").addEventListener("click", () => {
  const name = document.getElementById("habit-name").value.trim();

  if (name !== "") {
    const newCard = document.createElement("habit-card");
    newCard.setAttribute("card-name", name);

    document.getElementById("card-container").appendChild(newCard);
  }

  // Reset and hide form
  document.getElementById("habit-name").value = "";
  document.getElementById("habit-form").style.display = "none";
});
