import idb from 'idb';

const idbName = 'restaurants';

/**
 * Common database helper functions.
 */
export default class DBHelper {

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    static DATABASE_URL(url) {
        const port = 1337; // Change this to your server port
        return `http://localhost:${port}/${url}/`;
    }

    /**
    * Open idb
    */

    static idb() {
        return idb.open('app', 2, (upgradeDb) => {
            switch (upgradeDb.oldVersion) {
                case 0: upgradeDb.createObjectStore(idbName, {keyPath: 'id'});
                case 1:
                    const reviews = upgradeDb.createObjectStore('reviews', {keyPath: 'id'});
                    reviews.createIndex('restaurant', 'restaurant_id');
            }
        });
    }

    /**
     * Save idb
     */

    static saveIdb(data) {
        return DBHelper.idb().then(db => {
            if (!db) return;

            const tx = db.transaction(idbName, 'readwrite');
            const store = tx.objectStore(idbName);
            data.forEach(restaurant => {
                store.put(restaurant);
            });
            return tx.complete;
        })
    }

    /**
     * Get idb
     */

    static getIdb() {
        return DBHelper.idb().then(db => {
            if (!db) return;
            const store = db.transaction(idbName).objectStore(idbName);
            return store.getAll();
        })
    }

    /**
     * Fetch restaurants to idb
     */

    static fetchData() {
        return fetch(DBHelper.DATABASE_URL('restaurants'))
            .then(response => response.json())
            .then(restaurants => {
                DBHelper.saveIdb(restaurants);
                return restaurants;
            })
    }

    /**
     * Fetch all restaurants.
     */
    static fetchRestaurants(callback) {
        return DBHelper.getIdb().then(restaurants => {
            if (restaurants.length) {
                return Promise.resolve(restaurants);
            } else {
                return DBHelper.fetchData();
            }
        }).then(restaurants => {
            callback(null, restaurants);
        }).catch(error => {
            callback(error, null);
        })
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id);
                if (restaurant) { // Got the restaurant
                    callback(null, restaurant);
                } else { // Restaurant does not exist in the database
                    callback('Restaurant does not exist', null);
                }
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants;
                if (cuisine != 'all') { // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') { // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                callback(null, results);
            }
        });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
                // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
                // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
                callback(null, uniqueCuisines);
            }
        });
    }

    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(photo='10', dir = '/', suffix = '') {
        return (`/dist/img${dir}${photo}${suffix}.jpg`);
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        const marker = new google.maps.Marker({
                position: restaurant.latlng,
                title: restaurant.name,
                url: DBHelper.urlForRestaurant(restaurant),
                map: map,
                animation: google.maps.Animation.DROP
            }
        );
        return marker;
    }

    /**
     * Handling restaurant marking as a favorite.
     */

    static handleFavoriteRestaurant (restaurantId, isFavorite) {
        fetch(`http://localhost:1337/restaurants/${restaurantId}/?is_favorite=${!isFavorite}`, {
            method: 'PUT'
        })
            .then(() => {
                this.idb()
                    .then(db => {
                        const tx = db.transaction(idbName, 'readwrite');
                        const restaurantsStore = tx.objectStore(idbName);
                        restaurantsStore.get(restaurantId)
                            .then(restaurant => {
                                restaurant.is_favorite = !isFavorite;
                                restaurantsStore.put(restaurant);
                            })
                    })
            })
            .catch(err => {throw new Error(err.toString())});
    };

    /**
     * Fetching reviews
     */

    static fetchReviews(restaurantId) {
        return fetch(`${DBHelper.DATABASE_URL('reviews')}?restaurant_id=${restaurantId}`)
            .then(response => response.json())
            .then(reviews => {
                this.idb()
                    .then(db => {
                        if (!db) return;

                        const tx = db.transaction('reviews', 'readwrite');
                        const store = tx.objectStore('reviews');
                        if (Array.isArray(reviews)) {
                            reviews.forEach(review => {
                                store.put(review);
                            })
                        } else {
                            store.put(reviews);
                        }
                    });
                return Promise.resolve(reviews);
            })
            .catch(error => {
                return DBHelper.getStoredObjectById('reviews', 'restaurant', 'id')
                    .then(storedReviews => {
                        return Promise.resolve(storedReviews)
                    })
            })
    }

    static getStoredObjectById(table, idx, id) {
        return this.dbPromise()
            .then(db => {
                if (!db) return;

                const store = db.transaction(table).objectStore(table);
                const indexId = store.index(idx);
                return indexId.getAll(id);
            })

    }

    static addReview (review){
        const offlineObj = {
            name: 'addReview',
            data: review,
            object_type: 'review'
        };
        if (!navigator.onLine && offlineObj.name === 'addReview') {
            DBHelper.sendDataWhenOnline(offlineObj);
            return;
        }
        const reviewSend = {
            name: review.name,
            rating: parseInt(review.rating),
            comments: review.comments,
            restaurant_id: parseInt(review.restaurant_id),
            createdAt: review.createdAt
        };
        const fetchOptions = {
            method: 'POST',
            body: JSON.stringify(reviewSend),
            headers: {
                'Content-Type': 'application/json'
            }
        };
        fetch(DBHelper.DATABASE_URL('reviews'), fetchOptions)
            .then(res => {
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.indexOf('application/json') !== -1) {
                    return res.json();
                } else {
                    return 'API call successful'
                }
            })
            .then(() => {console.log('Fetch successful')})
            .catch(error => {console.log('error', error)})
    }

    static sendDataWhenOnline(offlineObj) {
        localStorage.setItem('data', JSON.stringify(offlineObj.data));
        window.addEventListener('online', event => {
            const data = JSON.parse(localStorage.getItem('data'));
            [...document.querySelectorAll('.reviews_offline')]
                .forEach(el => {
                    el.classList.remove('reviews_offline');
                    el.querySelector('.offline_label').remove();
                });
            if (data !== null) {
                if (offlineObj.name === 'addReview') {
                    DBHelper.addReview(offlineObj.data);
                }
                localStorage.removeItem('data');
            }
        })
    }
}
