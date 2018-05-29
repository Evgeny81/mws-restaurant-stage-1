const currentCacheName = 'static-v1';

const allUrls = [
    '/',
    '/index.html',
    '/restaurant.html',
    '/dist/js/main.js',
    '/dist/js/restaurant.js',
    '/dist/css/main.css',
    '/css/restaurant_info.css',
    '/manifest.json',
    '/dist/img/',
    'sw.js'
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(currentCacheName).then( cache => {
        return cache.addAll(allUrls);
    }).catch(err => {
        console.log(err);
    }));
});

self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(cacheNames => {
        return Promise.all(
            cacheNames.filter( cacheName => {
                return cacheName.startsWith('static-') && cacheName !== currentCacheName;
            }).map( cacheName => {
                return caches.delete(cacheName);
            })
        )
    }));
});

self.addEventListener('fetch', event => {
    event.respondWith(caches.open(currentCacheName).then(cache => {
        return cache.match(event.request).then(res => {
            return res || fetch(event.request).then(res => {
                cache.put(event.request, res.clone());
                return res;
            });
        });
    }));
});