# Setup Instructions

## 1. Firebase Setup

1. Go to https://console.firebase.google.com/
2. Click "Create a project" or "Add project"
3. Give it a name (e.g., "restaurant-picker-app")
4. Enable/disable Google Analytics as desired
5. Click "Create project"

### Set up Realtime Database
1. In your Firebase console, go to "Build" → "Realtime Database"
2. Click "Create Database"
3. Select your region
4. Choose "Start in test mode" (for development)
5. Click "Enable"

### Get Firebase Configuration
1. In your Firebase project, click the gear icon → "Project settings"
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app icon `</>`
4. Give your app a nickname (e.g., "restaurant-picker-web")
5. Click "Register app"
6. Copy the Firebase configuration object

## 2. Google Places API Setup

1. Go to https://console.cloud.google.com/
2. Create a new project or select your Firebase project
3. Enable these APIs:
   - Places API
   - Geocoding API
   - Places API (New)
4. Go to "Credentials" → "Create Credentials" → "API key"
5. Copy your API key
6. (Optional) Restrict the API key to specific APIs and websites

## 3. Environment Variables

Create a `.env.local` file in your project root and add:

```env
# Firebase Configuration (replace with your actual values)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Google Places API Key
VITE_GOOGLE_PLACES_API_KEY=your-google-places-api-key
```

## 4. Firebase Security Rules (for development)

In your Firebase Realtime Database, go to "Rules" and set:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **Warning**: These rules are only for development. For production, implement proper security rules.

## 5. Deploy to Netlify

1. Build your app: `npm run build`
2. In Netlify, go to "Site settings" → "Environment variables"
3. Add all your environment variables (without the `VITE_` prefix in Netlify)
4. Redeploy your site

Your app should now work correctly! 