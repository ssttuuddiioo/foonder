import { Star, MapPin, DollarSign, ExternalLink, RotateCcw, Heart, Phone, Globe } from 'lucide-react';

const MatchScreen = ({ match, onStartOver, loading }) => {
  const restaurant = match.restaurant;

  const getPriceString = (priceLevel) => {
    return '$'.repeat(priceLevel || 1);
  };

  const getGoogleMapsUrl = () => {
    return restaurant.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}&query_place_id=${restaurant.id}`;
  };

  const handleCallRestaurant = () => {
    if (restaurant.phoneNumber) {
      window.open(`tel:${restaurant.phoneNumber}`);
    }
  };

  const handleVisitWebsite = () => {
    if (restaurant.website) {
      window.open(restaurant.website, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-red-500 p-3 rounded-full">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Perfect Match!
          </h1>
          <p className="text-base text-gray-600">
            You both loved this restaurant
          </p>
        </div>

        {/* Restaurant Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-4">
          {/* Restaurant Image */}
          <div className="relative h-48 overflow-hidden">
            {restaurant.photoUrl ? (
              <img
                src={restaurant.photoUrl}
                alt={restaurant.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/400x200/ef4444/ffffff?text=${encodeURIComponent(restaurant.name)}`;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-3xl mb-2">🍽️</div>
                  <p className="font-semibold text-base">{restaurant.name}</p>
                </div>
              </div>
            )}
            
            {/* Success Badge */}
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1">
              <Heart className="w-3 h-3" />
              MATCH
            </div>
          </div>

          {/* Restaurant Details */}
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{restaurant.name}</h2>
            
            {/* Rating and Price */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-semibold text-gray-900">{restaurant.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-700">{getPriceString(restaurant.priceLevel)}</span>
              </div>
              {restaurant.distance && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{restaurant.distance}</span>
                </div>
              )}
            </div>

            {/* Address */}
            {restaurant.vicinity && (
              <p className="text-gray-600 mb-4 flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                {restaurant.vicinity}
              </p>
            )}

            {/* Quick Actions */}
            {(restaurant.phoneNumber || restaurant.website) && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {restaurant.phoneNumber && (
                  <button
                    onClick={handleCallRestaurant}
                    className="flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-3 rounded-lg transition-colors duration-200"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">Call</span>
                  </button>
                )}
                
                {restaurant.website && (
                  <button
                    onClick={handleVisitWebsite}
                    className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-3 rounded-lg transition-colors duration-200"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">Website</span>
                  </button>
                )}
              </div>
            )}

            {/* Main Action Buttons */}
            <div className="space-y-2">
              <a
                href={getGoogleMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Open in Maps</span>
              </a>

              <button
                onClick={onStartOver}
                disabled={loading}
                className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>
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