
# Changelog

## v1.1.0 - Google OAuth Configuration

### Added
- Google OAuth authentication using NextAuth.js
- Admin authentication restricted to @fetchrewards.com email addresses
- Session management with database storage via Prisma
- Protected admin routes for project management
- Sign-in/sign-out functionality

### Authentication Features
- Google OAuth provider integration
- Email domain restriction (@fetchrewards.com only)
- Database-backed sessions using Prisma adapter
- Admin page with authentication status
- Protected project creation and editing

### Technical Details
- NextAuth.js v4.24.11 integration
- Prisma adapter for session storage
- Environment variables for OAuth credentials:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`

## v1.0.0 - Initial Release

### Added
- Project catalog with database storage
- Dashboard with statistics
- Project CRUD operations
- Tool and team management
- Export functionality
