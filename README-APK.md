# 📱 Senali Mobile App - APK Build Guide

## Quick Start (Recommended)

The easiest way to get Senali on your phone is as a **Progressive Web App (PWA)**:

1. **Open your phone's browser** (Chrome, Safari, etc.)
2. **Go to your deployed Senali URL** (e.g., `your-app.replit.app`)
3. **Tap "Add to Home Screen"** when prompted, or use browser menu → "Install App"
4. **Launch Senali** from your home screen like any other app!

The PWA version has all the features of a native app and works offline.

---

## Full APK Build (Advanced)

For a traditional APK file, follow these steps:

### Prerequisites

1. **Install Android Studio**: Download from [developer.android.com](https://developer.android.com/studio)
2. **Install Java Development Kit (JDK)**: Version 8 or higher
3. **Enable USB Debugging** on your Android device (Developer Options)

### Build Steps

1. **Run the build script**:
   ```bash
   ./build-apk.sh
   ```

2. **In Android Studio**:
   - Wait for project to load and sync
   - Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - Wait for build to complete

3. **Find your APK**:
   - Location: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Transfer this file to your phone
   - Install by tapping the APK file

### Alternative: Firebase App Distribution

You can also distribute the APK through Firebase:

```bash
# Build APK
./build-apk.sh

# Upload to Firebase App Distribution
firebase appdistribution:distribute android/app/build/outputs/apk/debug/app-debug.apk \
  --app 1:234567890:android:0a1b2c3d4e5f67890 \
  --testers "your-email@example.com"
```

---

## Features in Mobile App

✅ **Offline Support** - Chat and profiles work without internet  
✅ **Push Notifications** - Get notified of daily tips  
✅ **Native Feel** - Fullscreen, native navigation  
✅ **Fast Performance** - Cached resources load instantly  
✅ **Home Screen Icon** - Launch like any other app  
✅ **Auto-updates** - App updates automatically from web

---

## Troubleshooting

**"App not installing"**: Enable "Install from Unknown Sources" in Android settings

**"Build failed"**: Make sure Android Studio and JDK are properly installed

**"Can't find APK"**: Check `android/app/build/outputs/apk/debug/` folder

**PWA not installing**: Use Chrome/Safari browser, some browsers don't support PWA installation

---

**Recommended**: Start with the PWA version - it's easier and has all the same features!