# NeuroParent AI - Replit Development Guide

## Overview

NeuroParent is a specialized AI-powered support application designed for parents of neurodivergent children, including those with ADHD, autism, ADD, ODD, and other neurological differences. The application provides personalized parenting guidance through AI chat interactions and daily tips to help parents navigate the unique challenges of raising neurodivergent children.

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

## System Architecture

This is a full-stack TypeScript application built with a modern web architecture:

### Frontend Architecture
- **Framework**: React 18 with Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Type Safety**: TypeScript throughout with strict configuration

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints under `/api` prefix
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Schema**: Type-safe database operations with Zod validation
- **Connection**: Neon serverless with WebSocket support for serverless environments

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect flow
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **User Management**: Mandatory user table for Replit Auth compliance
- **Authorization**: Protected routes with isAuthenticated middleware

### AI Integration
- **Provider**: OpenAI GPT-4o model
- **Specialization**: Custom system prompt for neurodivergent parenting support
- **Features**: 
  - Contextual chat conversations with message history
  - Daily tip generation with personalized content
  - Evidence-based parenting strategies and behavioral management

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

## Data Flow

1. **User Authentication**: Replit Auth → Session Creation → User Profile Storage
2. **Chat Interaction**: User Input → Message Storage → OpenAI API → AI Response → Message Storage → UI Update
3. **Daily Tips**: Scheduled/Manual Generation → OpenAI API → Tip Storage → User Display → Feedback Collection
4. **State Management**: React Query manages server state with automatic caching and synchronization

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

### Progressive Web App
- **Manifest**: Configured for mobile-first experience
- **Service Worker**: Basic caching strategy for offline capability
- **Mobile Optimization**: Responsive design with mobile navigation

The application is structured for easy deployment on Replit with automatic database provisioning and environment variable management through the platform's built-in features.