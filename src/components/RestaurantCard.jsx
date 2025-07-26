import { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { useDrag } from '@use-gesture/react';
import { Star, MapPin, DollarSign, X, Heart } from 'lucide-react';

const RestaurantCard = ({ restaurant, onSwipe }) => {
  const [isGone, setIsGone] = useState(false);

  const [{ x, y, rot, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rot: 0,
    scale: 1,
    config: { friction: 50, tension: 500 }
  }));

  const bind = useDrag(({ args: [index], down, movement: [mx, my], direction: [xDir], velocity }) => {
    const trigger = velocity > 0.2;
    const dir = xDir < 0 ? -1 : 1;
    
    if (!down && trigger) {
      setIsGone(true);
      const direction = dir === 1 ? 'right' : 'left';
      onSwipe(direction);
    }
    
    api.start({
      x: isGone ? (200 + window.innerWidth) * dir : down ? mx : 0,
      y: down ? my : 0,
      rot: down ? mx / 100 + (isGone ? dir * 10 : 0) : 0,
      scale: down ? 1.1 : 1,
      immediate: name => down && name === 'x'
    });
  });

  const handleButtonSwipe = (direction) => {
    setIsGone(true);
    const dir = direction === 'right' ? 1 : -1;
    api.start({
      x: (200 + window.innerWidth) * dir,
      rot: dir * 10,
      scale: 1.1
    });
    onSwipe(direction);
  };

  const getPriceString = (priceLevel) => {
    return '$'.repeat(priceLevel || 1);
  };

  const getSwipeIndicator = () => {
    const currentX = x.get();
    if (Math.abs(currentX) < 50) return null;
    
    return currentX > 0 ? (
      <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full font-bold text-xs">
        LIKE
      </div>
    ) : (
      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full font-bold text-xs">
        PASS
      </div>
    );
  };

  return (
    <div className="relative max-w-sm mx-auto">
      <animated.div
        {...bind()}
        className="swipe-card relative bg-white rounded-2xl card-shadow overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none"
        style={{
          x,
          y,
          transform: `perspective(600px) rotateX(${y.to(v => v / 10)}deg) rotateY(${x.to(v => v / 10)}deg) rotateZ(${rot}deg) scale(${scale})`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Restaurant Image */}
        <div className="relative h-64 overflow-hidden">
          {restaurant.photoUrl ? (
            <img
              src={restaurant.photoUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/400x250/f97316/ffffff?text=${encodeURIComponent(restaurant.name)}`;
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-3xl mb-2">🍽️</div>
                <p className="font-semibold">{restaurant.name}</p>
              </div>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 gradient-overlay" />
          
          {/* Swipe Indicator */}
          {getSwipeIndicator()}
          
          {/* Restaurant Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-xl font-bold mb-1">{restaurant.name}</h3>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-current text-yellow-400" />
                <span className="font-semibold">{restaurant.rating}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">{getPriceString(restaurant.priceLevel)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{restaurant.distance}</span>
              </div>
            </div>
            
            {restaurant.vicinity && (
              <p className="text-sm opacity-90 line-clamp-2">{restaurant.vicinity}</p>
            )}
          </div>
        </div>
      </animated.div>

      {/* Swipe Buttons */}
      <div className="flex justify-center space-x-6 mt-4">
        <button
          onClick={() => handleButtonSwipe('left')}
          className="w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:border-gray-300 transition-all duration-200 active:scale-95"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        
        <button
          onClick={() => handleButtonSwipe('right')}
          className="w-12 h-12 bg-white border-2 border-red-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:border-red-300 transition-all duration-200 active:scale-95"
        >
          <Heart className="w-5 h-5 text-red-500" />
        </button>
      </div>
      
      {/* Swipe Instructions */}
      <p className="text-center text-xs text-gray-500 mt-3">
        Drag the card or use buttons to swipe
      </p>
    </div>
  );
};

export default RestaurantCard; 