.PHONY: help install dev stop build logs shell-backend shell-frontend \
        seed db clean \
        local-setup local-dev local-backend local-frontend local-seed local-db

# ============================================================
# 📖 Default target: Show help
# ============================================================

help:
	@echo ""
	@echo "🚀 Sisyphean (Diary Reflection App) - Development Commands"
	@echo "==============================================================="
	@echo ""
	@echo "🐳 Docker Development:"
	@echo "  make install          - Install dependencies for both backend and frontend in local machine"
	@echo "  make dev              - Start all services with Docker"
	@echo "  make stop             - Stop all Docker services"
	@echo "  make build            - Force rebuild Docker containers"
	@echo "  make logs             - Show Docker logs (follow mode)"
	@echo "  make shell-backend    - Open shell in backend container"
	@echo "  make shell-frontend   - Open shell in frontend container"
	@echo "  make docker-seed      - Seed database inside Docker"
	@echo "  make docker-db        - Open PostgreSQL CLI inside Docker"
	@echo ""
	@echo "💻 Local Development (no Docker):"
	@echo "  make local-setup      - Prepare local dev environment"
	@echo "  make local-dev        - Run backend & frontend locally"
	@echo "  make local-backend    - Run backend locally (port 3001)"
	@echo "  make local-frontend   - Run frontend locally (port 3000)"
	@echo "  make local-db         - Open local PostgreSQL CLI"
	@echo "  make local-seed       - Seed local database"
	@echo ""
	@echo "🌱 Shared (auto-detect):"
	@echo "  make seed             - Seed DB (auto-detect Docker/local)"
	@echo "  make db               - Open PostgreSQL CLI (auto-detect)"
	@echo ""
	@echo "🧹 Utilities:"
	@echo "  make clean            - Clean node_modules and docker volumes"
	@echo "==============================================================="

# ============================================================
# 📦 Install Dependencies (local)
# ============================================================

install:
	@echo "📦 Installing dependencies..."
	cd backend && pnpm install
	cd frontend && pnpm install
	@echo "✅ All dependencies installed!"

# ============================================================
# 🐳 Docker Development
# ============================================================

dev:
	@echo "🐳 Starting Sisyphean (Docker mode)..."
	docker compose up

stop:
	@echo "⏹️  Stopping all containers..."
	docker compose down

build:
	@echo "🔨 Rebuilding all Docker containers..."
	docker compose build --no-cache && docker compose up

logs:
	@echo "📜 Showing container logs..."
	docker compose logs -f

shell-backend:
	docker compose exec backend sh

shell-frontend:
	docker compose exec frontend sh

docker-seed:
	@echo "🌱 Running seed script inside backend container..."
	docker compose exec backend pnpm run seed

docker-db:
	@echo "🗄️  Opening PostgreSQL CLI in Docker..."
	docker compose exec db psql -U diary_user -d diary_db

# ============================================================
# 💻 Local Development
# ============================================================

local-setup:
	@echo "🔧 Setting up local environment..."
	@command -v node >/dev/null 2>&1 || { echo "❌ Node.js not found! Install from https://nodejs.org"; exit 1; }
	@command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm not found! Install with: npm install -g pnpm"; exit 1; }
	@command -v psql >/dev/null 2>&1 || { echo "⚠️  PostgreSQL CLI not found! Install PostgreSQL 15+"; }
	@make install
	@echo ""
	@echo "🧩 Setting up .env files..."
	@if [ ! -f backend/.env ]; then \
		echo "PORT=3001" > backend/.env; \
		echo "NODE_ENV=development" >> backend/.env; \
		echo "DATABASE_URL=postgresql://diary_user:diary_password@localhost:5432/diary_db" >> backend/.env; \
	fi
	@if [ ! -f frontend/.env ]; then \
		echo "REACT_APP_API_URL=http://localhost:3001" > frontend/.env; \
	fi
	@echo "✅ Local environment ready!"
	@echo ""
	@echo "Next steps:"
	@echo "  make local-dev"

local-dev:
	@echo "🚀 Starting backend & frontend locally..."
	@trap 'kill 0' EXIT; \
		make local-backend & \
		make local-frontend & \
		wait

local-backend:
	@echo "🔧 Backend running at http://localhost:3001"
	cd backend && pnpm run dev

local-frontend:
	@echo "⚛️  Frontend running at http://localhost:3000"
	cd frontend && pnpm start

local-db:
	@echo "🗄️  Connecting to local PostgreSQL..."
	psql postgresql://diary_user:diary_password@localhost:5432/diary_db

local-seed:
	@echo "🌱 Seeding local database..."
	cd backend && DATABASE_URL="postgresql://diary_user:diary_password@localhost:5432/diary_db" node scripts/seed.js

# ============================================================
# 🌱 Database (Auto Detection)
# ============================================================

seed:
	@if docker ps | grep -q hw3-backend; then \
		echo "🌱 Seeding (Docker detected)..."; \
		make docker-seed; \
	else \
		echo "🌱 Seeding (Local detected)..."; \
		make local-seed; \
	fi

db:
	@if docker ps | grep -q hw3-postgres; then \
		echo "🗄️  Opening PostgreSQL CLI (Docker)..."; \
		make docker-db; \
	else \
		echo "🗄️  Opening PostgreSQL CLI (Local)..."; \
		make local-db; \
	fi

# ============================================================
# 🧹 Cleanup
# ============================================================

clean:
	@echo "🧹 Cleaning project..."
	rm -rf backend/node_modules frontend/node_modules
	rm -rf backend/.pnpm-store frontend/.pnpm-store
	rm -rf frontend/build
	@echo "🧼 Cleaning Docker volumes..."
	docker compose down -v
	docker system prune -f
	@echo "✅ Cleanup complete!"
