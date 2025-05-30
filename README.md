# Restaurant Picker 🍽️

A unique link-share restaurant picker app where friends can swipe on restaurants together and find their perfect dining match! Think "Tinder for restaurants" with real-time synchronization.

## Features ✨

- **ZIP Code Search**: Enter a ZIP code to find 20 random restaurants nearby (4.2+ star rating)
- **Real-time Sharing**: Generate unique session links to share with friends
- **Synchronized Swiping**: Both users see the same deck of restaurant cards
- **Instant Matching**: Get matched when both users swipe right on the same restaurant
- **Beautiful Cards**: Restaurant cards with photos, ratings, price range, and distance
- **Auto-refresh**: If no matches are found, automatically refresh with new restaurants
- **24-hour Sessions**: Sessions automatically expire after 24 hours
- **No PII Storage**: No personal information is stored

## Tech Stack 🚀

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Animations**: React Spring + React Use Gesture
- **Routing**: React Router DOM
- **Database**: Firebase Realtime Database
- **APIs**: Google Places API
- **Icons**: Lucide React

## Prerequisites 📋

- Node.js 16+ and npm
- Firebase project with Realtime Database
- Google Places API key

## Setup Instructions 🛠️

### 1. Clone and Install

```bash
git clone <repository-url>
cd restaurant-picker
npm install
```

### 2. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Realtime Database
3. Set database rules to public (for demo purposes):
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
4. Get your Firebase configuration from Project Settings
5. Update `src/config/firebase.js` with your Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     databaseURL: "https://your-project-default-rtdb.firebaseio.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

### 3. Google Places API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Places API
   - Geocoding API
4. Create an API key
5. The API key is already configured in `src/services/placesApi.js`

### 4. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## How It Works 🎯

### For the Host:
1. Enter a ZIP code on the home page
2. App fetches 20 restaurants nearby with 4.2+ star ratings
3. Creates a unique session and generates a shareable link
4. Share the link with a friend
5. Both users mark themselves as "ready"
6. Start swiping on restaurant cards!

### For the Friend:
1. Click the shared link
2. Join the existing session
3. Mark yourself as "ready"
4. Start swiping on the same restaurants!

### Matching:
- Swipe right (❤️) to like a restaurant
- Swipe left (✕) to pass
- When both users swipe right on the same restaurant = MATCH! 🎉
- View restaurant details and get directions on Google Maps
- Option to start over with fresh restaurants

## Project Structure 📁

```
src/
├── components/           # Reusable UI components
│   ├── RestaurantCard.jsx   # Swipeable restaurant card
│   ├── MatchScreen.jsx      # Match celebration screen
│   ├── WaitingScreen.jsx    # Waiting for users screen
│   └── ShareLink.jsx        # Share link modal
├── pages/               # Main app pages
│   ├── Home.jsx            # ZIP code entry page
│   └── Session.jsx         # Main swiping session page
├── services/            # External API services
│   ├── placesApi.js        # Google Places API integration
│   └── sessionService.js   # Firebase session management
├── config/              # Configuration files
│   └── firebase.js         # Firebase initialization
└── styles/              # CSS and styling
    ├── index.css           # Global styles + Tailwind
    └── App.css             # App-specific styles
```

## Key Features Implementation 🔧

### Real-time Synchronization
- Uses Firebase Realtime Database for instant updates
- Sessions sync user swipes, matches, and state changes
- Automatic cleanup of expired sessions

### Swipe Gestures
- Implemented with React Spring and React Use Gesture
- Smooth animations and physics-based interactions
- Both touch and mouse support

### Google Places Integration
- Geocoding API converts ZIP codes to coordinates
- Places API finds nearby restaurants with filters
- Photo API displays restaurant images

### Session Management
- Unique session IDs with nanoid
- Auto-expiring sessions (24 hours)
- Real-time user status tracking

## Environment Variables 🔐

The app uses hardcoded API keys for demo purposes. In production, use environment variables:

```env
VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_key_here
# ... other Firebase config
```

## Deployment 🚀

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Deploy to Vercel
```bash
npx vercel
```

## Security Considerations ⚠️

- API keys are exposed in the frontend (demo purposes only)
- Database rules are set to public for simplicity
- In production, implement proper authentication and security rules
- Use server-side API calls for sensitive operations

## Future Enhancements 🚧

- [ ] User authentication
- [ ] Custom restaurant filters (cuisine, price range)
- [ ] Group sessions (3+ people)
- [ ] Restaurant history and favorites
- [ ] Push notifications for matches
- [ ] Social sharing features
- [ ] Advanced matching algorithms

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License 📄

MIT License - see LICENSE file for details

---

Built with ❤️ for finding the perfect dining experiences with friends! 