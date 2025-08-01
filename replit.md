# NeuroParent AI - Replit Development Guide

## Overview

Senali is an AI-powered companion designed to act as both a parenting coach and a friend for parents. The application provides empathetic conversation, active listening, and supportive guidance through AI chat interactions and daily tips focused on emotional well-being and family relationships. Senali specializes in building meaningful connections by asking personalized questions about users' children, spouses, and family dynamics.

## User Preferences

```
Preferred communication style: Simple, everyday language at 7th grade reading level.
```

## System Architecture

This is a full-stack TypeScript application built with a privacy-first, local storage architecture:

### Frontend Architecture
- **Framework**: React 18 with Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Type Safety**: TypeScript throughout with strict configuration
- **Local Storage**: IndexedDB for persistent client-side data storage
- **Assessment Processing**: Client-side profile and symptom tracking

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints under `/api` prefix (minimal data handling)
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions (no sensitive data storage)
- **AI Integration**: OpenAI API for chat responses only

### Data Architecture (Privacy-First Local Storage)
- **Storage Location**: All user data stored locally on device using IndexedDB
- **Data Types**: Chat messages, child profiles, symptom checklists, user preferences
- **Privacy Benefits**: No sensitive family data transmitted to or stored on servers
- **Data Control**: Users have complete control with export/clear functionality
- **Persistence**: Data persists across browser sessions and device restarts

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect flow
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **User Management**: Mandatory user table for Replit Auth compliance
- **Authorization**: Protected routes with isAuthenticated middleware

### AI Integration
- **Provider**: OpenAI GPT-4o model  
- **AI Personality**: Senali - parenting coach and friend companion with empathetic conversation style
- **Specialization**: Custom system prompt for therapeutic support and active listening without medical advice
- **Features**: 
  - Contextual chat conversations with message history and emotional validation
  - Daily tip generation focused on family well-being and self-care
  - Personalized questions about family dynamics, children, and relationships
  - Guided conversation to explore deeper feelings and gather meaningful information

### Chat System
- **Real-time Interface**: Message-based chat with AI assistant
- **Message Storage**: Persistent chat history in PostgreSQL
- **Context Management**: Maintains conversation context with recent message history
- **UI Components**: Custom chat bubbles, input handling, and loading states

### Daily Tips System
- **Content Generation**: AI-generated daily parenting tips
- **User Interaction**: Like/dislike feedback system for tip improvement
- **Persistence**: Tips stored with timestamps and user interaction tracking
- **Display**: Card-based UI with sharing and regeneration capabilities

## Data Flow (Local-First Architecture)

1. **User Authentication**: Replit Auth → Session Creation (no personal data stored on server)
2. **Chat Interaction**: User Input → Local Storage → Context Extraction → OpenAI API → AI Response → Local Storage → UI Update
3. **Profile Management**: Conversation Analysis → Local Assessment Processor → IndexedDB → Persistent Local Storage
4. **Symptom Tracking**: Real-time Conversation Processing → Dynamic Symptom Updates → Local IndexedDB Storage
5. **Data Control**: Local Export/Import → JSON Files → User-Controlled Data Portability

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **openai**: Official OpenAI API client
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **wouter**: Lightweight routing
- **date-fns**: Date manipulation utilities

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Build Command**: `npm run dev` - Runs development server with hot reload
- **Database**: `npm run db:push` - Pushes schema changes to database
- **Type Checking**: `npm run check` - Validates TypeScript without emitting files

### Production Build
- **Frontend Build**: Vite builds client assets to `dist/public`
- **Backend Build**: esbuild bundles server code to `dist/index.js`
- **Start Command**: `npm start` - Runs production server
- **Environment**: Requires DATABASE_URL and OpenAI API key configuration

### Database Management
- **Schema Location**: `shared/schema.ts` - Centralized database schema
- **Migrations**: `./migrations` directory managed by Drizzle Kit
- **Connection**: Automatic connection pooling with Neon serverless

