# Mobile Installation Guide for Senali

## For Google Play Store Submission

### 1. Prerequisites
- Android Studio installed
- Firebase project configured (senali-235fb)
- AdMob account set up
- Google Play Console account

### 2. Build Steps

#### A. Build for Production
```bash
# Clean and build
npm run build

# Sync with Capacitor  
npx cap sync android

# Open in Android Studio
npx cap open android
```

#### B. In Android Studio
1. **Generate Signed APK**:
   - Build → Generate Signed Bundle/APK
   - Choose APK (for direct installation testing)
   - Create new keystore or use existing

2. **Keystore Information**:
   - Store as `senali-release-key.keystore`
   - Keep keystore password safe (needed for updates)
   - Alias: `senali-key`

3. **Build Configuration**:
   - Build variant: `release`
   - Signature versions: V1 and V2
   - Output: `app-release.apk`

### 3. Google Play Console Setup

#### A. Create New App
- App name: "Senali - AI Parenting Coach"
- Package name: `com.senali.app`
- Category: Parenting
- Content rating: Everyone

#### B. Store Listing
```
Title: Senali - AI Parenting Coach
Short description: Your empathetic AI parenting companion for family support and guidance

Full description:
Senali is your personal AI parenting coach, designed to provide empathetic support and practical guidance for families. Whether you need someone to listen, advice on parenting challenges, or daily tips for family well-being, Senali is here to help.

Key Features:
• Empathetic AI conversations tailored to your family
• Personalized parenting guidance and support
• Daily tips for emotional well-being and family relationships  
• Private and secure - your conversations stay with you
• Credit-based system for affordable access
• Mobile-optimized for busy parents

Perfect for parents who need:
- Emotional support and active listening
- Practical parenting strategies
- Daily inspiration and guidance
- A non-judgmental space to share concerns
- Professional insights without medical advice

Download Senali today and discover a supportive companion for your parenting journey.
```

#### C. Graphics Requirements
- App icon: 512x512 px (use infinity symbol logo)
- Feature graphic: 1024x500 px
- Screenshots: 
  - Phone: 16:9 or 18:9 ratio, minimum 320px
  - Tablet: 1200x1920 px minimum
  - At least 2 screenshots required

### 4. App Store Optimization (ASO)

#### Keywords
- Primary: AI parenting coach, parenting app, family support
- Secondary: parenting advice, family guidance, parenting tips
- Long-tail: AI companion for parents, empathetic parenting support

#### Screenshots to Include
1. Chat interface with Senali
2. Credit purchase screen
3. Daily tips feature
4. Profile/family setup
5. Mobile responsive design

### 5. Monetization Setup

#### A. In-App Products (Google Play)
Create these managed products:
```
Product ID: credits_100
Name: 100 Credits
Description: 100 message credits for AI chat
Price: $0.99

Product ID: credits_500  
Name: 500 Credits
Description: 500 message credits for AI chat
Price: $4.99

Product ID: credits_1000
Name: 1000 Credits  
Description: 1000 message credits for AI chat
Price: $7.99
```

#### B. AdMob Integration
1. Create AdMob app for "Senali - AI Parenting Coach"
2. Get production app ID
3. Create banner ad units
4. Update `capacitor.config.ts` with production IDs
5. Remove test device configurations

### 6. Testing Before Launch

#### Internal Testing
1. Upload APK to Play Console
2. Create internal testing track
3. Add test users (your email)
4. Test all features:
   - Sign in with Google
   - AI chat functionality  
   - Credit purchases
   - AdMob ads display
   - Offline functionality

#### Quality Checklist
- [ ] App launches without crashes
- [ ] Google Sign-in works
- [ ] Chat sends/receives messages
- [ ] Credits deduct properly
- [ ] Purchase flow works
- [ ] Ads display correctly
- [ ] Responsive on different screen sizes
- [ ] Handles network connectivity issues
- [ ] Privacy policy accessible
- [ ] Terms of service accessible

### 7. Launch Strategy

#### Phase 1: Internal Testing (1 week)
- Test with small group
- Fix any critical bugs
- Optimize performance

#### Phase 2: Closed Testing (1-2 weeks)  
- Expand to 20-50 testers
- Gather feedback on UX
- Test monetization features

#### Phase 3: Open Testing (Optional)
- Public testing track
- Gather broader feedback
- Marketing preparation

#### Phase 4: Production Release
- Submit for review
- Monitor crash reports
- Respond to user reviews
- Track KPIs (downloads, revenue, retention)

### 8. Post-Launch Monitoring

#### Key Metrics
- Daily/monthly active users
- Credit purchase conversion rate
- AdMob revenue per user
- App store rating and reviews
- Crash-free rate
- Session duration

#### Optimization
- A/B test purchase prices
- Optimize ad placement
- Improve user onboarding
- Add features based on feedback
- Regular content updates

### 9. Legal Requirements

#### Privacy Policy
Include information about:
- Data collection (minimal - only authentication)
- Use of cookies and analytics
- Third-party services (Firebase, OpenAI, AdMob)
- User rights and data deletion
- Contact information

#### Terms of Service
Cover:
- Service description
- User responsibilities
- Payment terms for credits
- Content guidelines
- Limitation of liability
- Medical disclaimer

### 10. Support & Maintenance

#### User Support
- In-app help documentation
- Email support contact
- FAQ section
- Response time commitments

#### Regular Updates
- Monthly feature releases
- Bug fixes and performance improvements
- Security updates
- Content refreshes

This guide ensures a smooth path from development to Google Play Store success!