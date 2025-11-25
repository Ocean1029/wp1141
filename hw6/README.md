# AI Avalon Moderator

AI-powered LINE Bot that serves as an automated game moderator for Avalon (The Resistance: Avalon), a social deduction board game. This bot integrates LINE Messaging API with LIFF (LINE Front-end Framework) to handle private role reveals and secret mission actions, while leveraging OpenAI's LLM to provide an immersive, character-driven game experience.

**LINE Bot ID**: `@715dlzwy`

For detailed game rules, please refer to [AVALON_RULES.md](./AVALON_RULES.md).

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or cloud instance like Supabase, Neon, or Railway)
- **LINE Developer Account** with a Messaging API channel configured
- **OpenAI API Key** for LLM functionality

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# LINE Bot Configuration
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_CHANNEL_SECRET=your_channel_secret

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key
OPENAI_MODEL=gpt-4o-mini  # Optional, defaults to gpt-4
OPENAI_ORG_ID=org-xxxxx   # Optional

# Application
NODE_ENV=development     # Optional, defaults to development
BASE_URL=http://localhost:3000  # Optional, required for production
```

## Getting Started

### Initial Setup

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd hw6
   ```

2. **Install dependencies**:
   ```bash
   make install
   # or
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env  # If .env.example exists
   # Edit .env with your actual values
   ```

4. **Generate Prisma Client**:
   ```bash
   make db-generate
   # or
   npm run db:generate
   ```

5. **Push database schema**:
   ```bash
   make db-push
   # or
   npm run db:push
   ```

### Development

Start the development server:

```bash
make dev
# or
npm run dev
```

The application will be available at `http://localhost:3000`. API documentation is accessible at `http://localhost:3000/api-docs`.

### Production Build

Build and start the production server:

```bash
make build
make start
# or
npm run build
npm start
```

## Make Commands

This project uses a Makefile to simplify common development tasks. Run `make help` to see all available commands:

### Installation
- `make install` - Install all npm dependencies

### Development
- `make dev` - Start development server with hot reload
- `make build` - Build for production
- `make start` - Start production server
- `make lint` - Run ESLint

### Database
- `make db-generate` - Generate Prisma Client from schema
- `make db-push` - Push schema changes to database (development)
- `make db-migrate` - Create and run database migration
- `make db-studio` - Open Prisma Studio (database GUI)
- `make db-reset` - Reset database (⚠️ deletes all data)

### Utilities
- `make check-env` - Verify environment variables configuration
- `make clean` - Remove build artifacts and node_modules
- `make docs` - View API documentation URL

### First-time Setup
- `make setup` - Run initial setup (checks env, installs deps, generates Prisma Client)

## Key Features

<!-- TODO: Add key features documentation -->

## Tech Stack & Architecture

### Core Technologies

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI/LLM**: OpenAI API (GPT-4o-mini)
- **Platform**: LINE Messaging API + LIFF SDK
- **Styling**: Tailwind CSS
- **Validation**: Zod for runtime type validation

### Architecture Overview

```
┌─────────────┐
│ LINE Users  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ LINE Platform       │
│ (Webhook Endpoint)  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Next.js API Routes          │
│ /api/webhook                │
│ - Signature Validation      │
│ - Message Handler           │
│ - Game Logic Router         │
└──────┬──────────────────────┘
       │
       ├─────────────────┬─────────────────┐
       ▼                 ▼                 ▼
┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│ PostgreSQL  │  │ OpenAI API   │  │ LIFF Pages  │
│ (Game State)│  │ (LLM)        │  │ (Private UI)│
└─────────────┘  └──────────────┘  └─────────────┘
```

### Project Structure

```
hw6/
├── app/
│   ├── api/              # API routes (webhook, admin endpoints)
│   ├── api-docs/         # Swagger API documentation
│   └── page.tsx          # Landing page
├── components/           # React components
├── config/              # Configuration files
│   ├── env.ts           # Environment variable validation
│   └── messages/        # Message templates
├── lib/                 # Core libraries
│   ├── prisma.ts        # Prisma client instance
│   ├── openai.ts        # OpenAI client
│   └── logger.ts        # Logging utilities
├── modules/             # Feature modules
│   └── lineBot/         # LINE Bot handlers and services
├── prisma/
│   └── schema.prisma    # Database schema
└── types/               # TypeScript type definitions
```

## License

This project is developed for educational purposes as part of NTU Web Programming course homework.

