#!/bin/bash

echo "🔥 Building Senali for Firebase Deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf build/

# Build the React app for production
echo "⚛️ Building React app..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Build files are in the 'dist' directory"

# Initialize Firebase if not already done
if [ ! -f ".firebaserc" ]; then
    echo "🔥 Initializing Firebase..."
    firebase init hosting
else
    echo "🔥 Firebase already initialized"
fi

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "🎉 Deployment complete!"
echo "🌐 Your app is live at: https://senali-235fb.web.app"
echo "🌐 Custom domain: https://senali-235fb.firebaseapp.com"