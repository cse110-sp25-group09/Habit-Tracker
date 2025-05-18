
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
        .card {
          border-radius: 1rem;
          padding: 1rem;
          background:#b8bcfc;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
          width: 250px;
          margin: 1rem;
          font-family: sans-serif;
          border: blue;
          height: 150px;
          display: flex;
          text-align: justify;
          text-justify: inter-word;
          justify-content: center;
          align-items: center;  
          
          
        }
        #card_name{
            font-size: 2em;
            color: white;
            text-align: justify;
            text-justify: inter-word;
        }
      </style>
      <div class="container">
        <div class="card">
            <h1 id="card_name">${this.getAttribute("card-name") || "Untitled Habit"}</h1>
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
