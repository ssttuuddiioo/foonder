import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Heart, Utensils, Navigation } from 'lucide-react';
import { getCoordinatesFromZip, fetchRestaurantsNearLocation, processRestaurantData } from '../services/placesApi';
import { createSession, generateUserId } from '../services/sessionService';

const Home = () => {
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const createSessionWithCoordinates = async (coordinates, locationText) => {
    setLoading(true);
    setError('');

    try {
      // Fetch restaurants
      const restaurants = await fetchRestaurantsNearLocation(coordinates.lat, coordinates.lng);
      
      if (restaurants.length === 0) {
        setError('No restaurants found in this area. Try a different location.');
        setLoading(false);
        return;
      }

      // Process restaurant data
      const processedRestaurants = restaurants.map(restaurant => 
        processRestaurantData(restaurant, coordinates.lat, coordinates.lng)
      );

      // Create session
      const sessionId = await createSession(locationText, processedRestaurants);
      
      // Generate user ID and navigate to session
      const userId = generateUserId();
      navigate(`/session/${sessionId}?userId=${userId}`);
      
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleZipSubmit = async (e) => {
    e.preventDefault();
    if (!zipCode.trim() || zipCode.length !== 5) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }

    try {
      // Get coordinates from ZIP code
      const coordinates = await getCoordinatesFromZip(zipCode);
      await createSessionWithCoordinates(coordinates, zipCode);
    } catch (error) {
      setError('Invalid ZIP code. Please try again.');
    }
  };

  const handleLocationClick = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setLoadingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        await createSessionWithCoordinates(coordinates, 'Your Location');
        setLoadingLocation(false);
      },
      (error) => {
        setError('Unable to get your location. Please use ZIP code instead.');
        setLoadingLocation(false);
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-500 p-3 rounded-full">
              <Utensils className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find a restaurant you both actually agree on.
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Swipe, match, and go eat—fast.
          </p>
        </div>

        {/* 3-Step Flow */}
        <div className="flex justify-center items-center gap-3 mb-6 px-2">
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mb-1">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-medium text-gray-700">Enter area</p>
          </div>
          
          <div className="w-6 h-px bg-gray-300"></div>
          
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mb-1">
              <Users className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-medium text-gray-700">Swipe together</p>
          </div>
          
          <div className="w-6 h-px bg-gray-300"></div>
          
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mb-1">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-medium text-gray-700">Get matched</p>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Location Input Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Choose your area</h3>
              <span className="text-sm text-red-600 font-medium">👫 play with a friend</span>
            </div>
            
            {/* ZIP Code Input */}
            <form onSubmit={handleZipSubmit} className="mb-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="Enter ZIP Code"
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-base font-mono"
                  maxLength={5}
                />
                <button
                  type="submit"
                  disabled={loading || zipCode.length !== 5}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 font-medium rounded-lg transition-colors duration-200 border border-gray-300"
                >
                  Go
                </button>
              </div>
            </form>

            {/* OR Divider */}
            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-2 text-sm text-gray-500 bg-white">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Use Location Button */}
            <button
              onClick={handleLocationClick}
              disabled={loadingLocation}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-50 text-blue-700 font-medium rounded-lg transition-colors duration-200 border border-blue-200"
            >
              {loadingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Getting location...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Use My Location
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Create Session Button */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-center text-sm text-gray-600 mb-3">
              Local search, shared swiping, easy match
            </p>
            
            <div className="text-center">
              {loading && (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500 mr-2"></div>
                  <span className="text-red-600 font-medium">Creating your session...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Sessions expire after 24 hours • No personal data stored
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home; 