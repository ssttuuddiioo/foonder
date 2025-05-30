# Deployment Guide

## Environment Variables for Production

When deploying to Netlify, you need to set these environment variables in your Netlify dashboard:

### Firebase Configuration
```
VITE_FIREBASE_API_KEY=AIzaSyAkFWON93B5GU2C4V-xDoQdTYngBx3801k
VITE_FIREBASE_AUTH_DOMAIN=foonder-7f9f7.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://foonder-7f9f7-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=foonder-7f9f7
VITE_FIREBASE_STORAGE_BUCKET=foonder-7f9f7.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=538428639841
VITE_FIREBASE_APP_ID=1:538428639841:web:948e2973bc08fbdea8b820
```

### Google Places API
```
VITE_GOOGLE_PLACES_API_KEY=AIzaSyB1ihVW0_NxX8-2e_JsrhrvJUcnjh97mQU
```

## Netlify Deployment Steps

1. Go to https://app.netlify.com/
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add all environment variables above in Site settings → Environment variables
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