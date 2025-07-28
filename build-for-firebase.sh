#!/bin/bash

echo "🔥 Building Senali for Firebase deployment..."

# Clean previous builds
rm -rf dist/
rm -rf functions/dist/

# Build the client for production
echo "📦 Building React client..."
npm run build

# Build Firebase Functions
echo "⚡ Building Firebase Functions..."
cd functions
npm run build
cd ..

# Copy client build to Firebase hosting directory
echo "📋 Preparing Firebase hosting files..."
mkdir -p dist/public
cp -r dist/* dist/public/ 2>/dev/null || true

echo "✅ Build complete! Ready for Firebase deployment."
echo "🚀 Run 'firebase deploy' to deploy to Firebase."