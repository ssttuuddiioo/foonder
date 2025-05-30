import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  getSession, 
  joinSession, 
  markUserReady, 
  recordSwipe,
  resetSession,
  generateUserId 
} from '../services/sessionService';
import { 
  getCoordinatesFromZip, 
  fetchRestaurantsNearLocation, 
  processRestaurantData 
} from '../services/placesApi';
import RestaurantCard from '../components/RestaurantCard';
import MatchScreen from '../components/MatchScreen';
import WaitingScreen from '../components/WaitingScreen';
import ShareLink from '../components/ShareLink';

const Session = () => {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [userId, setUserId] = useState(null);
  const [currentRestaurantIndex, setCurrentRestaurantIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareLink, setShowShareLink] = useState(false);

  useEffect(() => {
    // Get or generate user ID
    let userIdFromParams = searchParams.get('userId');
    if (!userIdFromParams) {
      userIdFromParams = generateUserId();
      // Update URL with user ID
      const newUrl = `${window.location.pathname}?userId=${userIdFromParams}`;
      window.history.replaceState({}, '', newUrl);
    }
    setUserId(userIdFromParams);
  }, [searchParams]);

  useEffect(() => {
    if (!sessionId || !userId) return;

    // Join session and listen for updates
    const joinAndListen = async () => {
      try {
        await joinSession(sessionId, userId);
        
        const unsubscribe = getSession(sessionId, (sessionData) => {
          if (sessionData) {
            setSession(sessionData);
            setLoading(false);
          } else {
            setError('Session not found or expired');
            setLoading(false);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error joining session:', error);
        setError('Failed to join session');
        setLoading(false);
      }
    };

    const unsubscribePromise = joinAndListen();
    
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [sessionId, userId]);

  const handleSwipe = async (direction) => {
    if (!session || !userId || currentRestaurantIndex >= session.restaurants.length) return;

    const restaurant = session.restaurants[currentRestaurantIndex];
    
    try {
      await recordSwipe(sessionId, userId, restaurant.id, direction);
      setCurrentRestaurantIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error recording swipe:', error);
    }
  };

  const handleMarkReady = async () => {
    try {
      await markUserReady(sessionId, userId);
    } catch (error) {
      console.error('Error marking ready:', error);
    }
  };

  const handleStartOver = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      // Fetch new restaurants
      const coordinates = await getCoordinatesFromZip(session.zipCode);
      const restaurants = await fetchRestaurantsNearLocation(coordinates.lat, coordinates.lng);
      const processedRestaurants = restaurants.map(restaurant => 
        processRestaurantData(restaurant, coordinates.lat, coordinates.lng)
      );

      await resetSession(sessionId, processedRestaurants);
      setCurrentRestaurantIndex(0);
    } catch (error) {
      console.error('Error resetting session:', error);
      setError('Failed to load new restaurants');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentRestaurant = () => {
    if (!session || currentRestaurantIndex >= session.restaurants.length) return null;
    return session.restaurants[currentRestaurantIndex];
  };

  const getUsers = () => {
    if (!session || !session.users) return [];
    return Object.values(session.users);
  };

  const hasMatch = () => {
    return session && session.matches && Object.keys(session.matches).length > 0;
  };

  const getMatch = () => {
    if (!hasMatch()) return null;
    return Object.values(session.matches)[0];
  };

  const isWaitingForUsers = () => {
    const users = getUsers();
    return users.length < 2 || session?.status === 'waiting_for_users';
  };

  const isOutOfRestaurants = () => {
    return session && currentRestaurantIndex >= session.restaurants.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Session not found</p>
      </div>
    );
  }

  // Show match screen if there's a match
  if (hasMatch()) {
    return (
      <MatchScreen 
        match={getMatch()} 
        onStartOver={handleStartOver}
        loading={loading}
      />
    );
  }

  // Show waiting screen if not enough users or waiting for ready
  if (isWaitingForUsers()) {
    return (
      <WaitingScreen 
        session={session}
        userId={userId}
        onMarkReady={handleMarkReady}
        onShowShareLink={() => setShowShareLink(true)}
      />
    );
  }

  // Show "out of restaurants" screen
  if (isOutOfRestaurants()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="text-6xl mb-4">🤷‍♀️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Matches This Round</h2>
            <p className="text-gray-600">
              You've both gone through all restaurants without finding a match. 
              Let's try with a fresh set!
            </p>
          </div>
          <button
            onClick={handleStartOver}
            disabled={loading}
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Loading New Restaurants...' : 'Try New Restaurants'}
          </button>
        </div>
      </div>
    );
  }

  const currentRestaurant = getCurrentRestaurant();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {currentRestaurantIndex + 1} of {session.restaurants.length}
          </div>
          <button
            onClick={() => setShowShareLink(true)}
            className="text-primary-500 hover:text-primary-600 text-sm font-medium"
          >
            Share Link
          </button>
        </div>
      </div>

      {/* Restaurant Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        {currentRestaurant ? (
          <RestaurantCard 
            restaurant={currentRestaurant}
            onSwipe={handleSwipe}
          />
        ) : (
          <div className="text-center">
            <p className="text-gray-600">No more restaurants</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white border-t p-4">
        <div className="max-w-md mx-auto text-center">
          <p className="text-sm text-gray-600 mb-2">
            Swipe right to like, left to pass
          </p>
          <div className="flex justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm">✕</span>
              </div>
              <span className="text-sm text-gray-600">Pass</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">♥</span>
              </div>
              <span className="text-sm text-gray-600">Like</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share Link Modal */}
      {showShareLink && (
        <ShareLink 
          sessionId={sessionId}
          onClose={() => setShowShareLink(false)}
        />
      )}
    </div>
  );
};

export default Session; 