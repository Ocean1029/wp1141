# Changelog

All notable changes to TripTimeline Maps will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-10-26

### Fixed
- TypeScript compile error in backend: Request.user type definition in global.d.ts
- Frontend JSX syntax error by importing React explicitly in useAuth.ts
- Disabled strict unused locals/parameters warnings to allow development flexibility
- Properly configured TypeScript compiler options for both backend and frontend

## [1.0.0] - 2025-10-26

### Added

**Backend:**
- Complete Auth system with JWT (Access + Refresh tokens)
- HTTP-only Cookie authentication
- User registration with automatic "Favorite" tag creation
- Tags CRUD with uniqueness validation
- Places CRUD with tag association (many-to-many)
- Events CRUD with place association (many-to-many)
- Google Maps services proxy (Geocoding & Places API)
- Data invariant validation (Place must have ≥1 tag)
- Prisma ORM with PostgreSQL
- Zod schema validation
- Swagger UI API documentation
- Unified error handling
- Docker Compose setup
- Database seeding script

**Frontend:**
- Login/Register page with form validation
- useAuth hook with AuthProvider context
- Protected routes with React Router
- Google Maps JavaScript API integration
- MapCanvas component with click-to-create
- FullCalendar TimeGrid integration
- TimelinePanel component with drag-and-drop
- TagFilterBar with multi-select filtering
- PlaceForm modal for creating places
- Axios client with automatic token refresh
- Responsive design for mobile

**Documentation:**
- Comprehensive README with quick start guide
- Architecture documentation (ARCHITECTURE.md)
- API examples with 10+ curl commands (API_EXAMPLES.md)
- Quick start guide (QUICKSTART.md)
- Deployment guide (DEPLOYMENT.md)
- Contributing guidelines (CONTRIBUTING.md)
- Project overview (PROJECT_OVERVIEW.md)
- Testing guide (TESTING_GUIDE.md)

### Security

- Password hashing with bcrypt (12 rounds)
- JWT secret validation (minimum 32 characters)
- CORS restricted to localhost:5173
- HTTP-only cookies for token storage
- SameSite cookie attribute
- API key environment variable protection

### Technical

- TypeScript 100% coverage
- Modular Monolith architecture
- Type-safe database operations
- Centralized error handling
- Environment variable validation
- Docker multi-stage builds (future)

---

## [Unreleased] - Future Versions

### Planned Features

**v1.1.0 - UI Completeness**
- Event creation modal/form
- Tag creation/edit modal
- Place detail sidebar
- Toast notification system
- Improved error handling

**v1.2.0 - Performance**
- Redis caching for Google API responses
- React Query for client-side state
- Optimistic UI updates
- Debounced search

**v1.3.0 - Collaboration**
- Multi-user trip planning
- Trip sharing
- Permission management
- WebSocket real-time updates

**v2.0.0 - Platform Expansion**
- Mobile app (React Native)
- PWA with offline support
- AI trip suggestions
- Trip templates

---

## Development Notes

### Breaking Changes

None yet (initial release)

### Deprecations

None yet (initial release)

### Known Issues

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for current limitations.

---

**Legend:**
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for removed features
- `Fixed` for bug fixes
- `Security` for security improvements

