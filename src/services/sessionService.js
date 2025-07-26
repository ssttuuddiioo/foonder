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
  
  // Get session data to shuffle restaurants per user
  const sessionRef = ref(database, `sessions/${sessionId}`);
  const sessionSnapshot = await new Promise((resolve) => {
    onValue(sessionRef, resolve, { onlyOnce: true });
  });
  
  const sessionData = sessionSnapshot.val();
  let userDeck = sessionData?.restaurants || [];
  
  // Create a unique shuffle for this user based on their userId
  // This ensures each user gets a different order but remains consistent for that user
  const shuffleArray = (array, seed) => {
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    let temporaryValue, randomIndex;
    
    // Use a simple seeded random function
    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    let seedValue = 0;
    for (let i = 0; i < seed.length; i++) {
      seedValue += seed.charCodeAt(i);
    }
    
    while (0 !== currentIndex) {
      randomIndex = Math.floor(seededRandom(seedValue++) * currentIndex);
      currentIndex -= 1;
      
      temporaryValue = shuffled[currentIndex];
      shuffled[currentIndex] = shuffled[randomIndex];
      shuffled[randomIndex] = temporaryValue;
    }
    
    return shuffled;
  };
  
  // Shuffle restaurants uniquely for this user
  userDeck = shuffleArray(userDeck, userId);
  
  await set(userRef, {
    id: userId,
    joinedAt: Date.now(),
    swipes: {},
    ready: false,
    personalDeck: userDeck,
    currentIndex: 0,
    swipeBatch: 1,
    batchSwipeCount: 0
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

// Record a swipe with batch system
export const recordSwipe = async (sessionId, userId, restaurantId, direction) => {
  const userRef = ref(database, `sessions/${sessionId}/users/${userId}`);
  const userSnapshot = await new Promise((resolve) => {
    onValue(userRef, resolve, { onlyOnce: true });
  });
  
  const userData = userSnapshot.val();
  const currentBatchCount = (userData?.batchSwipeCount || 0) + 1;
  const currentBatch = userData?.swipeBatch || 1;
  
  // Record the swipe
  const swipeRef = ref(database, `sessions/${sessionId}/users/${userId}/swipes/${restaurantId}`);
  await set(swipeRef, {
    direction,
    timestamp: Date.now(),
    batch: currentBatch
  });
  
  // Update batch count and current index
  const updates = {};
  updates[`sessions/${sessionId}/users/${userId}/batchSwipeCount`] = currentBatchCount;
  updates[`sessions/${sessionId}/users/${userId}/currentIndex`] = (userData?.currentIndex || 0) + 1;
  
  // If completed 5 swipes in this batch, check for matches from all previous batches
  if (currentBatchCount >= 5) {
    updates[`sessions/${sessionId}/users/${userId}/swipeBatch`] = currentBatch + 1;
    updates[`sessions/${sessionId}/users/${userId}/batchSwipeCount`] = 0;
    
    // Check for matches if it's a right swipe and batch is complete
    if (direction === 'right') {
      await checkForBatchMatches(sessionId, restaurantId, currentBatch);
    }
  }
  
  await update(ref(database), updates);
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

// Check for matches after a batch is completed (5 swipes)
const checkForBatchMatches = async (sessionId, restaurantId, completedBatch) => {
  return new Promise((resolve) => {
    const sessionRef = ref(database, `sessions/${sessionId}`);
    onValue(sessionRef, async (snapshot) => {
      const session = snapshot.val();
      if (!session) return resolve();
      
      const users = Object.values(session.users || {});
      
      // Check if both users have completed the same batch
      const usersCompletedBatch = users.filter(user => 
        (user.swipeBatch || 1) > completedBatch || 
        ((user.swipeBatch || 1) === completedBatch && (user.batchSwipeCount || 0) >= 5)
      );
      
      if (usersCompletedBatch.length >= 2) {
        // Look for matches in all swipes from completed batches
        const allRestaurantIds = new Set();
        users.forEach(user => {
          if (user.swipes) {
            Object.keys(user.swipes).forEach(id => {
              const swipe = user.swipes[id];
              if (swipe.batch <= completedBatch) {
                allRestaurantIds.add(id);
              }
            });
          }
        });
        
        // Check each restaurant for matches
        for (const restId of allRestaurantIds) {
          const rightSwipes = users.filter(user => 
            user.swipes && 
            user.swipes[restId] && 
            user.swipes[restId].direction === 'right' &&
            user.swipes[restId].batch <= completedBatch
          );
          
          if (rightSwipes.length >= 2) {
            const restaurant = session.restaurants.find(r => r.id === restId);
            if (restaurant) {
              const matchRef = ref(database, `sessions/${sessionId}/matches`);
              const newMatch = {
                restaurantId: restId,
                restaurant,
                timestamp: Date.now(),
                users: rightSwipes.map(u => u.id),
                revealedAfterBatch: completedBatch
              };
              
              await push(matchRef, newMatch);
              
              // Update session status
              const statusRef = ref(database, `sessions/${sessionId}/status`);
              await set(statusRef, 'matched');
              break; // Only reveal first match found
            }
          }
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