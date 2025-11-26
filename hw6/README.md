# AI Avalon Moderator

AI-powered LINE Bot that serves as an automated game moderator for Avalon, a board game. This bot integrates LINE Messaging API with LIFF (LINE Front-end Framework) to handle private role reveals and secret mission actions, while leveraging OpenAI's LLM to provide an immersive, character-driven game experience.

**LINE Bot ID**: `@715dlzwy`

For detailed game rules, please refer to [AVALON_RULES.md](./AVALON_RULES.md).

## 🚀 Deployment

- **LINE Bot**: Add friend via ID: `@715dlzwy`
- **Admin Dashboard**: [https://wp-hw6.ocean1029.com/admin](https://wp-hw6.ocean1029.com/admin)
  - *Features: Real-time conversation logs, game statistics, and history management.*
- **API Documentation**: [https://wp-hw6.ocean1029.com/api-docs](https://wp-hw6.ocean1029.com/api-docs)

## ✨ Key Features

### 🤖 AI Game Moderator (LINE Bot)
- **Immersive Role-Playing**: Uses OpenAI (GPT-4) to act as the "Lady of the Lake", guiding players through the game with character-driven dialogue.
- **Automated Game Flow**: Manages the entire Avalon game lifecycle:
  - **Lobby Management**: Room creation, player joining, and ready status tracking.
  - **Role Assignment**: Automatically distributes roles (Merlin, Percival, Assassin, etc.) based on player count.
  - **Private Information**: Uses LIFF to securely display secret roles and known information to each player.
  - **Voting & Missions**: Handles team proposals, voting, and mission execution via interactive LIFF interfaces.
  - **Game Logic**: Enforces all game rules, including voting results, mission outcomes, and assassination phase.

### 📊 Admin Dashboard
- **Real-time Monitoring**: View live conversation logs between users and the bot with auto-refresh.
- **Statistics**: Track total messages, active users, today's activity, and total games played.
- **History Management**: Persists all conversation history in PostgreSQL for review and analysis.

### 🛡️ Robustness & Error Handling
- **Graceful Degradation**: If the LLM service is unavailable or rate-limited, the system falls back to pre-defined rule-based responses to ensure the game continues without interruption.
- **Input Validation**: Uses Zod for strict runtime validation of all API requests and environment variables.
- **Error Logging**: Centralized error handling and logging for easier debugging.

## 🛠️ Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** and **npm** 18.x or higher
- **PostgreSQL** database
- **LINE Developer Account** with a Messaging API channel configured
- **OpenAI API Key** for LLM functionality

## ⚙️ Environment Variables

Create a `.env` file in the root directory referencing `.env.example`. You can use `make check-env` to validate your configuration.

Required variables include:
- **Server**: `NODE_ENV`, `BASE_URL`
- **Database**: `DATABASE_URL`
- **LINE Platform**: `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `NEXT_PUBLIC_LINE_LIFF_ID`
- **OpenAI**: `OPENAI_API_KEY`

## 🚀 Getting Started

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

### Local Development

Start the development server:

```bash
make dev
```

- The application will be available at `http://localhost:3000`.
- API documentation is accessible at `http://localhost:3000/api-docs`.
- **Webhook Tunneling**: For local development with LINE, use `ngrok` to tunnel your localhost to a public URL:
  ```bash
  ngrok http 3000
  ```
  Then update your LINE Channel Webhook URL to `https://<your-ngrok-url>/api/webhook`.

## 📦 Make Commands

This project uses a Makefile to simplify common development tasks. Run `make help` to see all available commands:

- `make dev`: Start development server
- `make db-studio`: Open Prisma Studio to manage database
- `make lint`: Run code linting
- `make db-reset`: Reset database (use with caution)

## 🏗️ Tech Stack & Architecture

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

## 📄 License

This project is developed for educational purposes as part of NTU Web Programming course homework.
