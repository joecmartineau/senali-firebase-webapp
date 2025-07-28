# Senali App - Complete Download Guide for Deployment

## Overview
This guide helps you download all source files from your Replit project for external deployment. Since this is a React + Express project with a build step, you need the **source code**, not the built output.

## Essential Files to Download

### 1. Root Configuration Files
```
package.json              - Main dependencies and scripts
package-lock.json         - Exact dependency versions
tsconfig.json            - TypeScript configuration
vite.config.ts           - Vite build configuration
tailwind.config.ts       - Tailwind CSS configuration
postcss.config.js        - PostCSS configuration
components.json          - shadcn/ui configuration
capacitor.config.ts      - Capacitor mobile app configuration
drizzle.config.ts        - Database configuration
replit.md               - Project documentation
```

### 2. Frontend Source Code (`client/` folder)
```
client/
├── index.html                 - Main HTML entry point
├── public/
│   ├── manifest.json         - PWA manifest
│   ├── sw.js                 - Service worker
│   └── clear-cache.js        - Cache management
└── src/
    ├── App.tsx              - Main React app component
    ├── index.css            - Global styles
    ├── main.tsx            - React entry point
    ├── components/          - All React components
    ├── pages/              - Page components
    ├── hooks/              - Custom React hooks
    ├── lib/                - Utility libraries
    └── assets/             - Static assets (if any)
```

### 3. Backend Source Code (`server/` folder)
```
server/
├── index.ts                 - Express server entry point
├── routes.ts               - API routes
├── storage.ts              - Database operations
├── openai.ts              - AI integration
├── db.ts                  - Database connection
├── firebase-admin.ts      - Firebase admin setup
├── firebase-auth.ts       - Firebase authentication
├── firebase-storage.ts    - Firebase storage
├── middleware/            - Express middleware
├── routes/               - Route handlers
└── services/             - Business logic services
```

### 4. Shared Code (`shared/` folder)
```
shared/
└── schema.ts               - Database schema and types
```

### 5. Mobile App Configuration (`android/` folder)
```
android/
├── app/
│   ├── src/main/AndroidManifest.xml    - Android permissions
│   └── google-services.json           - Firebase config
└── capacitor.settings.gradle          - Capacitor settings
```

### 6. Firebase Functions (`functions/` folder)
```
functions/
├── package.json           - Functions dependencies
├── src/
│   └── index.ts          - Firebase functions
└── tsconfig.json         - Functions TypeScript config
```

## Files to EXCLUDE (Don't Download)

### Build Output (these will be regenerated)
```
dist/                     - Built frontend/backend
node_modules/            - Dependencies (will be reinstalled)
android/app/src/main/assets/public/  - Built mobile assets
.cache/                  - Build cache
```

### Environment/Development Files
```
.env                     - Environment variables (contains secrets)
api-server.pid          - Process ID file
cookies.txt             - Temporary cookies
.replit                 - Replit-specific config
.git/                   - Git history (if you want fresh git)
```

### Generated/Temporary Files
```
attached_assets/         - Screenshots and temporary files
*.md files              - Documentation (optional, but recommended to keep)
test-*.js              - Test files (optional)
debug-*.js             - Debug files (optional)
build-*.sh             - Build scripts (optional)
```

## Step-by-Step Download Instructions

### Method 1: Download Individual Files/Folders

1. **In your Replit project, open the file explorer**
2. **Download these folders one by one:**
   - Right-click on `client/` → Download
   - Right-click on `server/` → Download
   - Right-click on `shared/` → Download
   - Right-click on `functions/` → Download
   - Right-click on `android/` → Download

3. **Download these individual files:**
   - `package.json`
   - `package-lock.json`
   - `tsconfig.json`
   - `vite.config.ts`
   - `tailwind.config.ts`
   - `postcss.config.js`
   - `components.json`
   - `capacitor.config.ts`
   - `drizzle.config.ts`
   - `replit.md`

### Method 2: Use Replit's Built-in Download

1. **Click the three dots menu (⋯) in your Replit project**
2. **Select "Download as ZIP"**
3. **Extract the ZIP file**
4. **Delete the excluded folders/files listed above**

## Important Notes

### Environment Variables
Your app uses these environment variables that you'll need to set up in your new deployment:
```
DATABASE_URL              - PostgreSQL database
OPENAI_API_KEY           - OpenAI API access
VITE_FIREBASE_API_KEY    - Firebase config (public)
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
FIREBASE_ADMIN_PRIVATE_KEY - Firebase admin (private)
```

### Build Process
After downloading, your deployment platform will:
1. Run `npm install` to install dependencies
2. Run `npm run build` to build the React frontend
3. Run the Express server to serve the app

### Mobile App
The `android/` folder contains your mobile app configuration for Google Play Store deployment. Make sure to include:
- `AndroidManifest.xml` with billing permissions
- `google-services.json` for Firebase
- `capacitor.config.ts` for Capacitor configuration

## Verification Checklist

After downloading, verify you have:
- ✅ `package.json` with all dependencies
- ✅ `client/src/` folder with React components
- ✅ `server/` folder with Express routes
- ✅ `shared/schema.ts` for database types
- ✅ Configuration files (vite.config.ts, tailwind.config.ts, etc.)
- ✅ Android app files for Play Store
- ✅ Firebase functions for serverless backend

## Next Steps

1. **Download all files using the guide above**
2. **Set up your deployment platform (Vercel, Netlify, etc.)**
3. **Configure environment variables**
4. **Deploy your app**
5. **Build and deploy Android APK for Play Store**

Your Senali app is ready for production deployment with Play Store credit purchasing system!