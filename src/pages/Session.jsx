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
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';

const Session = () => {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [userId, setUserId] = useState(null);
  const [currentRestaurantIndex, setCurrentRestaurantIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        // First check if session exists
        const sessionSnapshot = await new Promise((resolve) => {
          const sessionRef = ref(database, `sessions/${sessionId}`);
          onValue(sessionRef, resolve, { onlyOnce: true });
        });
        
        const sessionData = sessionSnapshot.val();
        if (!sessionData) {
          setError('Session not found or expired');
          setLoading(false);
          return;
        }

        // Join the session
        await joinSession(sessionId, userId);
        
        const unsubscribe = getSession(sessionId, (sessionData) => {
          if (sessionData) {
            setSession(sessionData);
            setLoading(false);
            
            // Debug logging
            console.log('Session updated:', {
              sessionId,
              userId,
              users: sessionData.users ? Object.keys(sessionData.users) : [],
              userCount: sessionData.users ? Object.keys(sessionData.users).length : 0
            });
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

  useEffect(() => {
    if (session) {
      console.log('🔍 Session Debug Info:', {
        sessionId,
        currentUserId: userId,
        users: session.users ? Object.keys(session.users) : [],
        userDetails: session.users,
        userCount: session.users ? Object.keys(session.users).length : 0,
        status: session.status
      });
    }
  }, [session, userId, sessionId]);

  const handleSwipe = async (direction) => {
    if (!session || !userId) return;
    
    const restaurant = getCurrentRestaurant();
    if (!restaurant) return;
    
    try {
      await recordSwipe(sessionId, userId, restaurant.id, direction);
      // currentRestaurantIndex will be updated automatically via Firebase listener
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
    if (!session || !session.users || !session.users[userId]) return null;
    
    const currentUser = session.users[userId];
    const userDeck = currentUser.personalDeck || session.restaurants;
    const userIndex = currentUser.currentIndex || 0;
    
    if (userIndex >= userDeck.length) return null;
    return userDeck[userIndex];
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
    if (!session || !session.users || !session.users[userId]) return false;
    
    const currentUser = session.users[userId];
    const userDeck = currentUser.personalDeck || session.restaurants;
    const userIndex = currentUser.currentIndex || 0;
    
    return userIndex >= userDeck.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
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
      <div className="bg-white shadow-sm p-3">
        <div className="max-w-md mx-auto flex items-center justify-center">
          <div className="text-sm text-gray-600">
            {session.users && session.users[userId] ? 
              `${(session.users[userId].currentIndex || 0) + 1} of ${(session.users[userId].personalDeck || session.restaurants).length}` :
              `${currentRestaurantIndex + 1} of ${session.restaurants.length}`
            }
          </div>
        </div>
      </div>

      {/* Restaurant Card */}
      <div className="flex-1 flex items-center justify-center p-3">
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
      <div className="bg-white border-t p-3">
        <div className="max-w-md mx-auto text-center">
          <p className="text-sm text-gray-600 mb-2">
            Swipe right to like, left to pass
          </p>
          <div className="flex justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xs">✕</span>
              </div>
              <span className="text-xs text-gray-600">Pass</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs">♥</span>
              </div>
              <span className="text-xs text-gray-600">Like</span>
            </div>
          </div>
        </div>
      </div>

 
    </div>
  );
};

export default Session; 