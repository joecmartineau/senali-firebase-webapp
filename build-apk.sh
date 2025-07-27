#!/bin/bash

echo "🚀 Building Senali APK..."

# Step 1: Build the web application
echo "📦 Building web application..."
npm run build

# Step 2: Initialize Capacitor (if not already done)
if [ ! -d "android" ]; then
    echo "🔧 Initializing Capacitor..."
    npx cap init "Senali" "com.senali.app" --web-dir="dist/public"
fi

# Step 3: Add Android platform (if not already added)
if [ ! -d "android" ]; then
    echo "📱 Adding Android platform..."
    npx cap add android
fi

# Step 4: Sync the web files to native projects
echo "🔄 Syncing files to Android project..."
npx cap sync android

# Step 5: Open Android Studio for APK build
echo "🏗️ Opening Android Studio..."
echo ""
echo "NEXT STEPS:"
echo "1. Android Studio will open"
echo "2. In Android Studio, go to Build → Build Bundle(s) / APK(s) → Build APK(s)"
echo "3. The APK will be generated in android/app/build/outputs/apk/debug/"
echo "4. Transfer the APK to your phone and install"
echo ""

npx cap open android