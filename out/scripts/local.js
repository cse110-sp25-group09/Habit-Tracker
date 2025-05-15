
window.addEventListener("DOMContentLoaded", init);

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
	let habitForm = document.querySelector("form");
	habitForm.addEventListener("submit", (event) => {
		let formData = new FormData(habitForm);
		let habit = {};
		for (const key of formData){
			habit[key[0]] = key[1];
		}
		let habits = getHabits();
		if (habits){
			habits.push(habit)
		} else {
			habits = [habit];
		}
		saveHabits(habits);
	});
	let clearBtn = document.querySelector("button.danger");
	clearBtn.addEventListener("click", () => {
		localStorage.clear();
	});
	
}
