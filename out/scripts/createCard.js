const localStorageAdapter = {
    get: (key) => localStorage.getItem(key), 
    set: (key, value) => localStorage.setItem(key, value)
};


/**
 * @param habitName 
 * @param frequency 
 * @param day 
 * @param time 
 */
function createCard(habitName, hFrequency, hDay, hTime ){
    if (typeof habitName != "string"){return 1}
    let card = {
        name: habitName, 
        frequency: hFrequency, 
        day: hDay, 
        time: hTime
    }; 
    




}