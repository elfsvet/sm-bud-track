// Two global constants
const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'v1';
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = `data-cache-${VERSION}`;
// use relative paths to work in both development and production
const FILES_TO_CACHE = [
    './',
    './css/styles.css',
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-152x152.png',
    './icons/icon-192x192.png',
    './icons/icon-384x384.png',
    './icons/icon-512x512.png',
    './js/idb.js',
    './js/index.js',
    './index.html',
    './manifest.json',
];

// Install the service worker
// YOUR CODE HERE
// self because window is not created yet when service worker is running. listener on the service worker
self.addEventListener('install', function (e) {
    // wait until the work is complete before terminating the service worker.
    // don't go further until install is finished
    e.waitUntil(
        // find cache by name and add every file in the file to cache array to the cache.
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
});

// Activate the service worker and remove old data from the cache
// YOUR CODE HERE
self.addEventListener('activate', function (e) {
    e.waitUntil(
        // keys returns an array of all cache names
        caches.keys().then(function (keyList) {
            let cacheKeeplist = keyList.filter(function (key) {
                // return exactly version we needed
                return key.indexOf(APP_PREFIX);
            })
            // add the current cache to the keeplist in the activate event listener
            cacheKeeplist.push(CACHE_NAME);
            //    return a promise that resolves once all old versions of the cache have been deleted
            return Promise.all(keyList.map(function (key, i) {
                if (cacheKeeplist.indexOf(key) === -1) {
                    console.log('deleting cache : ' + keyList[i]);
                    return caches.delete(keyList[i]);
                }
            }));
        })
    );
});


// Intercept fetch requests
// to make it work offline
// YOUR CODE HERE
// listen for the fetch event log the url of the requested resource, and begin to define how we will respond to the request.
self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    // method on the event object to intercept the fetch request.
    e.respondWith(
        // match() to determine if the resource already exists in cache.
        caches.match(e.request).then(function (request) {
            if (request) {
                console.log('responding with cache : ' + e.request.url)
                //   return cache resource
                return request
            }
            // if resource is not in cache. we allow the resource to be retrieved from online network as usual
            else {
                console.log('file is not cached, fetching : ' + e.request.url)
                return fetch(e.request)
            }
            // You can omit if/else for console.log & put one line below like this too.
            // return request || fetch(e.request)
        })

    )
});



// fetch was in miami bootcamp activity #5 in server-worker.js
self.addEventListener('fetch', function (e) {
    // if request event has /api/ in url
    if (e.request.url.includes('/api/')) {
        e.respondWith(
            caches
            .open(DATA_CACHE_NAME)
            .then(cache => {
                return fetch(e.request)
                .then(response => {
                    // If the response was good, clone it and store it in the cache.
                    if (response.status === 200) {
                        cache.put(e.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    // Network request failed, try to get it from the cache.
                    return cache.match(e.request);
                });
            })
                .catch(err => console.log(err))
        );
        return;
    }
    // intercept the respond 
    e.respondWith(
        fetch(e.request).catch(function () {
            // if cache has the request return it
            return caches.match(e.request).then(function (response) {
                if (response) {
                    return response;
                    // get accept format to be text/html
                } else if (e.request.headers.get('accept').includes('text/html')) {
                    // return the cached home page for all requests for html pages
                    return caches.match('/');
                }
            });
        })
    );
});
//
