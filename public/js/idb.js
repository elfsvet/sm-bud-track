// create indexedDB need to refresh 18.4 lesson.
// create variable to hold db connection
let db;

// establish a connection to IndexDB database called budget_tracker and set it to version 1
const request = indexedDB.open('budget_tracker', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function (e) {
    //save a reference to the db
    const db = e.target.result;
    // create an object store (table) called "new_budget", set it to have an auto incrementing primary key of sorts
    db.createObjectStore('new_budget', { autoIncrement: true });
};

// upon a seccessful 
request.onsuccess = function (e) {
    // when db is successfully created with its object store (from onupgradeneeded event above) or simply establish a connection, save reference to db in global variable
    db = e.target.result;

    // check if app is online, if yes run uploadBudget() function to send all local db data to api
    if (navigator.online) {
        // !dont forget
        // we haven't created this yet, but we will soon, so let's comment it out for now
        // uploadBudget();
    }
};
// if error appear
request.onerror = function (e) {
    // log error here
    console.log(e.target.errorCode);
};

// this function will be executed if we attempt to subnit a new budget and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new_budget'], 'readWrite');

    // access the object store for 'new_budget'
    const budgetObjectStore = transaction.objectStore('new_budget');

    // add record to your store with add method
    budgetObjectStore.add(record);
};

// we open a new transaction with the database to read and write the data.
function uploadBudget() {
    // open a transaction on your db
    const transaction = db.transaction(['new_budget'], 'readWrite');

    // access your object store
    const budgetObjectStore = transaction.objectStore('new_budget');

    // get all records from the store and set to a variable
    const getAll = budgetObjectStore.getAll();

    // more to come...
    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function () {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
            // ! check this api could be /api/transactions/bulk
            fetch('/api/budget', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // open one more transaction
                    const transaction = db.transaction(['new_budget'], 'readWrite');

                    // access the new_budget object store
                    budgetObjectStore.clear();

                    alert('All saved budget has been submitted!');
                })
                // if error pringt the error
                .catch(err => console.log(err));
        }
    };
};

// listen for app comming back online
window.addEventListener('online', uploadBudget);