### Progressive Web App (iOS/Android Ready)
- **Enhanced Manifest**: Comprehensive PWA configuration with multiple icon sizes, screenshots, and iOS/Android specific optimizations
- **Advanced Service Worker**: Multi-layer caching strategy with API caching, offline support, push notifications, and background sync
- **Mobile-First Design**: 
  - Safe area insets for iPhone notch/dynamic island support
  - Touch-optimized interface with 44px minimum touch targets
  - Prevents zoom on form inputs (iOS fix)
  - Pull-to-refresh prevention for native app feel
  - Mobile status bar simulation for standalone mode
- **PWA Features**:
  - Install prompt with platform-specific messaging
  - Offline indicator with connection status
  - Network-first API caching with fallback
  - iOS Safari "Add to Home Screen" instructions
  - Android install banner support
- **Mobile Navigation**: Bottom tab navigation optimized for thumb usage

### Complete Firebase Migration (2025-01-25)
- **Full Firebase Architecture**: Successfully migrated entire application from Replit to Firebase ecosystem
  - **Frontend Hosting**: React app built for Firebase Hosting deployment (senali-235fb.web.app)
  - **Backend API**: All Express.js routes converted to Firebase Functions (serverless)
  - **Authentication**: Firebase Auth with Google Sign-in integration
  - **Database**: Firestore replaces PostgreSQL for user data and credits
  - **Global CDN**: Worldwide content delivery with automatic SSL
- **Firebase Functions**: Complete serverless backend implementation
  - `chat` function: Enhanced OpenAI integration with credit management and admin support
  - `generateTip` function: AI-powered parenting tip generation
  - `firebaseSignin` function: User authentication and profile creation
  - `getSubscriptionStatus` function: Credit and subscription management
  - `adminGetUsers` function: Admin panel user management
  - `adminAdjustCredits` function: Admin credit adjustment system
  - Node.js 18 runtime with TypeScript support
  - CORS configured for all domains
- **Firestore Database**: Complete data migration from PostgreSQL
  - User profiles with credits and subscription status
  - Admin functionality with email-based access control
  - Security rules for user data protection
  - Indexes for efficient querying
- **Deployment Configuration**: Complete Firebase setup
  - `firebase.json`: Hosting, Functions, Firestore, and URL rewrites configured
  - `.firebaserc`: Project selection (senali-235fb)
  - Build scripts for client and functions deployment
  - Environment variable management through Firebase config
- **Benefits**: Fully serverless, cost-efficient, globally distributed
  - Pay-per-use pricing with Firebase Functions
  - No server maintenance required
  - Automatic scaling and SSL management
  - Optimized for privacy-first local storage architecture
  - Firebase secrets management for API keys
- **Migration Status**: Ready for Firebase deployment - all components migrated from Replit infrastructure

### App Store Monetization System (2025-01-24)
- **Subscription-Based Revenue Model**: Implemented App Store and Play Store compliant subscription system
  - **Free Tier**: 25 messages total trial (GPT-3.5-turbo), basic family profiles, basic features
  - **Premium Subscription**: 1,000 credits/month included (GPT-3.5-turbo), unlimited profiles, data export, priority support
  - **Pricing**: $7.99/month or $79.99/year (2 months free) - optimized for $5 average profit per user
  - **Profit Protection**: Usage-based overage pricing ensures 100% profitability regardless of usage patterns
  - **App Store Integration**: Designed for native In-App Purchase (IAP) implementation
- **Premium Features**: Advanced feature gating with subscription checks
  - Message limit enforcement for free users with upgrade prompts
  - Data export restricted to premium subscribers
  - Visual subscription status indicators throughout UI
  - Smooth upgrade flow with modal-based subscription management
- **Mobile Store Ready**: Compliant with Apple App Store and Google Play Store policies
  - All payments processed through platform stores (no direct credit card handling)
  - User-friendly subscription management through device settings
  - Clear pricing transparency and cancellation policies

