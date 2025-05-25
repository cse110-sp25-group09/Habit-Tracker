//global.self = global; //remove this code in the browser, test in browser 

export const localStorageAdapter = {
    get: (key) => localStorage.getItem(key),
    set: (key, value) => localStorage.setItem(key, value )
};


function typeErrorTemplate (stringParam, type){
  return `${type} is the incorrect type for ${stringParam})`
}

/**
 * 
 * @param {number} numHours 
 * @return (number) numMS 
 */
function hoursToMS(numHours){
  return 60 * 60 * 1000 * numHours; 
}

/**
 * @param habitName string name of habit
 * @param habitDescription string description of the habit
 * @param habitFrequency integer number of hours representing a frequency (ex. Daily = 24, Weekly = 168)
 * @param startDateTime date string representing the first occurrence of habit
 * @param adapter only possible value right now is localStorageAdapter. This parameter is intended to allow easy switches to a database later on.
 * @type {(habitName : string, habitDescription : string, startDateTime : string, adapter : object) => string}
 * habitStreak will also be a card field, but is not a parameter of this function because it is always initialized to zero
 * @return cardID, a unique ID string
 */
export function createCard(habitName, habitDescription, habitFrequency, startDateTime,  adapter){
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


    let card = {
        habitName: habitName,
        habitDescription: habitDescription,
        habitFrequency: habitFrequency,
        startDateTime: startDateTime,
        streak: 0
    };

    let cardID = "id" + self.crypto.randomUUID();
    adapter.set(cardID, JSON.stringify(card));
    return cardID;
}

