
const DAYINMS = 86400000;
export const localStorageAdapter = {
  get: (key) => localStorage.getItem(key),
  set: (key, value) => localStorage.setItem(key, value),
  del: (key) => localStorage.removeItem(key),
  len: () => localStorage.length,
  keys: () => Object.keys(localStorage),
};

function typeErrorTemplate(stringParam, type) {
  return `${type} is the incorrect type for ${stringParam})`;
}

/**
 * @param key of a JSON object 
 * @param value of a JSON object, corresponding to the passed key 
 * @return a valid habit object 
 */
export function reviveHabit(key, value){
  const stringFields = new Set('habitName', 'habitDescription');
  const numberFields = new Set('habitFrequency', 'habitStreak');
  let newValue; 
  if (key in numberFields){
    newValue = Number(value); 
   
  }
  if (key == "startDateTime"){
    newValue = Date.parse(key); 
  } 
  if (newValue == NaN){
    throw new Error ("Invalid habit object"); 
  }
  if (key == "log"){
    value.forEach((element)=>{
      if (Date.parse(element) == NaN){
        throw new Error ("Invalid datestring in log"); 
      }
    }
    ); 
  }

}
/**
 * @param habitName string name of habit
 * @param habitDescription string description of the habit
 * @param habitFrequency integer number of days representing a frequency (ex. Daily = 1, Weekly = 7)
 * @param startDateTime date string representing the first occurrence of habit
 * @param adapter defaults to localStorageAdapter, allows means to use other storage methods
 * @type {(habitName : String, habitDescription : String, startDateTime : String, adapter : Object) => String}
 * habitStreak & logs will also be fields of this object, but are not parameters because they are initialized to default values
 * @return habitID, a unique ID string
 */
export function createHabit(
  habitName,
  habitDescription,
  habitFrequency,
  startDateTime,
  adapter = localStorageAdapter,
) {
  if (typeof habitName != 'string') {
    throw new Error(typeErrorTemplate(habitName, typeof habitName));
  }

  if (typeof habitDescription != 'string') {
    throw new Error(
      typeErrorTemplate(habitDescription, typeof habitDescription),
    );
  }
  /*
   Choosing to represent frequencies as integer day values to compromise between
   * readability & compatibility with JS Date() objects, which operate in ms
   * */
  if (typeof habitFrequency != 'number') {
    throw new Error(typeErrorTemplate(habitFrequency, typeof habitFrequency));
  }
  /*check that startDateTime is a valid dateString (could be in standard or UTC string format, just need to be acceptable to Date.parse())
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
    Requires regex to do properly: https://stackoverflow.com/questions/7445328/check-if-a-string-is-a-date-value
    */

  let habit = {
    habitName: habitName,
    habitDescription: habitDescription,
    habitFrequency: habitFrequency,
    startDateTime: startDateTime,
    habitStreak: 0,
    logs: [],
  };

  let habitID = 'id' + self.crypto.randomUUID();
  adapter.set(habitID, JSON.stringify(habit));
  return habitID;
}

/**
 * @param {String} habitID the string id of the habit being read
 * @param {Object} adapter an object representing our database (currenly only use localStorageAdapter)
 */
export function readHabit(habitID, adapter = localStorageAdapter) {
  return adapter.get(habitID);
}

/**
 * @param {String} habitID string ID of habit (ex
 * @param {list} fields list of fields to update in the given habit object
 * @param {list} newValues list of new values for fields (passed in the same order).
 * New values should follow the type requirements of createhabit()
 */
export function updateHabit(habitID, fields, newValues) {
  //check that fields and newValues are the same length
  if (fields.length != newValues.length) {
    throw new Error('fields and newValues must have the same length');
  }
  const stringFields = new Set('habitName', 'habitDescription');
  const numberFields = new Set('habitFrequency', 'habitStreak');
  let habitToUpdate = adapter.get(habitID);
  habitToUpdate = JSON.parse(habitToUpdate);
  for (let i = 0; i < fields.length; i++) {
    if (!Object.hasOwn(habitToUpdate, fields[i])) {
      throw new Error(`${fields[i]} is not a valid habit field`);
    }
    if (fields[i] in stringFields) {
      habitToUpdate.fields[i] = newValues[i];
    } else if (fields[i] in numberFields) {
      if (!newValues[i]) {
        //will reject null, false, 0 but not "0", dependent on all values being parsed as strings
        throw new Error(`${fields[i]} is not a valid number field`);
      }
      habitToUpdate.fields[i] = newValues[i];
    }
    //checking for date strings, rejecting everything else (requires regex)
    else {
    }
    habitToUpdate.fields[i] = newValues[i];
  }
}