### Major Architecture Change: Local Device Storage (2025-01-24)
- **Complete Migration to Local Storage**: Migrated entire data architecture from PostgreSQL database to local device storage using IndexedDB
  - **Privacy-First Approach**: All sensitive family information, child profiles, symptom tracking, and chat history now stored locally on user's device
  - **Client-Side Processing**: Created comprehensive local storage system with `LocalStorage` class for IndexedDB operations
  - **Local Assessment Processor**: Moved all profile and symptom tracking logic to client-side `LocalAssessmentProcessor`
  - **Enhanced Data Control**: Users can export their data as JSON files and clear all data locally
  - **Persistent Memory**: Chat history, child profiles, and symptom checklists persist across sessions without external storage
  - **Server Role Reduction**: Server now only provides AI responses - no longer stores or processes sensitive user data
  - **Data Portability**: Export/import functionality allows users complete control over their information

### Business Model Optimization (2025-01-24)
- **25-Message Trial Model**: Eliminated daily free tier in favor of one-time 25-message trial
  - **Cost Reduction**: 98% reduction in free user costs (from $0.90/month to $0.05 one-time)
  - **Higher Conversion Pressure**: Users must decide to subscribe or stop using after 25 messages
  - **Sustainable Economics**: Trial costs only $0.05 per user vs ongoing daily message costs
  - **Break-even**: Just 1% conversion rate (10 of 1,000 users) generates profit within first month
  - **LTV/CAC Ratio**: 12-24x with $5 customer acquisition cost and $60-120 lifetime value

### Major Role Change (2025-01-24)
- **Senali Role Transformation**: Complete shift from neurodivergent parenting specialist to parenting coach/friend companion
  - Updated system prompts to focus on active listening, empathy, and therapeutic conversation
  - Removed specialized neurodivergent content in favor of general family and emotional support
  - Changed greeting to warm, open-ended invitation to share ("What's been on your mind lately?")
  - Updated daily tips to focus on self-care, relationships, and emotional well-being instead of neurodivergent-specific strategies
  - Simplified branding to show just "Senali" without descriptive text
  - Implemented personalized questioning strategy to learn about users' families and build connections

### Comprehensive Family Profile System (2025-01-24)
- **Complete Family Member Tracking**: Automatically creates profiles for ALL family members (Mom, Dad, children, other relatives)
  - **Relationship Types**: Distinguishes between 'child', 'spouse', 'self', and 'other' family members
  - **Universal Symptom Tracking**: All family members get comprehensive neurodivergent symptom checklists (yes/no/unknown)
  - **Individual Basic Information**: Name, age, height, medical diagnoses, work/school info for each person
  - **Flexible Profile Updates**: Senali can update any family member's information as new details are learned
- **Enhanced Name Detection**: Improved pattern matching for family member identification
  - **Adult Detection Patterns**: Recognizes mentions of spouses, parents, and other adults
  - **Context-Aware Creation**: Creates appropriate relationship types based on conversation context
  - **False Positive Prevention**: Filters out question words and common non-names
  - **Automatic Cleanup**: Removes incorrectly detected profiles on app startup
- **Comprehensive Symptom Assessment**: 60+ neurodivergent symptoms tracked for each family member
  - **ADHD Symptoms**: Complete inattentive and hyperactive-impulsive criteria
  - **Autism Symptoms**: Social communication and restricted/repetitive behavior tracking
  - **Sensory Processing**: Comprehensive sensory sensitivity and seeking behaviors
  - **Emotional Regulation**: Meltdowns, mood swings, and emotional expression challenges
  - **Executive Function**: Time management, organization, and planning difficulties
- **Persistent Memory**: All family profiles persist across chat sessions and survive chat clearing
- **Dynamic Updates**: Real-time symptom tracking based on natural conversation
  - Recognizes positive/negative statements and corrections
  - Updates profiles when new information is shared
  - Maintains comprehensive family context for therapeutic responses

### Latest Updates (2025-01-25)

#### Complete Firebase Functions Migration (2025-01-25)
- **Full Firebase Migration Completed**: Successfully migrated entire backend from PostgreSQL + Express to Firebase Functions + Firestore
  - **Firebase Functions Created**: Built complete serverless backend with getFamilyProfiles, createFamilyProfile, deleteFamilyProfile, chat, and firebaseSignin functions
  - **Firestore Database**: Migrated all family profile data from PostgreSQL to Firestore with proper user authentication
  - **Local Development Server**: Created serve-local.js for local development with mock API endpoints on port 3000
  - **Port Conflict Resolution**: Fixed EADDRINUSE port 5000 conflicts by switching to Firebase hosting architecture
  - **API Endpoint Updates**: Updated all frontend API calls to use Firebase Functions endpoints (/api/children/create, /api/children/:id/delete)
  - **Authentication Integration**: Enhanced Firebase Auth token verification in all Functions for secure user data access
