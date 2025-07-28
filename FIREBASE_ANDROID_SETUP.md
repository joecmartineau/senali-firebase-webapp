# Firebase Android Registration Information

## For the 3 boxes in Firebase Console:

### 1. Android package name (Required)
```
com.senali.app
```

### 2. App nickname (Optional)
```
Senali Android App
```

### 3. Debug signing certificate SHA-1 (Optional)
To get your SHA-1 certificate fingerprint:

**Method 1: Using Keytool (Recommended)**
```bash
keytool -list -v -alias androiddebugkey -keystore ~/.android/debug.keystore
```
- Default password: `android`
- Look for the SHA-1 fingerprint in the output

**Method 2: Using Android Studio**
1. Open your project in Android Studio
2. Click on "Gradle" tab (usually on the right side)
3. Navigate to: Your App → Tasks → android → signingReport
4. Double-click signingReport
5. Check the "Gradle Console" for SHA-1 fingerprint

**Method 3: Generate new debug keystore if needed**
```bash
keytool -genkey -v -keystore ~/.android/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

### Example SHA-1 format:
```
SHA1: A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0
```

## Next Steps After Registration:

1. **Download google-services.json**
   - Download the config file from Firebase Console
   - Place it in `android/app/` directory

2. **Update Capacitor Config**
   - The app is already configured with package name `com.senali.app`
   - Firebase project ID: `senali-235fb`

3. **Build and Test**
   ```bash
   npm run build
   npx cap sync android
   npx cap open android
   ```

4. **For Production Release**
   - Generate release keystore
   - Get production SHA-1 fingerprint
   - Add production SHA-1 to Firebase Console
   - Update AdMob with production app ID

## Troubleshooting

- If SHA-1 is missing, you can still register and add it later
- Debug SHA-1 is only needed for development builds
- Production builds need a different (release) SHA-1 certificate