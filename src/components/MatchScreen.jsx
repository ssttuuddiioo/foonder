import { Star, MapPin, DollarSign, ExternalLink, RotateCcw } from 'lucide-react';

const MatchScreen = ({ match, onStartOver, loading }) => {
  const restaurant = match.restaurant;

  const getPriceString = (priceLevel) => {
    return '$'.repeat(priceLevel || 1);
  };

  const getGoogleMapsUrl = () => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}&query_place_id=${restaurant.id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce-gentle">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">It's a Match!</h1>
          <p className="text-gray-600">You both loved this restaurant</p>
        </div>

        {/* Restaurant Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Restaurant Image */}
          <div className="relative h-48 overflow-hidden">
            {restaurant.photoUrl ? (
              <img
                src={restaurant.photoUrl}
                alt={restaurant.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/400x200/10b981/ffffff?text=${encodeURIComponent(restaurant.name)}`;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-3xl mb-2">🍽️</div>
                  <p className="font-semibold">{restaurant.name}</p>
                </div>
              </div>
            )}
            
            {/* Success Badge */}
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm">
              MATCH
            </div>
          </div>

          {/* Restaurant Details */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{restaurant.name}</h2>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 fill-current text-yellow-400" />
                <span className="font-semibold text-gray-700">{restaurant.rating}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-700">{getPriceString(restaurant.priceLevel)}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <MapPin className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">{restaurant.distance}</span>
              </div>
            </div>
            
            {restaurant.vicinity && (
              <p className="text-gray-600 mb-4">{restaurant.vicinity}</p>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <a
                href={getGoogleMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-5 h-5" />
                <span>View on Google Maps</span>
              </a>
              
              <button
                onClick={onStartOver}
                disabled={loading}
                className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{loading ? 'Loading...' : 'Start Over'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Planning your visit?</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>• Check their current hours and availability</p>
            <p>• Consider making a reservation if needed</p>
            <p>• Read recent reviews for the latest updates</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Enjoy your meal! 🍽️
          </p>
        </div>
      </div>
    </div>
  );
};

export default MatchScreen; 