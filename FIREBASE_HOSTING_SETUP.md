# Firebase Hosting Setup for Senali

## Project Configuration
- **Project ID**: senali-235fb
- **Firebase Domain**: senali-235fb.firebaseapp.com
- **Custom Domain**: senali-235fb.web.app

## Firebase Console Setup

### 1. Authentication Setup
Go to Firebase Console → Authentication → Settings → Authorized domains
Add these domains:
- `senali-235fb.firebaseapp.com` (primary Firebase domain)
- `senali-235fb.web.app` (custom Firebase domain)
- `localhost` (for local development)

### 2. Hosting Configuration
The app is already configured for Firebase hosting in `firebase.json`:
- Build output: `dist/public`
- Routing: SPA with history API fallback
- Service worker caching configured

## Deployment Commands

```bash
# Build the frontend for Firebase hosting
vite build

# Deploy to Firebase (make sure you're in the project directory)
firebase use senali-235fb
firebase deploy --only hosting

# Or deploy with specific project override
firebase deploy --only hosting --project senali-235fb
```

## Firebase CLI Setup (One-time)
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init hosting
```

## Firebase Domains After Deployment
- Primary: https://senali-235fb.firebaseapp.com
- Custom: https://senali-235fb.web.app

## Benefits of Firebase Hosting
- Stable domains that never change
- Built-in SSL/TLS certificates
- Global CDN for fast loading
- Automatic authentication domain authorization
- No more Replit domain management issues

## Current Status
✅ Firebase configuration optimized for hosting
✅ Authentication configured for Firebase domains
✅ Build process configured for Firebase deployment
✅ Service worker optimized for Firebase hosting