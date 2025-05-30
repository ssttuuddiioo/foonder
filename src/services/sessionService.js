import { ref, set, onValue, push, update, remove } from 'firebase/database';
import { database } from '../config/firebase';
import { nanoid } from 'nanoid';

// Create a new session
export const createSession = async (zipCode, restaurants) => {
  const sessionId = nanoid(10);
  const sessionData = {
    id: sessionId,
    zipCode,
    restaurants,
    users: {},
    matches: [],
    currentDeck: restaurants,
    createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    status: 'waiting_for_users'
  };

  const sessionRef = ref(database, `sessions/${sessionId}`);
  await set(sessionRef, sessionData);
  
  return sessionId;
};

// Join a session
export const joinSession = async (sessionId, userId) => {
  const userRef = ref(database, `sessions/${sessionId}/users/${userId}`);
  await set(userRef, {
    id: userId,
    joinedAt: Date.now(),
    swipes: {},
    ready: false
  });
  
  return true;
};

// Get session data
export const getSession = (sessionId, callback) => {
  const sessionRef = ref(database, `sessions/${sessionId}`);
  return onValue(sessionRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

// Record a swipe
export const recordSwipe = async (sessionId, userId, restaurantId, direction) => {
  const swipeRef = ref(database, `sessions/${sessionId}/users/${userId}/swipes/${restaurantId}`);
  await set(swipeRef, {
    direction, // 'left' or 'right'
    timestamp: Date.now()
  });
  
  // Check for matches after recording swipe
  await checkForMatches(sessionId, restaurantId);
};

// Check for matches between users
const checkForMatches = async (sessionId, restaurantId) => {
  return new Promise((resolve) => {
    const sessionRef = ref(database, `sessions/${sessionId}`);
    onValue(sessionRef, async (snapshot) => {
      const session = snapshot.val();
      if (!session) return resolve();
      
      const users = Object.values(session.users || {});
      const rightSwipes = users.filter(user => 
        user.swipes && user.swipes[restaurantId] && user.swipes[restaurantId].direction === 'right'
      );
      
      // If both users swiped right on the same restaurant
      if (rightSwipes.length >= 2) {
        const restaurant = session.restaurants.find(r => r.id === restaurantId);
        if (restaurant) {
          const matchRef = ref(database, `sessions/${sessionId}/matches`);
          const newMatch = {
            restaurantId,
            restaurant,
            timestamp: Date.now(),
            users: rightSwipes.map(u => u.id)
          };
          
          await push(matchRef, newMatch);
          
          // Update session status
          const statusRef = ref(database, `sessions/${sessionId}/status`);
          await set(statusRef, 'matched');
        }
      }
      
      resolve();
    }, { onlyOnce: true });
  });
};

// Reset session with new restaurants
export const resetSession = async (sessionId, newRestaurants) => {
  const updates = {};
  updates[`sessions/${sessionId}/restaurants`] = newRestaurants;
  updates[`sessions/${sessionId}/currentDeck`] = newRestaurants;
  updates[`sessions/${sessionId}/matches`] = [];
  updates[`sessions/${sessionId}/status`] = 'active';
  
  // Clear all user swipes
  const sessionRef = ref(database, `sessions/${sessionId}`);
  onValue(sessionRef, async (snapshot) => {
    const session = snapshot.val();
    if (session && session.users) {
      Object.keys(session.users).forEach(userId => {
        updates[`sessions/${sessionId}/users/${userId}/swipes`] = {};
      });
    }
    
    await update(ref(database), updates);
  }, { onlyOnce: true });
};

// Mark user as ready
export const markUserReady = async (sessionId, userId) => {
  const readyRef = ref(database, `sessions/${sessionId}/users/${userId}/ready`);
  await set(readyRef, true);
  
  // Check if all users are ready to start
  const sessionRef = ref(database, `sessions/${sessionId}`);
  onValue(sessionRef, async (snapshot) => {
    const session = snapshot.val();
    if (session && session.users) {
      const users = Object.values(session.users);
      const allReady = users.length >= 2 && users.every(user => user.ready);
      
      if (allReady && session.status === 'waiting_for_users') {
        const statusRef = ref(database, `sessions/${sessionId}/status`);
        await set(statusRef, 'active');
      }
    }
  }, { onlyOnce: true });
};

// Clean up expired sessions (should be run periodically)
export const cleanupExpiredSessions = async () => {
  const sessionsRef = ref(database, 'sessions');
  onValue(sessionsRef, async (snapshot) => {
    const sessions = snapshot.val();
    if (!sessions) return;
    
    const now = Date.now();
    const expiredSessions = Object.entries(sessions).filter(
      ([id, session]) => session.expiresAt < now
    );
    
    for (const [sessionId] of expiredSessions) {
      await remove(ref(database, `sessions/${sessionId}`));
    }
  }, { onlyOnce: true });
};

// Generate user ID
export const generateUserId = () => nanoid(8); 