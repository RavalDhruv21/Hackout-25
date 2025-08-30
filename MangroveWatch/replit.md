# Mangrove Guardian - Environmental Monitoring Platform

## Overview

Mangrove Guardian is a community-driven environmental monitoring platform focused on protecting coastal mangrove ecosystems. The application enables users to report environmental threats, track conservation efforts, and participate in gamified conservation activities. It features a React frontend with TypeScript, an Express.js backend, PostgreSQL database with Drizzle ORM, and real-time WebSocket communications.

The platform serves three user types: regular users who submit threat reports, authority users who verify reports, and administrators who manage the system. The application includes features like AI-assisted threat validation, achievement systems, leaderboards, and real-time notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Custom component library built with Radix UI primitives and Tailwind CSS
- **State Management**: TanStack Query for server state management with local React state for UI
- **Styling**: Tailwind CSS with CSS variables for theming and shadcn/ui design system
- **Real-time Updates**: WebSocket connection for live notifications and updates

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API with role-based access control
- **Real-time Communication**: WebSocket server for instant notifications and live updates
- **File Handling**: Multer middleware for photo uploads with 5MB file size limits
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Development Tools**: Hot module reloading with Vite integration for development

### Database Design
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Structured around users, threats, achievements, and notifications
- **Key Tables**:
  - Users table with role-based permissions (user/authority/admin)
  - Threats table for environmental reports with geolocation data
  - Achievements system for gamification
  - Notifications for real-time user updates
- **Data Types**: JSON fields for flexible data storage (photos arrays, achievement criteria)
- **Relationships**: Foreign key relationships between users and their reports/achievements

### Authentication & Authorization
- **Session Management**: Custom authentication system with localStorage persistence
- **Role-Based Access**: Three-tier permission system (user, authority, admin)
- **Route Protection**: Frontend route guards based on authentication state and user roles
- **API Security**: Server-side validation and authorization checks on all endpoints

### File Storage & Media
- **Photo Uploads**: Local file storage with Multer handling multipart form data
- **File Validation**: Size limits (5MB) and type restrictions for security
- **Storage Location**: Uploads directory with organized file structure

### Real-time Features
- **WebSocket Implementation**: Native WebSocket server for bidirectional communication
- **Connection Management**: Client connection tracking and user session mapping
- **Notification System**: Instant delivery of achievement unlocks, report status updates, and system alerts
- **Browser Integration**: Native browser notification API support when permissions granted

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL via Neon Database serverless platform (@neondatabase/serverless)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations and schema management
- **Development**: Replit-specific plugins for development environment integration

### UI Framework & Components
- **Component Library**: Extensive Radix UI primitives for accessible component foundations
- **Styling**: Tailwind CSS with PostCSS for processing and class-variance-authority for component variants
- **Icons**: Lucide React for consistent iconography throughout the application

### Data Management & Validation
- **API Client**: TanStack Query for server state management and caching
- **Form Handling**: React Hook Form with Zod resolvers for type-safe form validation
- **Schema Validation**: Zod for runtime type checking and API validation
- **Date Handling**: date-fns library for date formatting and manipulation

### Development & Build Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: ESBuild for production builds and TypeScript compiler for type checking
- **Development Features**: Runtime error overlay and hot module replacement for development workflow