import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Utensils, Share2 } from 'lucide-react';
import { getCoordinatesFromZip, fetchRestaurantsNearLocation, processRestaurantData } from '../services/placesApi';
import { createSession, generateUserId } from '../services/sessionService';

const Home = () => {
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!zipCode.trim() || zipCode.length !== 5) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get coordinates from ZIP code
      const coordinates = await getCoordinatesFromZip(zipCode);
      
      // Fetch restaurants
      const restaurants = await fetchRestaurantsNearLocation(coordinates.lat, coordinates.lng);
      
      if (restaurants.length === 0) {
        setError('No restaurants found in this area. Try a different ZIP code.');
        setLoading(false);
        return;
      }

      // Process restaurant data
      const processedRestaurants = restaurants.map(restaurant => 
        processRestaurantData(restaurant, coordinates.lat, coordinates.lng)
      );

      // Create session
      const sessionId = await createSession(zipCode, processedRestaurants);
      
      // Generate user ID and navigate to session
      const userId = generateUserId();
      navigate(`/session/${sessionId}?userId=${userId}`);
      
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Failed to create session. Please check your ZIP code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary-500 p-3 rounded-full">
              <Utensils className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Picker</h1>
          <p className="text-gray-600">Find your perfect dining match with friends!</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="bg-white p-3 rounded-lg shadow-sm mb-2">
              <MapPin className="w-6 h-6 text-primary-500 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">Local Search</p>
          </div>
          <div className="text-center">
            <div className="bg-white p-3 rounded-lg shadow-sm mb-2">
              <Users className="w-6 h-6 text-primary-500 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">Shared Swiping</p>
          </div>
          <div className="text-center">
            <div className="bg-white p-3 rounded-lg shadow-sm mb-2">
              <Share2 className="w-6 h-6 text-primary-500 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">Easy Sharing</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleCreateSession}>
            <div className="mb-6">
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                Enter ZIP Code
              </label>
              <input
                type="text"
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="12345"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg font-mono"
                maxLength={5}
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                We'll find 20 great restaurants nearby (4.2+ stars)
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || zipCode.length !== 5}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Session...
                </div>
              ) : (
                'Create Session'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">How it works:</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>1. Enter your ZIP code to find restaurants</p>
                <p>2. Share the link with a friend</p>
                <p>3. Both swipe on restaurants</p>
                <p>4. Get matched when you both like the same place!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Sessions expire after 24 hours. No personal data is stored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home; 