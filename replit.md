# Overview

PetShopForest is a full-stack pet shop application built with a magical forest theme. The application features a React TypeScript frontend and Express.js backend, providing complete e-commerce functionality including product browsing, admin management, real-time updates, and a complete checkout system. The app supports pet sales, food, and accessories with a beautiful dark forest-themed UI.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: Vite + React + TypeScript for modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state, React Context for global app state
- **UI Components**: Shadcn/ui with Radix UI primitives for accessible components
- **Styling**: TailwindCSS with custom forest theme (dark green color scheme)
- **Real-time Communication**: WebSocket integration for live admin updates
- **Authentication**: Session-based authentication with protected routes

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Data Storage**: In-memory storage with interface design for easy database migration
- **Authentication**: Passport.js with local strategy and express-session
- **File Handling**: Multer for image uploads with static file serving
- **Real-time Updates**: WebSocket server using 'ws' library
- **API Design**: RESTful API with separate admin and public endpoints

## Data Models
The application uses a well-defined schema with the following entities:
- **Users/Admins**: Authentication and role management
- **Categories**: Product organization (Dogs, Cats, Fish, Birds, etc.)
- **Products**: Pets, food, and accessories with images, pricing, and stock
- **Orders**: Customer orders with product details and status tracking
- **Site Settings**: Configurable site description and YouTube integration

## File Upload System
- **Storage**: Local file system under `/server/uploads`
- **Processing**: Multer middleware with image validation and size limits
- **Serving**: Static file serving through Express

## Real-time Features
WebSocket implementation provides live updates for:
- Category management changes
- Product inventory updates
- New order notifications
- Site settings modifications

## Development Tools
- **Build System**: Vite for frontend bundling and development
- **Database Migration Ready**: Drizzle ORM configuration for PostgreSQL migration
- **Type Safety**: Shared TypeScript schemas between frontend and backend
- **Development Experience**: Hot reloading, error overlays, and development banners

# External Dependencies

## Core Framework Dependencies
- **@vitejs/plugin-react**: React integration for Vite
- **express**: Web framework for Node.js
- **typescript**: Type checking and compilation

## Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **clsx**: Conditional className utility

## Backend Libraries
- **passport**: Authentication middleware
- **passport-local**: Local authentication strategy
- **express-session**: Session management
- **multer**: File upload handling
- **ws**: WebSocket implementation

## Database/Storage
- **@neondatabase/serverless**: Neon database driver (prepared for migration)
- **drizzle-orm**: Type-safe ORM
- **drizzle-zod**: Schema validation integration
- **connect-pg-simple**: PostgreSQL session store (for production)

## Development Dependencies
- **@replit/vite-plugin-***: Replit-specific development tools
- **esbuild**: JavaScript bundler for production builds

## UI and Styling
- **class-variance-authority**: Component variant management
- **tailwind-merge**: Tailwind class merging utility
- **lucide-react**: Icon library

The application is designed with production scalability in mind, using in-memory storage for rapid development while maintaining interfaces that allow easy migration to PostgreSQL using the already configured Drizzle ORM setup.