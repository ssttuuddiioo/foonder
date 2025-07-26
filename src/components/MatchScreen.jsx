import { Star, MapPin, DollarSign, ExternalLink, RotateCcw, Heart } from 'lucide-react';

const MatchScreen = ({ match, onStartOver, loading }) => {
  const restaurant = match.restaurant;

  const getPriceString = (priceLevel) => {
    return '$'.repeat(priceLevel || 1);
  };

  const getGoogleMapsUrl = () => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}&query_place_id=${restaurant.id}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-red-500 p-4 rounded-full">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Perfect Match!
          </h1>
          <p className="text-xl text-gray-600">
            You both loved this restaurant
          </p>
        </div>

        {/* Restaurant Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Restaurant Image */}
          <div className="relative h-64 overflow-hidden">
            {restaurant.photoUrl ? (
              <img
                src={restaurant.photoUrl}
                alt={restaurant.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/400x250/ef4444/ffffff?text=${encodeURIComponent(restaurant.name)}`;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-3">🍽️</div>
                  <p className="font-semibold text-lg">{restaurant.name}</p>
                </div>
              </div>
            )}
            
            {/* Success Badge */}
            <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
              <Heart className="w-4 h-4" />
              MATCH
            </div>
          </div>

          {/* Restaurant Details */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{restaurant.name}</h2>
            
            {/* Rating and Price */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-semibold text-gray-900">{restaurant.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-5 h-5 text-gray-500" />
                <span className="font-semibold text-gray-700">{getPriceString(restaurant.priceLevel)}</span>
              </div>
              {restaurant.distance && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">{restaurant.distance}</span>
                </div>
              )}
            </div>

            {/* Address */}
            {restaurant.vicinity && (
              <p className="text-gray-600 mb-6 flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                {restaurant.vicinity}
              </p>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <a
                href={getGoogleMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-3"
              >
                <ExternalLink className="w-6 h-6" />
                <span className="text-lg">View on Google Maps</span>
              </a>

              <button
                onClick={onStartOver}
                disabled={loading}
                className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-3"
              >
                <RotateCcw className="w-6 h-6" />
                <span className="text-lg">
                  {loading ? 'Loading New Restaurants...' : 'Find Another Match'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Enjoy your meal! 🍽️
          </p>
        </div>
      </div>
    </div>
  );
};

export default MatchScreen; 