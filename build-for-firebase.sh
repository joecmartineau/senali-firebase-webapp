#!/bin/bash

echo "🔥 Building Senali for Firebase deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf functions/lib

# Build the client
echo "🏗️ Building React client..."
npm run build

# Build Firebase Functions
echo "⚡ Building Firebase Functions..."
cd functions
npm run build
cd ..

# Set Firebase API key in environment
echo "🔑 Setting up Firebase configuration..."
firebase functions:config:set openai.key="$OPENAI_API_KEY"

echo "✅ Build complete! Ready for Firebase deployment."
echo "💡 Run 'firebase deploy' to deploy to Firebase Hosting + Functions"