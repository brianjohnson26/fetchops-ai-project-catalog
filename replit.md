# Fetch AI Project Catalog

## Overview
An internal catalog for managing and browsing AI projects at Fetch Rewards. The application allows team members to submit AI projects, browse existing implementations, view dashboard metrics, and find subject matter experts by technology. Built with Next.js and designed for easy deployment on Replit with SQLite, but can be upgraded to PostgreSQL for production use.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Next.js 14 App Router**: Modern React framework with server-side rendering and TypeScript support
- **Component Structure**: Modular components including BrowseFilters for project filtering and ProjectActions for admin operations
- **Styling**: Custom CSS with CSS variables for theming, focusing on accessibility and semantic HTML
- **Client-Side Features**: Form handling, filtering, and interactive project management

### Backend Architecture
- **API Routes**: RESTful endpoints for project CRUD operations, authentication, and data export
- **Database Layer**: Prisma ORM with support for both SQLite (development) and PostgreSQL (production)
- **Authentication**: NextAuth.js with Google OAuth integration, restricted to @fetchrewards.com email domains
- **Data Models**: Projects with tools, links, team assignments, and owner tracking

### Data Storage
- **Development**: SQLite database via Prisma for local development and Replit deployment
- **Production**: PostgreSQL support via Supabase with session pooler configuration
- **Schema Design**: Normalized structure with separate entities for projects, tools, links, and people relationships
- **Migration Strategy**: Prisma migrations for schema changes and data evolution

### Authentication & Authorization
- **Google OAuth**: Single sign-on using NextAuth.js with Google provider
- **Domain Restriction**: Access limited to @fetchrewards.com email addresses
- **Session Management**: Database-backed sessions using Prisma adapter
- **Route Protection**: Middleware-based protection for admin routes and project management features
- **Admin Features**: Project creation, editing, and deletion restricted to authenticated users

## External Dependencies

### Authentication Services
- **NextAuth.js**: OAuth authentication framework with Google provider integration
- **Google OAuth API**: For user authentication and profile information

### Database & ORM
- **Prisma**: Database toolkit and ORM for TypeScript/Node.js
- **SQLite**: Development database (file-based storage)
- **Supabase PostgreSQL**: Production database with session pooler support

### Deployment & Infrastructure
- **Replit**: Primary deployment platform with one-click setup
- **Vercel**: Alternative deployment option for production
- **Environment Variables**: Configuration for OAuth credentials, database URLs, and API keys

### Optional Integrations
- **Slack Webhooks**: Notifications for new project submissions (configurable via SLACK_WEBHOOK_URL)
- **Export Functionality**: CSV and JSON data export capabilities for project data

### Development Tools
- **TypeScript**: Type safety and enhanced developer experience
- **ESLint**: Code linting and style enforcement
- **Vitest**: Testing framework for unit and integration tests