window.addEventListener('DOMContentLoaded', init);

const DAYINMS = 86400000;
function init() {
  if (JSON.parse(localStorage.getItem('habits')).length == 0) {
    localStorage.setItem('habits', JSON.stringify([]));
  }
}

function saveHabits(habits) {
  localStorage.setItem('habits', JSON.stringify(habits));
}
function createHabit(name, description, frequency, notif) {
  let id = crypto.randomUUID();
  habit = {
    id: id,
    name: name,
    description: description,
    frequency: frequency,
    notif: notif,
    creat_date: Math.floor(Date.now() / DAYINMS),
    streak: 0,
    logs: [],
  };
  let habits = getAllHabits();
  habits.push(habit);
  saveHabits(habits);
  return id;
}

function getAllHabits() {
  return JSON.parse(localStorage.getItem('habits'));
}

function getHabitbyID(id) {
  let habits = getAllHabits();
  for (let i = 0; i < habits.length; i++) {
    if (habits[i].id == id) {
      return habits[i];
    }
  }
  return null;
}

function updateHabit(id, new_habit) {
  let habits = getAllHabits();
  for (let i = 0; i < habits.length; i++) {
    if (habits[i].id == id) {
      habits[i] = new_habit;
      break;
    }
  }
  saveHabits(habits);
}

function deleteHabit(id) {
  let habits = getAllHabits();
  for (let i = 0; i < habits.length; i++) {
    if (habits[i].id == id) {
      habits.splice(i, 1);
    }
  }
  saveHabits(habits);
}

function calculateStreak(habit) {
  let logs = habit.logs.sort();
  if (logs.length < 2) {
    return logs.length;
  }
  let streak = 0;
  if (habit.frequency == 'daily') {
    let exp = Math.floor(Date.now() / DAYINMS);
    for (let i = -2; i >= -1 * logs.length; i--) {
      if (Math.floor(logs[i]) != exp) {
        return streak;
      } else {
        streak++;
        exp--;
      }
    }
  } else if (habit.frequency == 'weekly') {
    let exp = Math.floor(Date.now() / DAYINMS);
    for (let i = -2; i >= -1 * logs.length; i--) {
      if (Math.floor(logs[i]) > exp) {
        return streak;
      } else {
        streak++;
        exp -= 7;
      }
    }
  } else {
    let exp = Math.floor(Date.now() / DAYINMS);
    for (let i = -2; i >= -1 * logs.length; i--) {
      if (Math.floor(logs[i] / DAYINMS) > exp) {
        return streak;
      } else {
        streak++;
        exp -= 30;
      }
    }
  }
}

function logHabitCompleted(id, time = Date().now()) {
  let habits = getAllHabits();
  let idx = -1;
  for (let i = 0; i < habits.length; i++) {
    if (habits[i].id == id) {
      idx = i;
    }
  }
  if (idx < 0) {
    return false;
  }
  habits[idx].logs.push(time);
  habits[idx].streak = calculateStreak(habits[idx]);
  saveHabits(habits);
  return true;
}

function isHabitForToday(habit) {
  let date = Math.floor(Date.now() / DAYINMS);
  if (habit.logs[-1] == date) {
    return false;
  }
  if (habit.frequency == 'weekly') {
    if ((date - habit.creat_date) % 7 != 0) {
      return false;
    }
  }
  if (habit.frequency == 'monthly') {
    if ((date - habit.creat_date) % 30 != 0) {
      return false;
    }
  }
  return true;
}

function getHabitsForToday() {
  let habits = getAllHabits();
  let today_habits = [];
  for (let i = 0; i < habits.length; i++) {
    if (isHabitForToday(habits[i])) {
      today_habits.push(habits[i]);
    }
  }
  return today_habits;
}

function habitsCompletedOnDay(date) {
  let habits = getAllHabits();
  let daysHabits = [];
  for (let i = 0; i < habits.length; i++) {
    if (habits[i].logs.includes(date)) {
      daysHabits.push(habits[i]);
    }
  }
  return daysHabits;
}
