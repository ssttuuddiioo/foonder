# Deployment Guide

⚠️ **SECURITY WARNING**: Never commit API keys to your repository. Always use environment variables and apply proper restrictions to your API keys in the Google Cloud Console.

## Environment Variables for Production

When deploying to Netlify, you need to set these environment variables in your Netlify dashboard:

### Firebase Configuration
```
VITE_FIREBASE_API_KEY=your-firebase-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=foonder-7f9f7.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://foonder-7f9f7-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=foonder-7f9f7
VITE_FIREBASE_STORAGE_BUCKET=foonder-7f9f7.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=538428639841
VITE_FIREBASE_APP_ID=1:538428639841:web:948e2973bc08fbdea8b820
```

### Google Places API
```
VITE_GOOGLE_PLACES_API_KEY=your-google-places-api-key-here
```

## API Key Security Setup

**CRITICAL**: Before deploying, secure your Google Maps Platform API keys:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your foonder project
3. For each API key, click to edit and apply these restrictions:
   - **Application restrictions**: HTTP referrers (web sites)
   - **Website restrictions**: Add your domains:
     ```
     https://your-domain.com/*
     https://your-app.netlify.app/*
     http://localhost:5173/*
     ```
   - **API restrictions**: Limit to only the APIs you use:
     - Maps JavaScript API
     - Places API
     - Places API (New)
     - Geocoding API

## Netlify Deployment Steps

1. Go to https://app.netlify.com/
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. **IMPORTANT**: Add all environment variables above in Site settings → Environment variables (use your actual API key values)
6. Deploy!

## Local Development

1. Make sure you have Node.js 18+ installed
2. Run `npm install`
3. Create `.env.local` file with the environment variables above
4. Run `npm run dev`
5. Open http://localhost:5173

## Firebase Database Rules

Make sure your Firebase Realtime Database rules allow read/write access:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

For production, you should implement proper authentication and security rules. 