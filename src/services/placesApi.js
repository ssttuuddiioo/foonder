// Google Places API service using Google Maps JavaScript API
const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || 'your-google-places-api-key-here';

// Initialize Google Maps API
let googleMapsLoaded = false;
let geocoder = null;
let placesService = null;

const initializeGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    if (googleMapsLoaded && window.google) {
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      googleMapsLoaded = true;
      geocoder = new window.google.maps.Geocoder();
      
      // Create a map element for places service (required but hidden)
      const mapDiv = document.createElement('div');
      mapDiv.style.display = 'none';
      document.body.appendChild(mapDiv);
      
      const map = new window.google.maps.Map(mapDiv, {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 13
      });
      
      placesService = new window.google.maps.places.PlacesService(map);
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps API'));
    };
    
    document.head.appendChild(script);
  });
};

// Convert ZIP code to coordinates using geocoding
export const getCoordinatesFromZip = async (zipCode) => {
  try {
    await initializeGoogleMaps();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: zipCode }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          reject(new Error('Could not find coordinates for ZIP code'));
        }
      });
    });
  } catch (error) {
    console.error('Error getting coordinates:', error);
    throw error;
  }
};

// Fetch restaurants near coordinates
export const fetchRestaurantsNearLocation = async (lat, lng, radius = 5000) => {
  try {
    await initializeGoogleMaps();
    
    return new Promise((resolve, reject) => {
      const request = {
        location: new window.google.maps.LatLng(lat, lng),
        radius: radius,
        type: ['restaurant']
      };
      
      placesService.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          // Filter restaurants with rating >= 4.2 and have required data
          const filteredRestaurants = results.filter(restaurant => 
            restaurant.rating >= 4.2 && 
            restaurant.name && 
            restaurant.photos && 
            restaurant.photos.length > 0
          );
          
          // Randomly select up to 20 restaurants
          const shuffled = filteredRestaurants.sort(() => 0.5 - Math.random());
          resolve(shuffled.slice(0, 20));
        } else {
          console.error('Places service failed:', status);
          resolve([]);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
};

// Get photo URL from photo reference
export const getPhotoUrl = (photoReference, maxWidth = 400) => {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
};

// Get distance between two coordinates (Haversine formula)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1); // Distance in miles
};

// Process restaurant data for the app
export const processRestaurantData = (restaurant, userLat, userLng) => {
  const photoReference = restaurant.photos?.[0]?.photo_reference;
  const distance = calculateDistance(
    userLat, 
    userLng, 
    restaurant.geometry.location.lat(), 
    restaurant.geometry.location.lng()
  );
  
  return {
    id: restaurant.place_id,
    name: restaurant.name,
    rating: restaurant.rating,
    priceLevel: restaurant.price_level || 1,
    photoUrl: photoReference ? getPhotoUrl(photoReference) : null,
    vicinity: restaurant.vicinity,
    distance: `${distance} mi`,
    lat: restaurant.geometry.location.lat(),
    lng: restaurant.geometry.location.lng(),
    types: restaurant.types || []
  };
}; 