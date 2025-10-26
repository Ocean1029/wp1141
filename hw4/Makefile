.PHONY: help dev stop build logs clean shell-backend shell-frontend db seed

# Default target
help:
	@echo ""
	@echo "🗺️  TripTimeline Maps - Development Commands"
	@echo "=============================================="
	@echo ""
	@echo "🐳 Docker Commands:"
	@echo "  make dev              - Start all services"
	@echo "  make stop             - Stop all services"
	@echo "  make build            - Rebuild containers"
	@echo "  make logs             - View logs"
	@echo "  make clean            - Clean containers and volumes"
	@echo ""
	@echo "🔧 Development:"
	@echo "  make shell-backend    - Open backend shell"
	@echo "  make shell-frontend   - Open frontend shell"
	@echo "  make db               - Open PostgreSQL CLI"
	@echo "  make seed             - Seed database"
	@echo ""

dev:
	@echo "🚀 Starting TripTimeline Maps..."
	docker compose up

stop:
	@echo "⏹️  Stopping all services..."
	docker compose down

build:
	@echo "🔨 Rebuilding containers..."
	docker compose build --no-cache
	docker compose up

logs:
	@echo "📜 Showing logs..."
	docker compose logs -f

shell-backend:
	docker compose exec backend sh

shell-frontend:
	docker compose exec frontend sh

db:
	docker compose exec db psql -U trip_user -d trip_timeline_db

seed:
	@echo "🌱 Seeding database..."
	docker compose exec backend npm run seed

clean:
	@echo "🧹 Cleaning up..."
	docker compose down -v
	docker system prune -f
	@echo "✅ Cleanup complete!"