/**
 *
 * @param {String} habitID - the string ID of the habit being deleted
 * @param {Object} adapter defaults to localStorageAdapter, allows us to pass in other storage methods
 */
export function deleteHabit(cardID, adapter = localStorageAdapter) {
  return adapter.del(id);
}

/**
 * @param adapter {Object} defaults to localStorageAdapter, allows us to pass in other storage methods
 * @return a list of habit objects or null if none are found
 */
export function getAllHabits(adapter = localStorageAdapter){
  let habits = []; 
  let keys = adapter.keys(); 
  let i = keys.length; 
  while (i--){
    habits.push(adapter.get(keys[i])); 
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

/**
 *
 * @param {Object} habit a JSON object representing a habit(not a habit string !)
 * @returns
 */
function calculateStreak(habit) {
  let logs = habit.logs;

  if (logs.length < 2) {
    return logs.length;
  }
  let ms = 0;
  let msLogs = [];

  //Date.parse() is very format permissive, this needs to be tested thoroughly
  logs.forEach((element) => {
    ms = Date.parse(element);
    if (ms == NaN) {
      throw new Error(typeErrorTemplate(logs, typeof ms));
    }
    msLogs.push(ms);
  });

  msLogs = msLogs.sort();
  let streak = 0;
  let exp = Math.floor(Date.now() / DAYINMS);

  for (let i = -2; i >= -1 * logs.length; i--) {
    if (Math.floor(logs[i]) != exp) {
      return streak;
    } else {
      streak++;
      exp -= habit.frequency;
    }
  }
}

/**
 * 
 * @param {String} habitID - the string ID of the habit being deleted
 * @param {Object} adapter defaults to localStorageAdapter, allows us to pass in other storage methods
 * @returns {boolean} true if habit completion is logged successfully, false otherwise 
 */
function logHabitCompleted(habitID, adapter = localStorageAdapter) {
  let habit = getHabitById(habitID); 
  if (habit){
     habit.streak = calculateStreak(habits[idx]);
    let currentDateTime = new Date(); 
    habit.log.push(currentDateTime.toDateString()); 
    return true; 
  } 
  return false; // what is the benefit of returning boolean instead of throwing an error in a void function in this context ? 
}

/**
 * 
 * @param {Object} habit a JSON object representing a habit(not a habit string !)
 * @returns 
 */
function isHabitForToday(habit) {
  let currentDate = new Date (); 
  let msStartDate = Date.parse (habit.startDateTime); 
  if (habit.logs[-1] == currentDate.toDateString()) {
    return false;
  }
  
  if ((currentDate - msStartDate) % (habit.frequency) != 0) {
    return false;
  }
  return true;
}

/**
 * @returns list of habit objects representing habits that need to be completed today 
 */
function getHabitsForToday() {
  let habits = getAllHabits();
  let today_habits = [];
  let today = new Date() 
  today.setHours(0, 0, 0, 0); 
  let curr_date = habit.startDateTime; 
  for (let i = 0; i < habits.length; i++) {
    if (isHabitForToday(habits[i])) {
      curr_date = Date.parse(curr_date); 
      if (curr_date == NaN){
        throw new Error ("Invalid type for habit.startDateTime"); 
      }
      curr_date.setHours(0,0,0,0); 
      today_habits.push((curr_date == today, habits[i]));
    }
  }
  return habits 
} 

/**
 * 
 * @param {String} id 
 * @param {Object} adapter 
 * @returns 
 */
export function getHabitById(id, adapter = localStroageAdapter){
  return adapter.get(id); 
}




