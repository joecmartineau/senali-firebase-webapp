#!/bin/bash

echo "🔥 Building Senali for Firebase deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf functions/lib/

# Install Firebase CLI if not present
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Build the client application
echo "⚛️ Building React client..."
npm run build

# Build Firebase Functions
echo "🔧 Building Firebase Functions..."
cd functions
npm install
npm run build
cd ..

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy

echo "✅ Firebase deployment complete!"
echo "🌐 Your app is now live at: https://senali-235fb.web.app"