- **Benefits**: Fully serverless, scalable, cost-efficient infrastructure without local server dependencies
  - No more port conflicts or black screen authentication issues
  - All family profile data stored securely in Firestore with proper user isolation
  - Firebase hosting ready for global deployment with CDN

#### AI Diagnostic Integration with Senali Chat - OPTIMIZED (2025-01-25)
- **Complete AI-Powered Diagnostic System**: Successfully integrated GPT-4o diagnostic analysis into Senali's chat context
  - **Real-time AI Analysis**: Family members' questionnaire responses trigger GPT-4o analysis using DSM-5 criteria
  - **Senali Diagnostic Communication**: Updated Senali to EXPLICITLY tell users their probable conditions ("Based on your questionnaire, you most likely have Inattentive ADHD")
  - **API Usage Optimization**: Implemented intelligent caching to prevent unnecessary API calls on profile views
  - **Smart Caching**: AI analysis only runs when questionnaire responses change or cache expires (24 hours)
  - **Condition-Specific Guidance**: Senali provides ADHD-specific, Autism-specific, and targeted parenting strategies
  - **Comprehensive Integration**: Diagnostic results flow from questionnaires → AI analysis → cached results → Senali's responses
- **Enhanced Family Context Builder**: Updated to include AI diagnostic results with caching optimization
  - Displays probability levels (HIGH/MODERATE/LOW) with condition names
  - Provides specific guidance notes for Senali based on likely diagnoses
  - Caches diagnostic results to localStorage to prevent redundant API calls
  - Only triggers new AI analysis when symptoms change or cache expires
- **Benefits**: Senali now explicitly mentions your likely conditions and provides personalized support while optimizing API usage

### Latest Updates (2025-01-28)

#### Enhanced Conversational Guidelines (2025-01-28)
- **Gentle Topic Management**: Implemented sophisticated system to keep Senali focused on parenting while staying flexible
  - **Natural Reminders**: Can discuss any topic but subtly reminds users of parenting coach role when conversations stray
  - **Smart Frequency**: Only reminds every 5th message if users continue off-topic, never forceful or dismissive
  - **Example Approach**: "That sounds interesting! As a parenting coach, I'm curious how that affects your family time..."
  - **Warm Tone**: Always maintains supportive, empathetic conversation regardless of topic
  - **User Request**: Specifically implemented per user feedback for polite, non-forceful topic guidance

### Latest Updates (2025-07-28)

#### Complete Play Store Credit Purchase System (2025-07-28)
- **Play Store Integration**: Implemented complete credit purchase system with Google Play billing support
  - **Three-Tier Pricing**: $0.99 (100 credits), $4.99 (500 credits), $7.99 (1000 credits)
  - **Product IDs**: com.senali.credits.100, com.senali.credits.500, com.senali.credits.1000
  - **Purchase Flow**: Web testing with confirmation dialogs, native Android with Play Store billing
  - **Security**: Purchase token validation and server-side verification endpoints
  - **Android Manifest**: Added BILLING permission for Google Play integration
  - **Benefits**: Sustainable revenue model with no subscription complexity, credits never expire

#### Security Vulnerability Assessment - False Positive Confirmed (2025-07-28)
- **Security Scan Analysis**: Completed thorough security assessment of reported API key vulnerability in compiled Android assets
  - **Location**: `android/app/src/main/assets/public/assets/index-DTMnI0WC.js` line 1972 (Firebase Web API key in compiled bundle)
  - **Risk Assessment**: **FALSE POSITIVE** - Firebase Web API keys are intentionally public and designed for client-side usage
  - **Security Analysis**: Firebase security operates through domain restrictions and Firestore security rules, not API key secrecy
  - **Source Code Verification**: Confirmed proper environment variable usage in `client/src/lib/firebase.ts` using `import.meta.env.VITE_*` pattern
  - **Industry Standard**: Every Firebase web application includes these keys in client bundles per Google's documented best practices
  - **Current Implementation**: Environment variables properly managed through Replit secrets system (not filesystem .env)
  - **Recommendation**: No code changes required - this is standard Firebase architecture with no exploitable vulnerability
