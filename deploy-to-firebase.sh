#!/bin/bash

echo "🚀 Deploying Senali to Firebase..."

# Step 1: Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors first."
    exit 1
fi

echo "✅ Build completed successfully"

# Step 2: Deploy to Firebase
echo "🔥 Deploying to Firebase..."

# Try Firebase login first
firebase login --reauth

if [ $? -ne 0 ]; then
    echo "❌ Firebase login failed"
    echo "💡 Please run 'firebase login' manually to authenticate"
    exit 1
fi

# Deploy to Firebase
firebase deploy

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo "🌐 Your app is now live at: https://senali-235fb.web.app"
    echo "🌐 Alternative URL: https://senali-235fb.firebaseapp.com"
    echo ""
    echo "Next steps:"
    echo "1. Test your live app at the URLs above"
    echo "2. Build Android APK: npx cap sync android && npx cap open android"
    echo "3. Upload APK to Google Play Store"
else
    echo "❌ Deployment failed"
    echo "💡 You may need to run this script from a local machine with proper Firebase authentication"
fi