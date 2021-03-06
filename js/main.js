import DBHelper from './dbhelper.js';

let restaurants,
    neighborhoods,
    cuisines;
let map;
let markers = [];
const triggeredSelects = ['neighborhoods-select', 'cuisines-select'];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */

document.onreadystatechange = function () {
    if (document.readyState !== "loading") {
        fetchNeighborhoods();
        fetchCuisines();
    }
};

/**
 * Update restaurants on change
 */

function update(id) {
    document.getElementById(id).addEventListener('change', () => {
        updateRestaurants();
    });
}

triggeredSelects.forEach(select => {
    update(select);
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
let fetchNeighborhoods = () => {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
        if (error) { // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });
};

/**
 * Set neighborhoods HTML.
 */
let fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        option.setAttribute('role', 'option');
        option.setAttribute("aria-label", neighborhood);
        select.append(option);
    });
};

/**
 * Fetch all cuisines and set their HTML.
 */
let fetchCuisines = () => {
    DBHelper.fetchCuisines((error, cuisines) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });
};

/**
 * Set cuisines HTML.
 */
let fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        option.setAttribute('role', 'option');
        option.setAttribute("aria-label", cuisine);
        select.append(option);
    });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    let loc = {
        lat: 40.722216,
        lng: -73.987501
    };
    self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: loc,
        scrollwheel: false
    });
    updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
let updateRestaurants = () => {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            resetRestaurants(restaurants);
            fillRestaurantsHTML();
        }
    })
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
let resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    markers.forEach(m => m.setMap(null));
    markers = [];
    self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach((restaurant, index) => {
        ul.append(createRestaurantHTML(restaurant, restaurants.length, index));
    });
    addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant, length, index) => {
    const li = document.createElement('li');
    li.setAttribute('aria-setsize', length);
    li.setAttribute('aria-posinset', (Number(index)+1).toString());
    const image = document.createElement('img');
    image.className = 'restaurant-img lazy';
    image.setAttribute('data-src', DBHelper.imageUrlForRestaurant(restaurant.photograph, '/responsive/', '_sm'));
    image.src = './dist/img/download.jpg';
    image.alt = `Image of ${restaurant.name} Restaurant`;
    li.append(image);

    const name = document.createElement('h2');
    const favoriteRestaurantMark = document.createElement('button');
    favoriteRestaurantMark.className = restaurant.is_favorite ? 'favorite-button' : 'favorite-button common';
    favoriteRestaurantMark.onclick = () => {
        DBHelper.handleFavoriteRestaurant(restaurant.id, restaurant.is_favorite);
        restaurant.is_favorite = !restaurant.is_favorite;
        favoriteRestaurantMark.className = restaurant.is_favorite ? 'favorite-button' : 'favorite-button common';
    };
    favoriteRestaurantMark.innerHTML = ('&#9733;');
    name.innerHTML = restaurant.name;
    name.appendChild(favoriteRestaurantMark);
    li.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    li.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.href = DBHelper.urlForRestaurant(restaurant);
    more.setAttribute('aria-label', 'View details ' + restaurant.name);
    li.append(more);

    return li
};

/**
 * Add markers for current restaurants to the map.
 */
let addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
        google.maps.event.addListener(marker, 'click', () => {
            window.location.href = marker.url
        });
        markers.push(marker);
    });
};
