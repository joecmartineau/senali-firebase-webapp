#!/bin/bash

# Build and Deploy Senali to Firebase
echo "🚀 Building and deploying Senali to Firebase..."

# Step 1: Build the frontend
echo "📦 Building frontend..."
npm run build

# Step 2: Install Firebase Functions dependencies
echo "📦 Installing Firebase Functions dependencies..."
cd functions
npm install --legacy-peer-deps
npm run build
cd ..

# Step 3: Set OpenAI API Key in Firebase Functions config
echo "🔑 Setting OpenAI API Key..."
firebase functions:config:set openai.key="$OPENAI_API_KEY"

# Step 4: Deploy to Firebase
echo "🚀 Deploying to Firebase..."
echo "Note: Make sure you're logged in with 'firebase login' first"
firebase deploy

echo "✅ Deployment complete! Your app is now available at:"
echo "   🌐 https://senali-235fb.web.app"
echo "   🌐 https://senali-235fb.firebaseapp.com"

echo ""
echo "📝 Manual setup instructions:"
echo "1. Run 'firebase login' to authenticate"
echo "2. Run 'firebase use senali-235fb' to select the project"
echo "3. Run 'firebase functions:config:set openai.key=YOUR_OPENAI_KEY'"
echo "4. Run 'firebase deploy' to deploy everything"