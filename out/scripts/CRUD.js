export const localStorageAdapter = {
    get: (key) => localStorage.getItem(key),
    set: (key, value) => localStorage.setItem(key, value ),
    del: (key) => localStorage.removeItem(key), 
    len: ()=> localStorage.length,
    keys: ()=> Object.keys(localStorage), 
};


function typeErrorTemplate (stringParam, type){
  return `${type} is the incorrect type for ${stringParam})`
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
export function createHabit(habitName, habitDescription, habitFrequency, startDateTime,  adapter = localStorageAdapter){
   if (typeof habitName != "string"){
     throw new Error (typeErrorTemplate(habitName, typeof(habitName)));
   }

  if (typeof habitDescription != "string"){
    throw new Error (typeErrorTemplate(habitDescription, typeof(habitDescription)));
  }
   /*
   Choosing to represent frequencies as integer hour values to compromise between
   * readability & compatibility with JS Date() objects, which operate in ms
   * ex: Daily = 24, Weekly = 168, 30 days = 720
   * make names in local storage match parameters
   * */
   if(typeof habitFrequency != "number"){
     throw new Error (typeErrorTemplate(habitFrequency, typeof(habitFrequency)));
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
        logs: []
    };

    let habitID = "id" + self.crypto.randomUUID();
    adapter.set(habitID, JSON.stringify(habit));
    return habitID;
}

/**
 * @param {String} habitID the string id of the habit being read
 * @param {Object} adapter an object representing our database (currenly only use localStorageAdapter)
 */
export function readHabit(habitID, adapter = localStorageAdapter){
  return adapter.get(habitID);
}

/**
 * @param {String} habitID string ID of habit (ex
 * @param {list} fields list of fields to update in the given habit object
 * @param {list} newValues list of new values for fields (passed in the same order).
 * New values should follow the type requirements of createhabit()
 */
export function updateHabit(habitID, fields, newValues){
  //check that fields and newValues are the same length
  if(fields.length != newValues.length){
    throw new Error ('fields and newValues must have the same length');
  }
  const stringFields = new Set ("habitName", "habitDescription" );
  const numberFields = new Set ("habitFrequency", "habitStreak");
  let habitToUpdate = adapter.get(habitID);
  habitToUpdate = JSON.parse(habitToUpdate);
  for (let i = 0; i < fields.length; i++){
      if (!Object.hasOwn(habitToUpdate, fields[i])) {
        throw new Error (`${fields[i]} is not a valid habit field`);
      }
      if (fields[i] in stringFields){
        habitToUpdate.fields[i] = newValues[i];
      }
      else if (fields[i] in numberFields){
        if (!newValues[i]){ //will reject null, false, 0 but not "0", dependent on all values being parsed as strings
          throw new Error (`${fields[i]} is not a valid number field`);
        }
        habitToUpdate.fields[i] =  newValues[i];
      }
      //checking for date strings, rejecting everything else (requires regex)
      else{

      }
      habitToUpdate.fields[i] = newValues[i]; 
    }
}

/**
 * 
 * @param {String} cardID, the string ID of the habit being deleted
 * @param {Object} adapter defaults to localStorageAdapter, allows means to use other storage methods 
 */
export function deleteHabit(cardID, adapter = localStorageAdapter) {
  return adapter.del(id); 
} 

/**
 * @return a list of habit objects 
 */
export function getAllHabits(adapter = localStorageAdapter){
  let habits = []; 
  let keys = adapter.keys(); 
  let i = keys.length; 
  while (i--){
    habits.push(adapter.get(keys[i])); 
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




