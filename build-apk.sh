#!/bin/bash

echo "📱 Building Senali APK for Google Play Store..."

# First build for Firebase
./build-for-firebase.sh

# Build for Capacitor/Android
echo "🔧 Building for Capacitor..."
npm run build

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# Open Android Studio for final build and signing
echo "🎯 Opening Android Studio..."
echo "In Android Studio:"
echo "1. Build > Generate Signed Bundle/APK"
echo "2. Choose APK"
echo "3. Create/select your keystore"
echo "4. Build release APK"
echo "5. Upload APK to Google Play Console"

npx cap open android