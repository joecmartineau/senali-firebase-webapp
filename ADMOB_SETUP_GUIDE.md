# AdMob Setup Guide for Senali

## Overview
AdMob banner advertisements have been implemented at the top and bottom of the screen to monetize the completely free Senali app. This guide covers setup, testing, and deployment.

## Current Implementation

### Components Added
- `client/src/components/ads/AdMobBanner.tsx` - Main AdMob banner component
- Integrated into `client/src/pages/chat.tsx` at top and bottom positions
- Capacitor configuration updated for AdMob support

### Features
- **Web/PWA Mode**: Shows placeholder advertisement banners
- **Mobile Native**: Displays real AdMob banner ads via Capacitor plugin
- **Responsive Design**: Adapts to top and bottom screen positions
- **Error Handling**: Falls back to placeholder on AdMob initialization errors

## Setup for Production

### 1. Get Your AdMob Account
1. Visit [Google AdMob Console](https://admob.google.com/)
2. Sign in with your Google account
3. Create a new AdMob app for "Senali"
4. Note your **App ID** and **Ad Unit IDs**

### 2. Replace Test IDs with Production IDs

#### Update Capacitor Config
In `capacitor.config.ts`, replace:
```typescript
AdMob: {
  appId: "ca-app-pub-3940256099942544~3347511713", // REPLACE WITH YOUR APP ID
  initializeForTesting: true, // REMOVE THIS LINE
}
```

#### Update Ad Unit IDs
In `client/src/components/ads/AdMobBanner.tsx`, replace:
```typescript
const defaultAdIds = {
  android: 'ca-app-pub-XXXXXXXX/YYYYYYYYYY', // Your Android banner ad unit ID
  ios: 'ca-app-pub-XXXXXXXX/YYYYYYYYYY',     // Your iOS banner ad unit ID
  web: 'ca-app-pub-XXXXXXXX/YYYYYYYYYY'     // Fallback for web testing
};
```

### 3. Remove Testing Flags
Remove these lines from production:
```typescript
isTesting: true, // Remove this line
initializeForTesting: true, // Remove this line
```

### 4. Add Your Test Device ID
Replace `'YOUR_DEVICE_ID'` with your actual device ID for testing:
```typescript
testingDevices: ['YOUR_ACTUAL_DEVICE_ID'],
```

## Mobile Deployment

### Android Setup
1. Run `npx cap add android` (if not already added)
2. Run `npx cap sync android`
3. Open Android Studio: `npx cap open android`
4. Add AdMob dependency to `android/app/build.gradle`:
   ```gradle
   implementation 'com.google.android.gms:play-services-ads:22.6.0'
   ```
5. Add AdMob App ID to `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <meta-data
       android:name="com.google.android.gms.ads.APPLICATION_ID"
       android:value="ca-app-pub-XXXXXXXX~YYYYYYYYYY"/>
   ```

### iOS Setup
1. Run `npx cap add ios` (if not already added)
2. Run `npx cap sync ios`
3. Open Xcode: `npx cap open ios`
4. Add AdMob SDK via CocoaPods or Swift Package Manager
5. Add AdMob App ID to `ios/App/App/Info.plist`:
   ```xml
   <key>GADApplicationIdentifier</key>
   <string>ca-app-pub-XXXXXXXX~YYYYYYYYYY</string>
   ```

## Revenue Optimization

### Ad Placement Strategy
- **Top Banner**: Visible during app usage, non-intrusive
- **Bottom Banner**: Above input area, maintains usability
- **Refresh Rate**: Standard AdMob refresh (30-120 seconds)

### Expected Revenue
- **Banner CPM**: $0.50 - $2.00 (varies by region/audience)
- **Daily Active Users**: Target 1,000+ for meaningful revenue
- **Revenue Estimate**: $1-10 per day per 1,000 DAU

### Best Practices
1. **User Experience**: Ads don't interfere with core chat functionality
2. **Ad Frequency**: Banner ads are persistent but not overwhelming
3. **Ad Quality**: AdMob automatically filters inappropriate content
4. **Performance**: Minimal impact on app loading/performance

## Testing

### Test Mode Features
- Uses Google's test ad units (safe for testing)
- No risk of invalid clicks during development
- Same visual appearance as production ads

### Testing Checklist
- [ ] Ads display correctly on web/PWA
- [ ] Ads display correctly on Android
- [ ] Ads display correctly on iOS
- [ ] Fallback placeholders work when AdMob fails
- [ ] App functions normally with ads present
- [ ] No interference with chat input/display

## Deployment Steps

### Before Production Launch
1. ✅ Replace all test IDs with production IDs
2. ✅ Remove testing flags and initialization options
3. ✅ Add real device IDs for testing
4. ✅ Test on physical devices with production ads
5. ✅ Verify AdMob policy compliance
6. ✅ Submit app for AdMob review (if required)

### Post-Launch Monitoring
- Monitor AdMob dashboard for revenue/performance
- Track user engagement impact from ads
- Adjust ad placement if user complaints arise
- Monitor for policy violations or ad quality issues

## Troubleshooting

### Common Issues
1. **Ads not showing**: Check internet connection, ad unit IDs, app setup
2. **Testing ads in production**: Ensure test flags are removed
3. **Policy violations**: Review AdMob policies for chat/AI apps
4. **Low revenue**: Optimize user engagement, check targeting settings

### Support Resources
- [AdMob Documentation](https://developers.google.com/admob)
- [Capacitor AdMob Plugin](https://github.com/capacitor-community/admob)
- [Google AdMob Support](https://support.google.com/admob)

## Current Status
✅ AdMob implementation complete
✅ Web/PWA placeholder ads working
✅ Mobile native integration ready
⏳ Waiting for production AdMob account setup
⏳ Waiting for real ad unit IDs