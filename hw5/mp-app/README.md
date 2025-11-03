# X-like Social Platform

A Twitter-like social media platform built with Next.js 16, featuring OAuth authentication, real-time interactions, and threaded conversations.

## Features

- **OAuth Authentication**: Login with Google, GitHub, or Facebook
- **Custom UserIDs**: Choose your own handle (3-20 characters, alphanumeric + underscore)
- **Posts**: Create 280-character posts with URL/hashtag/mention support
- **Feed**: View all posts or only from users you follow
- **Interactions**: Like, repost, and comment on posts
- **Threading**: Nested replies with recursive navigation
- **Profiles**: Customizable profiles with avatar and banner images
- **Real-time**: Live updates using Pusher for likes, comments, and reposts
- **Follow System**: Follow/unfollow users and track your network

## Prerequisites

- Docker & Docker Compose
- OAuth app credentials (Google/GitHub/Facebook)
- Pusher account

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth v5
- **Real-time**: Pusher
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide

## Quick Start

```bash
# Initialize project (creates .env.dev and .env.prod from template)
make init

# Start development services (hot reload)
make up-dev

# Setup development database (generate Prisma Client + run migrations)
make db-setup-dev
```

Visit `http://localhost:3000` and sign in with OAuth.

**Note**: The project uses Docker Compose profiles to separate development and production environments. Databases run in containers, no external setup needed.

## Environment Variables

Initialize environment files:

```bash
make init  # Creates .env.dev and .env.prod from .env.example
```

Then edit `.env.dev` and `.env.prod` with your credentials:

```env
# Database is managed by Docker Compose automatically
# DATABASE_URL is set in docker-compose.yml for each profile

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
FACEBOOK_CLIENT_ID="..."
FACEBOOK_CLIENT_SECRET="..."

PUSHER_APP_ID="..."
PUSHER_KEY="..."
PUSHER_SECRET="..."
PUSHER_CLUSTER="ap3"
NEXT_PUBLIC_PUSHER_KEY="..."
NEXT_PUBLIC_PUSHER_CLUSTER="..."
```

**Development vs Production:**
- **Development**: `.env.dev` with `NEXTAUTH_URL=http://localhost:3000`
- **Production**: `.env.prod` with `NEXTAUTH_URL=https://your-domain.com`

## Project Structure

```text
Y/
├── app/                      # Next.js app routes
│   ├── (auth)/              # Login/Register pages
│   ├── (main)/              # Protected app routes
│   │   ├── home/           # Feed
│   │   ├── post/[id]/      # Thread view
│   │   └── profile/[userId]/# Profiles
│   └── api/
│       ├── auth/[...nextauth]/# NextAuth
│       └── pusher/auth/     # Pusher auth
├── components/               # React components
│   ├── auth/               # OAuth, UserID form
│   ├── feed/               # Feed UI
│   ├── navigation/         # SideNav, UserMenu
│   ├── post/               # PostCard, PostModal
│   ├── profile/            # Profile UI
│   └── thread/             # Thread views
├── lib/
│   ├── server/             # Server Actions
│   │   ├── posts.ts       # CRUD operations
│   │   ├── interactions.ts# Like/Repost/Follow
│   │   └── users.ts       # User operations
│   ├── utils/              # Helpers
│   │   ├── userId.ts      # Validation
│   │   ├── text-parser.ts # URL/Hashtag/Mention
│   │   └── time.ts        # Formatting
│   ├── auth.ts            # NextAuth config
│   ├── prisma.ts          # DB client
│   └── pusher.ts          # Pusher client
├── prisma/
│   └── schema.prisma      # Database schema
├── Dockerfile              # Production image
├── Dockerfile.dev          # Development image
├── docker-compose.yml     # Docker services (dev/prod profiles)
├── Makefile               # Docker commands
├── .env.example           # Environment template
├── .env.dev               # Development environment
└── .env.prod              # Production environment
```

## Development Status

### ✅ Completed

- Project skeleton with full directory structure
- Server Actions scaffold (all CRUD operations)
- Utility functions (validation, text parsing, formatting)
- UI components (navigation, feed, post, profile, auth)
- NextAuth v5 configuration
- Prisma schema design
- Route protection middleware
- **Docker setup with dev/prod profiles**
- **Separated environment files (.env.dev, .env.prod)**
- **Makefile with Docker-based commands**

### 🚧 In Progress

- Database migrations and setup
- Prisma integration in Server Actions
- OAuth callback flow
- Pusher real-time implementation

### 📋 TODO

- [ ] Connect Server Actions to Prisma database
- [ ] Implement OAuth registration flow
- [ ] Build feed with All/Following tabs
- [ ] Create Post Modal with draft support
- [ ] Add inline compose bar
- [ ] Implement profile editing
- [ ] Build nested reply threading
- [ ] Add Pusher real-time updates
- [ ] Handle image uploads (avatars/banners)
- [ ] Deploy to Vercel

## Available Commands

**Development (default):**
- `make up-dev` - Start development services (port 3000)
- `make down-dev` - Stop development services
- `make logs-dev` - Show development logs
- `make db-setup-dev` - Setup development database
- `make db-studio-dev` - Open Prisma Studio for dev (port 5555)

**Production:**
- `make up-prod` - Start production services (port 3001)
- `make down-prod` - Stop production services
- `make build-prod` - Build production images
- `make db-setup-prod` - Setup production database

**Shortcuts (alias to dev):**
- `make up` - Start development services
- `make down` - Stop development services
- `make logs` - Show logs
- `make clean` - Clean development resources

Run `make help` for the complete command list.

## License

MIT
