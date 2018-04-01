let staticCacheName = 'static-v1';

self.addEventListener('install', (event) => {
    console.log('installed');
    event.waitUntil(
        caches.open(staticCacheName).then((cache) =>
            cache.addAll([ // build cache, add initial resources
                '/',
                'index.html',
                'restaurant.html',
                'js/main.js',
                'js/restaurant_info.js',
                'js/dbhelper.js',
                'css/styles.css',
                '/data/restaurants.json',
                'img/',
            ])
        ).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => { // update cache, deleting data from cache
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== staticCacheName) {
                        return caches.delete(cacheName)
                    }
                })
            )
        )
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => { // respond with cache, retrieve from cache, network or database
    event.respondWith(
        caches.open(staticCacheName).then(cache => {
            return cache.match(event.request).then(response => {
                return response || fetch(event.request)
                        .then(response => {
                            cache.put(event.request, response.clone())
                        })
            })
        })
    )
});