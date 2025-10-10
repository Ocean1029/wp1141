# Homework 3: Diary Reflection App with AI Categorization

A full-stack web application that allows users to record diary entries and use AI to automatically categorize and organize thoughts by themes.

## Project Structure

```
hw3/
├── backend/          # Node.js + Express backend
├── frontend/         # React frontend
├── docker-compose.yml
├── tasks.md          # Project tasks and user stories
└── README.md
```

## Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Package Manager**: pnpm
- **Containerization**: Docker & Docker Compose

## Getting Started

### Prerequisites

- Docker
- Docker Compose
- (Optional) pnpm - for local development outside Docker

### Installation & Running

1. Clone the repository and navigate to hw3 directory:
```bash
cd homework/hw3
```

2. Remove local node_modules if they exist (to avoid conflicts with Docker volumes):
```bash
rm -rf frontend/node_modules
```

3. Start all services using Docker Compose:
```bash
docker-compose up --build
```

The first build may take a few minutes to install all dependencies.

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Backend Health Check: http://localhost:3001/health
- PostgreSQL: localhost:5432

**Note**: The frontend container uses a named Docker volume for `node_modules` to prevent conflicts with the host system and ensure proper dependency installation.

### Development

To run individual services:

```bash
# Start only the database
docker-compose up db

# Start backend (requires db to be running)
docker-compose up backend

# Start frontend
docker-compose up frontend
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (caution: deletes database data)
docker-compose down -v
```

## Features (Planned)

### Epic 1: Diary Recording and Browsing
- Add diary entries
- Auto-save with timestamps
- Card-based overview
- Full text reading
- Search functionality
- Edit and delete entries

### Epic 2: AI Theme Categorization
- Automatic paragraph segmentation
- Theme classification
- Generate subcards for segments
- Theme aggregation view
- Jump back to original entries
- Manual theme editing
- Quick theme navigation

## API Endpoints (To Be Implemented)

- `GET /health` - Health check
- `GET /api` - API information

## Database Schema (To Be Implemented)

Tables will include:
- `diaries` - Main diary entries
- `segments` - AI-generated segments
- `themes` - Theme categories
- `diary_themes` - Many-to-many relationship

## License

MIT

