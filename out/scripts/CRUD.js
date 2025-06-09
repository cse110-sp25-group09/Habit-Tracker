const DAYINMS = 86400000;
const uuidRegex =
  /^id[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
export function reviveHabit(key, value) {
  const numberFields = new Set(['habitFrequency', 'habitStreak']);
  let newValue;
  if (numberFields.has(key)) {
    newValue = Number(value);
  }
  if (key == 'startDateTime') {
    newValue = Date.parse(value);
    newValue = Date.toLocaleString(newValue); //Gets rid of nonstandard date formatting
  }
  if (isNaN(newValue)) {
    return value;
  }
  if (key == 'log') {
    value.forEach((element) => {
      newValue = Date.parse(element);
      if (isNaN(newValue)) {
        throw new Error('Invalid datestring in log');
      }
      newValue = Date.toLocaleString(newValue); //Gets rid of nonstandard date formatting
    });
  }
  return newValue;
}
/**
 * @param habitName string name of habit
 * @param habitDescription string description of the habit
 * @param habitFrequency integer number of days representing a frequency (ex. Daily = 1, Weekly = 7)
 * @param adapter defaults to localStorageAdapter, allows means to use other storage methods
 * @type {(habitName : String, habitDescription : String, startDateTime : String, adapter : Object) => String}
 * habitStreak, startDateTime, and logs will also be fields of this object, but are not parameters because they are initialized to default values
 * @return habitID, a unique ID string
 */
export function createHabit(
  habitName,
  habitDescription,
  habitFrequency,
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
    startDateTime: new Date().toLocaleString(),
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
  if (fields.length !== newValues.length) {
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
 * Deletes the given habit from localStorage
 * @param {String} habitID - the string ID of the habit being deleted
 * @param {Object} adapter defaults to localStorageAdapter, allows us to pass in other storage methods
 */
export function deleteHabit(habitID, adapter = localStorageAdapter) {
  adapter.del(habitID);
}

/**
 * @param adapter {Object} defaults to localStorageAdapter, allows us to pass in other storage methods
 * @return a list of habit objects or null if none are found
 */
export function getAllHabits(adapter = localStorageAdapter) {
  let habits = [];
  let keys = adapter.keys();
  let i = keys.length;
  if (i === 0) {
    return null;
  }
  let curHabitObject;
  while (i--) {
    if (!uuidRegex.test(keys[i])) {
      continue;
    }
    curHabitObject = adapter.get(keys[i]);

    curHabitObject = JSON.parse(curHabitObject, reviveHabit);

    habits.push([keys[i], curHabitObject]);
  }
  return habits;
}

/**
 * @param {String} habitID
 * @param {Object} adapter
 * @returns a habit object
 */
export function getHabitById(habitID, adapter = localStorageAdapter) {
  let habit = adapter.get(habitID);

  return JSON.parse(habit, reviveHabit);
}

/**
 *
 * @param {Object} habit a JSON object representing a habit(not a habit string !)
 * @returns streak, a number representing the integer number of consecutive days the habit has been completed
 */
function calculateStreak(habit) {
  let logs = habit.logs;

  if (logs.length < 2) {
    return logs.length;
  }
  let ms = 0;
  let msLogs = [];

  logs.forEach((element) => {
    ms = Date.parse(element);
    if (isNaN(ms)) {
      throw new Error(typeErrorTemplate(logs, typeof ms));
    }
    msLogs.push(ms);
  });

  msLogs = msLogs.sort();
  let streak = 0;
  let exp = Math.floor(Date.now() / DAYINMS);

  for (let i = -2; i >= -1 * logs.length; i--) {
    if (Math.floor(logs[i]) !== exp) {
      return streak;
    } else {
      streak++;
      exp -= habit.habitFrequency;
    }
  }
}

/**
 *
 * @param {String} habitID the string ID of the habit being tested
 * @param {Date} day a day object representing the day on which we're checking habit completeness
 * @returns {boolean} true if habit was completed, false otherwise
 */
export function isHabitComplete(habitID, day = new Date()) {
  const habit = getHabitById(habitID);
  if (habit.logs.length === 0) return false;

  day.setHours(0, 0, 0, 0);
  for (const log of habit.logs) {
    const completedDay = new Date(log);
    completedDay.setHours(0, 0, 0, 0);
    if (day.getTime() === completedDay.getTime()) return true;
  }
  return false;
}

/**
 *
 * @param {String} habitID - the string ID of the habit being logged
 * @returns {boolean} true if habit completion is logged successfully, false otherwise
 */
export function logHabitCompleted(habitID) {
  let habit = getHabitById(habitID);
  if (habit) {
    habit.logs.push(new Date().toLocaleString());
    habit.habitStreak = calculateStreak(habit);
    localStorage.setItem(habitID, JSON.stringify(habit));

    return true;
  }
  throw new Error('Invalid habit passed');
}

/**
 *
 * @param {String} habitID the string ID of the habit that removing last completion
 * @param {Object} adapter defaults to localStorageAdapter, allows means to use other storage methods
 * @returns Boolean true if habit completion is logged successfully, false otherwise
 */
export function removeHabitCompletion(habitID, adapter = localStorageAdapter) {
  let habit = getHabitById(habitID, adapter);
  if (habit) {
    habit.logs.pop();
    habit.habitStreak = calculateStreak(habit);
    adapter.set(habitID, JSON.stringify(habit)); // ← persist update
    return true;
  }
  throw new Error('Invalid habit passed');
}

/**
 * @param {Object} habit a JSON object representing a habit
 * @param {Date} day the day we are checking the habit is due for
 * @returns boolean true if the given habit needs to be completed on the specified day
 */
function isHabitForDay(habit, day) {
  // Normalize the specified day to midnight
  let currentDate = new Date(day);
  currentDate.setHours(0, 0, 0, 0);

  // Parse and normalize the start date to midnight
  let startDate = new Date(habit.startDateTime);
  startDate.setHours(0, 0, 0, 0);

  // Calculate days difference
  let daysDiff = Math.floor(
    (currentDate.getTime() - startDate.getTime()) / DAYINMS,
  );

  // For negative differences (day is before start date), habit is not due
  if (daysDiff < 0) {
    return false;
  }

  // Check if the specified day is a scheduled day for this habit
  return daysDiff % habit.habitFrequency === 0;
}

/**
 * @returns list of habit objects representing habits that need to be completed today
 */
export function getHabitsForDay(day = new Date()) {
  let habits = getAllHabits();
  if (!habits) {
    return [];
  }
  let day_habits = [];
  day.setHours(0, 0, 0, 0);

  for (let i = 0; i < habits.length; i++) {
    let [habitID, habitObj] = habits[i];
    if (isHabitForDay(habitObj, day) && !isHabitComplete(habitID, day)) {
      day_habits.push(habits[i]);
    }
  }

  return day_habits;
}

/**
 * @param date A date object representing the date for which we're checking habit completion
 * @returns {(number|number)[]} A number between 0 and 1 representing the proportion of habits completed of those assigned
 */
export function ratioOfCompleted(date = new Date()) {
  let habits_id_pairs = getHabitsForDay(date);
  let total_count = habits_id_pairs.length;
  let comp_count = 0;
  for (let i = 0; i < habits_id_pairs.length; i++) {
    if (isHabitComplete(habits_id_pairs[i][0], date)) {
      comp_count += 1;
    }
  }
  return [comp_count, total_count];
}
