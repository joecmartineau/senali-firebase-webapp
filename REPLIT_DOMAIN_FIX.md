# Replit Domain Fix for Firebase Auth

## Current Issue
The Google redirect is failing because it's trying to use HTTPS but the domain resolution is failing.

## Current Domain
Your domain appears to be: `90f4a26a-a228-46f5-b2c8-faf04eea1e97.riker.prod.repl.run`

## Firebase Console Update Needed

Add BOTH HTTP and HTTPS versions to Firebase authorized domains:

1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add these domains:
   - `90f4a26a-a228-46f5-b2c8-faf04eea1e97.riker.prod.repl.run`
   - `http://90f4a26a-a228-46f5-b2c8-faf04eea1e97.riker.prod.repl.run` (if needed)

## Code Changes Applied
- Added custom redirect URI configuration
- Enhanced Google provider setup for Replit compatibility
- Added proper domain detection

This should resolve the "This site can't be reached" error during Google sign-in redirect.