# NeuroParent AI - Replit Development Guide

## Overview

Senali is an AI-powered companion designed to act as both a therapist and a friend for parents. The application provides empathetic conversation, active listening, and supportive guidance through AI chat interactions and daily tips focused on emotional well-being and family relationships. Senali specializes in building meaningful connections by asking personalized questions about users' children, spouses, and family dynamics.

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
- **AI Personality**: Senali - therapist and friend companion with empathetic conversation style
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

### Complete Firebase Migration (2025-01-24)
- **Full Firebase Architecture**: Migrated entire application to Firebase ecosystem
  - **Frontend Hosting**: React app deployed to Firebase Hosting (senali-235fb.web.app)
  - **Backend API**: Express.js routes converted to Firebase Functions (serverless)
  - **Authentication**: Firebase Auth with Google Sign-in integration
  - **Global CDN**: Worldwide content delivery with automatic SSL
- **Firebase Functions**: Serverless backend implementation
  - `chat` function: OpenAI integration with minimal context handling
  - `generateTip` function: AI-powered parenting tip generation
  - Node.js 18 runtime with TypeScript support
  - CORS configured for Firebase domains
- **Deployment Configuration**: Complete Firebase setup
  - `firebase.json`: Hosting, Functions, and URL rewrites configured
  - `.firebaserc`: Project selection (senali-235fb)
  - Automated build and deployment scripts
  - Environment variable management through Firebase config
- **Benefits**: Fully serverless, cost-efficient, globally distributed
  - Pay-per-use pricing with Firebase Functions
  - No server maintenance required
  - Automatic scaling and SSL management
  - Optimized for privacy-first local storage architecture

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
- **Senali Role Transformation**: Complete shift from neurodivergent parenting specialist to therapist/friend companion
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

### Latest Updates (2025-01-24)

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