
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
