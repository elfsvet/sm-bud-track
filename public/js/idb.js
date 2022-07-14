// create indexedDB need to refresh 18.4 lesson.
// create variable to hold db connection
let db;

// establish a connection to IndexDB database called budget_tracker and set it to version 1
const request = indexedDB.open('budget_tracker',1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function (e) {
    //save a reference to the db
    const db = e.target.result;
    // create an object store (table) called "new_budget", set it to have an auto incrementing primary key of sorts
    db.createObjectStore('new_budget', {autoIncrement: true});
};

// upon a seccessful 
request.onsuccess = function(e){
    // when db is successfully created with its object store (from onupgradeneeded event above) or simply establish a connection, save reference to db in global variable
    db = e.target.result;

    // check if app is online, if yes run uploadBudget() function to send all local db data to api
    if(navigator.online){
        // !dont forget
        // we haven't created this yet, but we will soon, so let's comment it out for now
        // uploadBudget();
    }
};

