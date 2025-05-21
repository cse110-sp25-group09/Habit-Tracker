global.self = global; //remove this code in the browser, test in browser 


const localStorageAdapter = {
    get: (key) => localStorage.getItem(key),
    set: (key, value) => localStorage.setItem(key, value )
};


function typeErrorTemplate (stringParam, type){
  return `${type} is the incorrect type for ${stringParam})`
}

/**
 * @param habitName string name of habit
 * @param frequency integer number of hours representing a frequency (ex. Daily = 24, Weekly = 168)
 * @param startDateTime date string representing the first occurrence of habit
 * #param description 
 */
function createCard(habitName, habitFrequency, startDateTime, adapter){
   if (typeof habitName != "string"){
     throw new Error (typeErrorTemplate(habitName, typeof(habitName)));
   }

   /*
   Choosing to represent frequencies as integer hour values to compromise between
   * readability & compatibility with JS Date() objects, which operate in ms
   * ex: Daily = 24, Weekly = 168, 30 days = 720
   * */
   if(typeof habitFrequency != "number"){
     throw new Error (typeErrorTemplate(habitFrequency, typeof(habitFrequency)));
   }

    let card = {
        name: habitName, 
        frequency: habitFrequency, 
        startDate: startDateTime,
    };

    let cardID = "id" + self.crypto.randomUUID();
    adapter.set(cardID, JSON.stringify(card));
}

#createCard ("Drink Water", 24, "Sun May 18 2025 13:04:28 GMT-0700 (Pacific Daylight Time)", localStorageAdapter)