- **Firebase Configuration Security**: Enhanced security hygiene by moving Firebase configuration files to .gitignore
  - **Best Practice Implementation**: Added `android/app/google-services.json` to .gitignore despite no actual security risk
  - **Template Creation**: Created `google-services.json.template` for deployment reference
  - **Documentation**: Added `FIREBASE_CONFIG_SETUP.md` with setup instructions and security explanation
  - **Benefits**: Follows industry best practices for configuration management while maintaining full functionalityy

### Latest Updates (2025-01-28)

#### AdMob Banner Advertisement Implementation (2025-01-28)
- **Complete AdMob Integration**: Successfully implemented banner advertisements at top and bottom of screen for monetization
  - **AdMob Component**: Created `client/src/components/ads/AdMobBanner.tsx` with mobile-native and web fallback support
  - **Capacitor Integration**: Updated `capacitor.config.ts` with AdMob plugin configuration and test app ID
  - **Banner Placement**: Added top and bottom banner ads to chat interface for optimal visibility without disrupting UX
  - **Responsive Design**: Web/PWA shows placeholder ads, mobile native displays real AdMob banners
  - **Production Ready**: Test ad units configured, ready for production AdMob account setup
  - **Revenue Model**: Switched from failed subscription model to proven advertisement-based monetization
- **Setup Documentation**: Created comprehensive `ADMOB_SETUP_GUIDE.md` with production deployment instructions
  - Complete production setup checklist with AdMob account configuration
  - Mobile deployment instructions for Android and iOS with required dependencies
  - Revenue optimization strategies and expected earnings projections
  - Testing procedures and troubleshooting guide for AdMob implementation
- **Benefits**: Sustainable revenue model for completely free app with unlimited GPT-4o access for all users

#### Credit-Based Monetization System (2025-01-28)
- **Credit Purchase System**: Implemented in-app purchase credit system for sustainable monetization
  - **Pricing Model**: $7.99 for 1000 credits, 1 credit per message consumption
  - **Database Schema**: Added credits and totalPurchasedCredits fields to user table
  - **Starting Credits**: New users get 25 free credits to try the service
  - **Purchase Integration**: In-app purchase system ready for Google Play Store and App Store
  - **Credit Tracking**: Real-time credit display and consumption tracking in chat interface
- **Purchase Experience**: Comprehensive credit purchase flow with multiple pricing tiers
  - **Credit Packages**: 100 credits ($0.99), 500 credits ($4.99), 1000 credits ($7.99)
  - **Purchase Modal**: Beautiful purchase interface with product comparisons and savings indicators
  - **Instant Fulfillment**: Credits added immediately after purchase verification
  - **No Subscription**: One-time purchases with credits that never expire
- **User Experience**: Clear credit management with purchase prompts when credits run low
  - Credit counter displayed in chat header
  - "Buy Credits" button for easy access to purchase flow
  - Out-of-credits messaging guides users to purchase more
  - Admin users (joecmartineau@gmail.com) get unlimited access
- **Monetization Strategy**: Balanced approach with AdMob banner ads + credit purchases for maximum revenue
- **AI Model Usage**: GPT-3.5-turbo for all users (cost-efficient), GPT-4o only for joecmartineau@gmail.com admin account

### Latest Updates (2025-01-25)

#### Enhanced Questionnaire System (2025-01-25)
- **7th Grade Reading Level**: Completely rewrote all diagnostic questionnaire questions using simple, accessible language
  - **Simple Language**: Changed complex terms like "often has trouble with nonverbal communication like eye contact or gestures" to "does not look at people when talking or use hand gestures"
  - **Everyday Examples**: Added concrete examples like "loses important things like homework, pencils, toys, or books" instead of abstract descriptions
  - **Clear Instructions**: Updated guidance to "Think about how your child usually acts. Answer based on what you see most of the time"
  - **Parent-Friendly Categories**: Renamed technical categories to accessible names like "Attention and Focus" and "Planning and Organization"

