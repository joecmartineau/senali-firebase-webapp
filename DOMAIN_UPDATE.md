# Firebase Domain Update Required

## Current Error
```
Sign-in failed: Firebase: Error (auth/unauthorized-domain).
```

## New Domain to Add
Your Replit domain has changed to:
```
90f4a26a-a228-46f5-b2c8-faf04eea1e97.riker.prod.repl.run
```

## Steps to Fix

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: **senali-235fb**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add this exact domain:
   ```
   90f4a26a-a228-46f5-b2c8-faf04eea1e97.riker.prod.repl.run
   ```
6. Click **Add** and **Save**

## After Adding Domain
- Wait 1-2 minutes for changes to take effect
- Try the Google sign-in button again

The authentication should work once this domain is added to Firebase.