# Stable Domain Solution for Firebase Auth

## Problem
Replit development domains change frequently (every restart/redeploy), requiring constant updates to Firebase authorized domains.

## Solution
Use Firebase's built-in authDomain for authentication instead of Replit domains.

## Firebase Setup Required (One-time only)

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: **senali-235fb**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Ensure these domains are added:
   - `senali-235fb.firebaseapp.com` (Firebase authDomain - stable)
   - `localhost` (for development)

## How It Works
- Authentication flows through Firebase's stable domain
- No need to add changing Replit domains
- Works across all environments (dev, staging, production)

## Benefits
- One-time setup
- No more domain management headaches
- Works on any Replit domain automatically
- Production-ready approach