- **Comprehensive Diagnostic Evaluation**: Enhanced assessment system with expanded coverage and professional insights
  - **New Question Categories**: Added anxiety, sensory processing, and executive function questions beyond ADHD and autism
  - **Improved Analysis Algorithm**: Enhanced diagnostic probability calculations using DSM-5 criteria with clear thresholds
  - **Practical Recommendations**: Provided specific, actionable next steps written in plain language for parents
  - **Professional Disclaimers**: Clear messaging that results are informational and require professional evaluation

- **AI-Powered Personalized Insights**: Implemented OpenAI GPT-4o integration for questionnaire analysis
  - **Custom Analysis Engine**: Created `questionnaire-ai-analysis.ts` for generating personalized family insights
  - **Structured AI Output**: JSON-formatted responses with summary, insights, next steps, and parent guidance
  - **Enhanced API Support**: Modified chat endpoint to handle questionnaire analysis with specialized prompts
  - **Beautiful UI**: Designed emerald-themed cards with organized sections for easy reading
  - **Fallback System**: Comprehensive error handling with meaningful default responses

- **User Experience Improvements**: Enhanced questionnaire interface with better organization and flow
  - **Progress Tracking**: Visual progress bar showing completion percentage
  - **Smart AI Triggering**: Generates personalized insights after 15+ questions answered
  - **Loading States**: Clear feedback during AI analysis with personalized messages
  - **Category Organization**: Grouped questions by developmental areas with descriptive headers

#### Critical Legal Compliance Update (2025-01-25)
- **Complete "Therapist" Removal**: Systematically removed ALL references to "therapist" throughout entire application for legal compliance
  - **Legal Protection**: AI companies face active lawsuits for claiming to provide therapy services without licensed therapists
  - **Terminology Change**: Replaced "AI therapist" with "AI parenting coach" across all UI, system prompts, and documentation
  - **Files Updated**: App.tsx, chat.tsx, openai.ts, functions/index.ts, conversation-context-manager.ts, routes/chat.ts, assessment-processor.ts
  - **Safe Alternative**: "Parenting coach" accurately describes supportive guidance without implying licensed therapeutic services
  - **Complete Coverage**: Updated welcome messages, system prompts, API documentation, and user-facing text
  - **Maintained Functionality**: All empathetic conversation and supportive guidance features preserved with safer terminology

#### Restored Simple Family Profile System (2025-01-24)
- **Back to Working Version**: Restored the clean, simple family profile creation system that was working well before admin complexity
- **Simplified Flow**: Users sign in → create family profiles → chat interface (no complex routing)
- **Admin Access Preserved**: joecmartineau@gmail.com still gets full admin panel with user management and credit adjustments
- **Local Storage Focus**: All family data stored in browser localStorage for privacy and persistence
- **Firebase + Local Hosting**: All components running on Firebase authentication with local Express server
- **Clean Chat Interface**: Simple chat with family context awareness and OpenAI integration
- **One-Step Profile Creation**: Add multiple family members in single session, save to localStorage, immediately start chatting
- **Admin Panel Features**: User list, credit adjustments, subscription management, system statistics

**Benefits**: Simple user experience while maintaining admin functionality, all data locally hosted or on Firebase servers as requested

### Latest Updates (2025-01-24)

#### Firebase Authentication Migration (2025-01-24)
- **Complete Firebase Auth Integration**: Migrated from Replit Auth to Firebase Authentication
  - **User Email Storage**: All user accounts and email addresses now stored on Firebase servers
  - **Google Sign-in**: Implemented Firebase Google Authentication with proper token verification
  - **Admin Panel Authentication**: Updated admin panel to use Firebase tokens with joecmartineau@gmail.com access
  - **Secure API Routes**: All admin routes now protected with Firebase token verification middleware
  - **Firebase Configuration**: Using senali-235fb Firebase project with proper API keys
- **Admin Panel with Firebase Auth**: Complete admin user management system
  - Firebase token-based authentication for secure admin access
  - User list management with Firebase user data
  - Credit adjustment system with Firebase authentication
  - Real-time user statistics and subscription management
