# API Key Security Guide

This guide addresses the security warning from Google Maps Platform about unrestricted API keys.

## ⚠️ URGENT: Security Issues to Address

Based on the Google email, your foonder project has these security issues:

### API Key 2 (533e4181-2077-4782-906b-5c70349c1c22)
- **Status**: Needs to be split between incompatible services
- **Used with**: Geocoding API, Maps JavaScript API, Places API, Places API (New)
- **Issue**: Mixed usage that requires incompatible restrictions

### API Key 3 (e22f691b-cdef-47ac-bb94-6841f14226e3)  
- **Status**: Can use automatic restrictions
- **Used with**: Geocoding API, Maps JavaScript API, Places API
- **Solution**: Apply website restrictions

## Step-by-Step Security Fix

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/apis/credentials
- Select project: **foonder (foonder-7f9f7)**

### 2. Apply Website Restrictions

For your existing API keys, apply these restrictions:

#### Application Restrictions
- Select: **"HTTP referrers (web sites)"**
- Add these domains:
  ```
  https://your-production-domain.com/*
  https://your-netlify-app.netlify.app/*
  http://localhost:5173/*
  http://localhost:3000/*
  ```

#### API Restrictions  
Limit each key to only these APIs:
- Maps JavaScript API
- Places API
- Places API (New)  
- Geocoding API

### 3. If You Need to Split Keys

If Google recommends splitting your keys (for API key 2), create separate keys:

**Key 1: Client-side JavaScript** 
- Restriction: HTTP referrers (websites)
- APIs: Maps JavaScript API, Geocoding API
- Usage: Browser-based geocoding

**Key 2: Server-side HTTP** 
- Restriction: IP addresses (if using server) OR HTTP referrers
- APIs: Places API (New)
- Usage: HTTP requests to Places API

### 4. Update Your Environment Variables

In your production environment (Netlify), update:
```
VITE_GOOGLE_PLACES_API_KEY=your-restricted-api-key-here
```

### 5. Test Your Application

After applying restrictions:
1. Deploy your app with the restricted keys
2. Test all functionality:
   - ZIP code to coordinates conversion
   - Restaurant search
   - Photo loading
3. Verify no API errors in browser console

## Security Best Practices

### ✅ Do This
- Use environment variables for all API keys
- Apply website restrictions to all client-side keys
- Regularly review API key usage in Google Cloud Console
- Monitor API usage for unexpected spikes
- Use separate keys for different environments (dev/staging/prod)

### ❌ Never Do This
- Commit API keys to version control
- Use unrestricted API keys in production
- Share API keys in documentation or chat
- Use the same key across multiple unrelated projects

## Monitoring

Set up monitoring in Google Cloud Console:
1. Go to APIs & Services > Credentials
2. Click on your API key
3. Review usage metrics
4. Set up billing alerts if usage exceeds expected amounts

## Emergency Response

If you suspect unauthorized API usage:
1. **Immediately** regenerate the API key in Google Cloud Console
2. Update the new key in your production environment
3. Review billing for unexpected charges
4. Check access logs in Google Cloud Console

## Environment Variable Security

### Local Development (.env.local)
```env
# Never commit this file
VITE_GOOGLE_PLACES_API_KEY=your-dev-api-key
VITE_FIREBASE_API_KEY=your-firebase-key
```

### Production (Netlify)
Set environment variables in Netlify dashboard:
- Site Settings > Environment Variables
- Use your production API keys (restricted)

## Verification Checklist

After implementing security measures:

- [ ] API keys removed from all committed files
- [ ] Website restrictions applied to all keys
- [ ] API restrictions limit access to only needed services
- [ ] Environment variables updated in production
- [ ] Application tested and working
- [ ] Billing alerts configured
- [ ] Usage monitoring enabled

---

**Need Help?** Contact Google Maps Platform Support if you encounter issues with API restrictions. 