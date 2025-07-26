// Google Places API service using the new Places API (New)
const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || 'your-google-places-api-key-here';

// Initialize Google Maps API for geocoding only
let googleMapsLoaded = false;
let geocoder = null;

const initializeGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    if (googleMapsLoaded && window.google) {
      resolve();
      return;
    }

    // Create script element - only need geocoding, not places
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=geocoding`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      googleMapsLoaded = true;
      geocoder = new window.google.maps.Geocoder();
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

// Fetch restaurants using the new Places API (New)
export const fetchRestaurantsNearLocation = async (lat, lng, radius = 5000) => {
  try {
    console.log('🔍 Starting restaurant search for coordinates:', { lat, lng, radius });
    
    // Use the new Places API (New) with HTTP requests
    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.priceLevel,places.photos,places.formattedAddress,places.location,places.types,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri'
      },
      body: JSON.stringify({
        includedTypes: ['restaurant'],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude: lat,
              longitude: lng
            },
            radius: radius
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Places API error:', response.status, errorText);
      throw new Error(`Places API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('📊 Places API response:', data);

    if (!data.places || data.places.length === 0) {
      console.log('⚠️ No restaurants found in this area');
      return [];
    }

    // Filter restaurants with rating >= 4.2 and have required data
    const filteredRestaurants = data.places.filter(restaurant => 
      restaurant.rating >= 4.2 && 
      restaurant.displayName && 
      restaurant.photos && 
      restaurant.photos.length > 0
    );
    
    console.log('✅ Found', data.places.length, 'restaurants, filtered to', filteredRestaurants.length, 'high-rated restaurants with photos');
    
    // Randomly shuffle and return up to 20 restaurants
    const shuffled = filteredRestaurants.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 20);

  } catch (error) {
    console.error('❌ Error fetching restaurants:', error);
    throw error;
  }
};

// Get photo URL from the new Places API photo format
export const getPhotoUrl = (photo, maxWidth = 400) => {
  if (!photo || !photo.name) return null;
  
  return `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_PLACES_API_KEY}`;
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

// Process restaurant data for the app (updated for new API format)
export const processRestaurantData = (restaurant, userLat, userLng) => {
  const photo = restaurant.photos?.[0];
  const distance = calculateDistance(
    userLat, 
    userLng, 
    restaurant.location.latitude, 
    restaurant.location.longitude
  );
  
  const processedData = {
    id: restaurant.id,
    name: restaurant.displayName?.text || restaurant.displayName,
    rating: restaurant.rating,
    priceLevel: restaurant.priceLevel || 1,
    photoUrl: photo ? getPhotoUrl(photo) : null,
    vicinity: restaurant.formattedAddress,
    distance: `${distance} mi`,
    lat: restaurant.location.latitude,
    lng: restaurant.location.longitude,
    types: restaurant.types || []
  };

  // Only add optional fields if they have values (Firebase doesn't allow undefined)
  const phoneNumber = restaurant.nationalPhoneNumber || restaurant.internationalPhoneNumber;
  if (phoneNumber) {
    processedData.phoneNumber = phoneNumber;
  }
  
  if (restaurant.websiteUri) {
    processedData.website = restaurant.websiteUri;
  }
  
  if (restaurant.googleMapsUri) {
    processedData.googleMapsUri = restaurant.googleMapsUri;
  }
  
  return processedData;
}; 