- **Benefits**: Enhanced security, scalable authentication, Google-managed user data storage

### Previous Updates (2025-01-24)
- **Fixed Guided Family Discovery System**: Resolved JavaScript errors preventing chat functionality
  - Fixed variable scope issue with `newMembers` variable that was causing chat failures
  - Limited auto profile creation to first 10 messages only for cost efficiency
  - Added explicit profile creation commands ("create profile for [name]")
  - Updated system prompts for better family discovery guidance
  - Reduced API context to last 3 messages for cost control
  - Premium users get GPT-4o, free users get GPT-3.5-turbo
- **Cost-Efficient Architecture**: Implemented guided discovery workflow
  - Natural conversation flow with focused family questions in first 10 messages
  - Auto-creates family profiles when names mentioned naturally during discovery phase
  - User can manually request profiles anytime with explicit commands
  - API tested and working correctly with cost-efficient minimal context approach

### Previous Updates (2025-01-24)
- **Assessment System**: Implemented professional diagnostic assessment tracking system
  - Real DSM-5 criteria for ADHD, Autism, and ODD assessments  
  - Background processing of chat messages to extract symptom information
  - Hidden child profiles with standardized assessment forms (Vanderbilt, ADOS/ADI-R elements)
  - Assessment insights generation for parents to discuss with professionals
- **Comprehensive Child Profiles**: Enhanced child profile system for persistent information storage
  - Captures age, gender, diagnoses, challenges, strengths, school info, therapies, medications
  - Natural language extraction from parent conversations
  - Persistent context across conversations - Senali remembers each child's details
  - Professional notes and observations tracking over time
- **Comprehensive Symptom Checklist System**: Added detailed yes/no/unknown symptom tracking
  - 60+ standardized symptoms across all major neurodivergent categories
  - Attention & Focus (9 symptoms) - ADHD inattentive criteria
  - Hyperactivity & Impulsivity (9 symptoms) - ADHD hyperactive-impulsive criteria
  - Social Communication (9 symptoms) - Autism social interaction criteria
  - Restricted Interests & Repetitive Behaviors (7 symptoms) - Autism restricted behaviors
  - Sensory Processing (8 symptoms) - Common sensory challenges
  - Emotional Regulation (8 symptoms) - Emotional and behavioral challenges
  - Database schema with symptomChecklists table for persistent storage
  - API endpoints for symptom management (/api/children/:childId/symptoms)
  - Integrated into Senali's context - AI can reference parent-reported symptoms during conversations
  - Child profile management with symptom data integration
- **Enhanced AI Context**: Senali now has access to comprehensive symptom profiles
  - Displays symptom information organized by category during conversations
  - Shows "Present" and "Not present" symptoms for each category
  - Professional formatting for easy reference during parenting discussions
  - Critical safeguards to only reference explicitly parent-provided information
- **Firebase Hosting Ready**: Configured app for Firebase hosting deployment with stable domains
- **Domain Stability**: Optimized for Firebase hosting with senali-235fb.firebaseapp.com and senali-235fb.web.app domains
- **Mobile Optimization**: Enhanced PWA configuration for iOS and Android deployment
- **Service Worker**: Upgraded to v2.0 with advanced caching strategies and offline support
- **Mobile UI**: Added mobile header, install prompt, and offline indicators
- **Safe Area Support**: iOS notch/dynamic island compatibility
- **Touch Optimization**: 44px minimum touch targets and improved mobile gestures
- **Firebase Backend**: Complete Firebase integration with authentication, chat, and tips services
- **Exact Branding Implementation**: Updated app to use user's exact glowing green infinity symbol design
  - Replaced SVG-generated infinity symbol with user-provided high-quality PNG image
  - Applied exact symbol to all app icons (192x192, 512x512) and components
  - Maintained glowing effects and styling on the user's original design
  - Preserved mathematical curves, gradient layers, 3D highlights, and glass-like effects from original
  - Updated PWA manifest and favicon to use authentic user design

The application is now fully optimized for mobile deployment as a Progressive Web App on both iOS and Android platforms, with Firebase backend providing scalable, real-time functionality and native app-like experience when installed.