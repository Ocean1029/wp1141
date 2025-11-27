.PHONY: help install dev build start lint clean db-generate db-push db-migrate db-studio db-reset format check-env

# Default target
help:
	@echo ""
	@echo "🤖 HW6 LINE Bot - Development Commands"
	@echo "========================================"
	@echo ""
	@echo "📦 Installation:"
	@echo "  make install         - Install all dependencies"
	@echo ""
	@echo "🚀 Development:"
	@echo "  make dev             - Start development server"
	@echo "  make build           - Build for production"
	@echo "  make start           - Start production server"
	@echo "  make lint            - Run ESLint"
	@echo ""
	@echo "🗄️  Database:"
	@echo "  make db-generate     - Generate Prisma Client"
	@echo "  make db-push         - Push schema to database (dev)"
	@echo "  make db-migrate      - Create and run migration"
	@echo "  make db-studio       - Open Prisma Studio"
	@echo "  make db-reset        - Reset database (WARNING: deletes all data)"
	@echo ""
	@echo "🧹 Cleanup:"
	@echo "  make clean           - Clean build artifacts and node_modules"
	@echo ""
	@echo "📚 Documentation:"
	@echo "  make docs            - Open API documentation (http://localhost:3000/api-docs)"
	@echo ""
	@echo "🔍 Utilities:"
	@echo "  make check-env       - Check environment variables"
	@echo ""

# Installation
install:
	@echo "📦 Installing dependencies..."
	npm install

# Development
dev:
	@echo "🚀 Starting development server..."
	@echo "📚 API Docs: http://localhost:3000/api-docs"
	@echo "🔗 Webhook: http://localhost:3000/api/webhook"
	npm run dev

build:
	@echo "🔨 Building for production..."
	npm run build

start:
	@echo "▶️  Starting production server..."
	npm run start

lint:
	@echo "🔍 Running linter..."
	npm run lint

# Database commands
db-generate:
	@echo "🔧 Generating Prisma Client..."
	npm run db:generate

db-push:
	@echo "📤 Pushing schema to database..."
	npm run db:push

db-migrate:
	@echo "🔄 Creating and running migration..."
	npm run db:migrate

db-studio:
	@echo "🎨 Opening Prisma Studio..."
	npm run db:studio

db-reset:
	@echo "This will delete all data in the database!"
	@echo "🗑️  Resetting database..."
	npx prisma migrate reset --force
	npm run db:generate
	@echo "Database reset complete!"

# Cleanup
clean:
	@echo "🧹 Cleaning up..."
	rm -rf .next
	rm -rf node_modules
	rm -rf .turbo
	rm -f package-lock.json
	rm -f tsconfig.tsbuildinfo
	@echo "✅ Cleanup complete!"

clean-build:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf .next
	rm -f tsconfig.tsbuildinfo
	@echo "✅ Build artifacts cleaned!"

# Documentation
docs:
	@echo "📚 Opening API documentation..."
	@echo "Visit: http://localhost:3000/api-docs"
	@echo "Swagger JSON: http://localhost:3000/api/docs"

# Environment check
check-env:
	@echo "🔍 Checking environment variables..."
	@if [ ! -f .env ]; then \
		echo "❌ .env file not found!"; \
		echo "📝 Copy .env.example to .env and fill in the values"; \
		exit 1; \
	fi
	@echo "✅ .env file exists"

# Setup (first time setup)
setup: check-env install db-generate
	@echo ""
	@echo "✅ Setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Make sure your .env file is configured"
	@echo "  2. Run 'make db-push' to sync database schema"
	@echo "  3. Run 'make dev' to start development server"

