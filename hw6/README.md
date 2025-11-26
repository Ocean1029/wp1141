# AI Avalon Moderator

AI-powered LINE Bot that serves as an automated game moderator for Avalon, a board game. This bot integrates LINE Messaging API with LIFF (LINE Front-end Framework) to handle private role reveals and secret mission actions, while leveraging OpenAI's LLM to provide an immersive, character-driven game experience.

**LINE Bot ID**: `@715dlzwy`

For detailed game rules, please refer to [AVALON_RULES.md](./AVALON_RULES.md).

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** and **npm** 18.x or higher
- **PostgreSQL** database
- **LINE Developer Account** with a Messaging API channel configured
- **OpenAI API Key** for LLM functionality

## Environment Variables

Create a `.env` file in the root directory referencing `.env.example`

## Getting Started

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd hw6
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Install dependencies**:
   ```bash
   make setup
   make db-push
   ```

### Development

Start the development server:

```bash
make dev
```

The application will be available at `http://localhost:3000`. API documentation is accessible at `http://localhost:3000/api-docs`.

### Make Commands

This project uses a Makefile to simplify common development tasks. Run `make help` to see all available commands:

## Key Features

<!-- TODO: Add key features documentation -->

## Tech Stack & Architecture

### Core Technologies

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI/LLM**: OpenAI API (GPT-4o)
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


