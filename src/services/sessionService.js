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
    currentIndex: 0
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

// Record a swipe with simplified matching system
export const recordSwipe = async (sessionId, userId, restaurantId, direction) => {
  console.log('🔥 Recording swipe:', { sessionId, userId, restaurantId, direction });
  
  const userRef = ref(database, `sessions/${sessionId}/users/${userId}`);
  const userSnapshot = await new Promise((resolve) => {
    onValue(userRef, resolve, { onlyOnce: true });
  });
  
  const userData = userSnapshot.val();
  const currentIndex = (userData?.currentIndex || 0) + 1;
  
  // Record the swipe
  const swipeRef = ref(database, `sessions/${sessionId}/users/${userId}/swipes/${restaurantId}`);
  await set(swipeRef, {
    direction,
    timestamp: Date.now(),
    swipeNumber: currentIndex
  });
  
  // Update user's current index
  const updates = {};
  updates[`sessions/${sessionId}/users/${userId}/currentIndex`] = currentIndex;
  await update(ref(database), updates);
  
  console.log('✅ Swipe recorded. Current index:', currentIndex);
  
  // Check for matches every 3 swipes (but not immediately on first swipe)
  if (currentIndex >= 3 && currentIndex % 3 === 0) {
    console.log('🔍 Checking for matches after', currentIndex, 'swipes');
    await checkForMatches(sessionId);
  }
  
  // Also check for matches if this is a right swipe (more frequent checking)
  if (direction === 'right' && currentIndex >= 2) {
    console.log('💖 Right swipe detected, checking for matches');
    await checkForMatches(sessionId);
  }
};

// Simplified match checking - looks for any matches across all swipes
const checkForMatches = async (sessionId) => {
  console.log('🔍 Starting match check for session:', sessionId);
  
  return new Promise((resolve) => {
    const sessionRef = ref(database, `sessions/${sessionId}`);
    onValue(sessionRef, async (snapshot) => {
      const session = snapshot.val();
      if (!session) {
        console.log('❌ No session found');
        return resolve();
      }
      
      const users = Object.values(session.users || {});
      console.log('👥 Users in session:', users.length);
      
      if (users.length < 2) {
        console.log('⏳ Need at least 2 users for matching');
        return resolve();
      }
      
      // Get all restaurant IDs that have been swiped on
      const allSwipedRestaurants = new Set();
      users.forEach(user => {
        if (user.swipes) {
          Object.keys(user.swipes).forEach(restaurantId => {
            allSwipedRestaurants.add(restaurantId);
          });
        }
      });
      
      console.log('🍽️ Total restaurants swiped on:', allSwipedRestaurants.size);
      
      // Check each restaurant for matches
      for (const restaurantId of allSwipedRestaurants) {
        const rightSwipes = users.filter(user => 
          user.swipes && 
          user.swipes[restaurantId] && 
          user.swipes[restaurantId].direction === 'right'
        );
        
        console.log(`🔍 Restaurant ${restaurantId}: ${rightSwipes.length} right swipes`);
        
        if (rightSwipes.length >= 2) {
          console.log('🎉 MATCH FOUND for restaurant:', restaurantId);
          
          // Find the restaurant data - check both session.restaurants and user personal decks
          let restaurant = session.restaurants?.find(r => r.id === restaurantId);
          
          if (!restaurant) {
            // If not found in session.restaurants, check user personal decks
            for (const user of users) {
              if (user.personalDeck) {
                restaurant = user.personalDeck.find(r => r.id === restaurantId);
                if (restaurant) break;
              }
            }
          }
          
          if (restaurant) {
            console.log('✅ Found restaurant data for match:', restaurant.name);
            
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
            
            console.log('🎊 Match created and session status updated!');
            break; // Only reveal first match found
          } else {
            console.log('❌ Could not find restaurant data for:', restaurantId);
          }
                 }
       }
       
       resolve();
     }, { onlyOnce: true });
   });
 };

// Remove the old batch matching function since we're simplifying
// const checkForBatchMatches = ... (removed)

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