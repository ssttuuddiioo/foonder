import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration - You'll need to replace these with your actual Firebase config
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "restaurant-picker-app.firebaseapp.com",
  databaseURL: "https://restaurant-picker-app-default-rtdb.firebaseio.com",
  projectId: "restaurant-picker-app",
  storageBucket: "restaurant-picker-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);
export default app; 