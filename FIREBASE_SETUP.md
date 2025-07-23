# Firebase Domain Authorization Fix

## Your Current Replit Domain
```
https://ccc925b9-b323-4a62-a912-9fa986aa61b2-00-7o91rpr58i7d.riker.replit.dev
```

## Steps to Fix "Google sign-in will be enabled once Firebase configuration is fixed!" Error

### 1. Go to Firebase Console
- Visit: https://console.firebase.google.com/
- Select your project: **senali-235fb**

### 2. Add Authorized Domain
1. Click **Authentication** in the left sidebar
2. Click **Settings** tab
3. Scroll down to **Authorized domains** section
4. Click **Add domain**
5. Paste this exact domain:
   ```
   ccc925b9-b323-4a62-a912-9fa986aa61b2-00-7o91rpr58i7d.riker.replit.dev
   ```
6. Click **Add**
7. Click **Save** to confirm changes

### 3. Verify Google Sign-in is Enabled
1. In Firebase Console → Authentication
2. Click **Sign-in method** tab
3. Ensure **Google** is **Enabled**
4. If not enabled, click on Google → Enable → Save

### 4. Additional Domains to Add (for future use)
- `localhost` (for local testing)
- Any custom domains you plan to use

### 5. After Adding Domain
- Wait 1-2 minutes for changes to propagate
- Refresh your Replit app
- Try the "Continue with Google" button

## Current Firebase Configuration
- Project ID: senali-235fb
- Auth Domain: senali-235fb.firebaseapp.com
- App ID: 1:67286745357:web:ec18d40025c29e2583b044

## Troubleshooting
If you still get errors after adding the domain:
1. Try in incognito/private browser window
2. Clear browser cache
3. Check Firebase Console for any error messages
4. Verify the domain was saved correctly in Firebase