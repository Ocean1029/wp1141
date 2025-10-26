# TripTimeline Maps Backend

Backend API for the TripTimeline Maps application.

## Tech Stack

- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- **JWT** authentication (Access + Refresh tokens)
- **Google Maps API** integration
- **Swagger UI** for API documentation
- **Zod** for schema validation

## Features

- ✅ User authentication with JWT
- ✅ Tags management
- ✅ Places with geolocation
- ✅ Events with timeline scheduling
- ✅ Google Maps integration (Geocoding, Places API)
- ✅ RESTful API with OpenAPI documentation

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Docker & Docker Compose

### Setup

1. **Clone and navigate:**
   ```bash
   cd homework/hw4/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and Google Maps API key
   ```

4. **Setup database:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

Server will run on http://localhost:3000

## API Documentation

- **Swagger UI**: http://localhost:3000/docs
- **API Base**: http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:deploy` - Deploy migrations (production)
- `npm run seed` - Seed database with demo data
- `npm run db:reset` - Reset and reseed database

## Environment Variables

See `.env.example` for all required variables.

## API Endpoints

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

### Tags
- `GET /api/tags` - List all tags
- `GET /api/tags/:id` - Get tag by ID
- `POST /api/tags` - Create tag
- `PATCH /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

### Places
- `GET /api/places` - List all places
- `GET /api/places/:id` - Get place by ID
- `POST /api/places` - Create place
- `PATCH /api/places/:id` - Update place
- `DELETE /api/places/:id` - Delete place

### Events
- `GET /api/events` - List all events (with time range filtering)
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Maps (Google Maps Integration)
- `GET /maps/geocode` - Geocode address to coordinates
- `GET /maps/reverse-geocode` - Reverse geocode coordinates to address
- `GET /maps/search` - Search places using Google Places API

## Architecture

```
src/
├── controllers/    # Route handlers
├── services/       # Business logic
├── schemas/        # Zod validation schemas
├── routes/         # Express routes
├── middlewares/    # Express middlewares
├── utils/          # Utility functions
├── types/          # TypeScript types
└── docs/           # Swagger documentation
```

## Database Models

- **User** - User accounts
- **Tag** - User-defined place tags
- **Place** - Geographic locations
- **Event** - Timeline events
- **PlaceTag** - Many-to-many: Place ↔ Tag
- **EventPlace** - Many-to-many: Event ↔ Place

## Development

The backend uses TypeScript with strict type checking. Key conventions:

- Controllers handle HTTP requests/responses
- Services contain business logic
- Schemas define validation rules
- Prisma handles database operations
- All authentication uses HTTP-only cookies

## License

MIT

