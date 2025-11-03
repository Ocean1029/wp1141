.PHONY: help up up-dev up-prod down down-dev down-prod restart restart-dev restart-prod logs logs-dev logs-prod logs-app logs-app-dev logs-app-prod logs-db logs-db-dev logs-db-prod build build-dev build-prod rebuild rebuild-dev rebuild-prod clean clean-dev clean-prod db-setup db-setup-dev db-setup-prod db-migrate db-reset db-push db-studio db-studio-dev db-studio-prod db-seed shell shell-dev shell-prod lint lint-dev lint-prod health health-dev health-prod install-local init

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Development Commands
up-dev: ## Start development services
	@echo "$(BLUE)Starting development services...$(NC)"
	@if [ ! -f .env.dev ]; then \
		echo "$(RED)❌ .env.dev file not found!$(NC)"; \
		echo "$(YELLOW)Please create .env.dev from .env.example$(NC)"; \
		exit 1; \
	fi
	docker compose --profile dev up -d
	@echo "$(GREEN)✅ Development services started! App: http://localhost:3000$(NC)"

down-dev: ## Stop development services
	@echo "$(BLUE)Stopping development services...$(NC)"
	docker compose --profile dev down
	@echo "$(GREEN)✅ Development services stopped$(NC)"

restart-dev: down-dev up-dev ## Restart development services

logs-dev: ## Show logs from development services
	@echo "$(BLUE)Showing development logs...$(NC)"
	docker compose --profile dev logs -f

logs-app-dev: ## Show logs from development app only
	docker compose --profile dev logs -f app-dev

logs-db-dev: ## Show logs from development database only
	docker compose --profile dev logs -f db-dev

build-dev: ## Build development Docker images
	@echo "$(BLUE)Building development Docker images...$(NC)"
	docker compose --profile dev build

rebuild-dev: ## Rebuild development Docker images without cache
	@echo "$(BLUE)Rebuilding development Docker images...$(NC)"
	docker compose --profile dev build --no-cache

clean-dev: ## Stop and remove development containers and volumes
	@echo "$(RED)⚠️  This will remove all development containers and volumes!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(BLUE)Cleaning up development...$(NC)"; \
		docker compose --profile dev down -v; \
		rm -rf .next node_modules/.cache; \
		echo "$(GREEN)✅ Development cleanup complete!$(NC)"; \
	else \
		echo "$(YELLOW)Operation cancelled.$(NC)"; \
	fi

# Production Commands
up-prod: ## Start production services
	@echo "$(BLUE)Starting production services...$(NC)"
	@if [ ! -f .env.prod ]; then \
		echo "$(RED)❌ .env.prod file not found!$(NC)"; \
		echo "$(YELLOW)Please create .env.prod from .env.example$(NC)"; \
		exit 1; \
	fi
	docker compose --profile prod up -d
	@echo "$(GREEN)✅ Production services started! App: http://localhost:3001$(NC)"

down-prod: ## Stop production services
	@echo "$(BLUE)Stopping production services...$(NC)"
	docker compose --profile prod down
	@echo "$(GREEN)✅ Production services stopped$(NC)"

restart-prod: down-prod up-prod ## Restart production services

logs-prod: ## Show logs from production services
	@echo "$(BLUE)Showing production logs...$(NC)"
	docker compose --profile prod logs -f

logs-app-prod: ## Show logs from production app only
	docker compose --profile prod logs -f app-prod

logs-db-prod: ## Show logs from production database only
	docker compose --profile prod logs -f db-prod

build-prod: ## Build production Docker images
	@echo "$(BLUE)Building production Docker images...$(NC)"
	docker compose --profile prod build

rebuild-prod: ## Rebuild production Docker images without cache
	@echo "$(BLUE)Rebuilding production Docker images...$(NC)"
	docker compose --profile prod build --no-cache

clean-prod: ## Stop and remove production containers and volumes
	@echo "$(RED)⚠️  WARNING: This will remove all production containers and volumes!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(BLUE)Cleaning up production...$(NC)"; \
		docker compose --profile prod down -v; \
		echo "$(GREEN)✅ Production cleanup complete!$(NC)"; \
	else \
		echo "$(YELLOW)Operation cancelled.$(NC)"; \
	fi

# Database Operations (Development by default)
db-setup-dev: up-dev ## Setup development database (generate Prisma + migrate)
	@echo "$(BLUE)Setting up development database...$(NC)"
	@echo "$(YELLOW)Waiting for database to be ready...$(NC)"
	@sleep 3
	@echo "$(YELLOW)Generating Prisma Client...$(NC)"
	docker compose --profile dev exec app-dev npx prisma generate
	@echo "$(YELLOW)Running migrations...$(NC)"
	docker compose --profile dev exec app-dev npx prisma migrate dev --name init
	@echo "$(GREEN)✅ Development database setup complete!$(NC)"

db-setup-prod: up-prod ## Setup production database (generate Prisma + migrate)
	@echo "$(BLUE)Setting up production database...$(NC)"
	@echo "$(YELLOW)Waiting for database to be ready...$(NC)"
	@sleep 3
	@echo "$(YELLOW)Generating Prisma Client...$(NC)"
	docker compose --profile prod exec app-prod npx prisma generate
	@echo "$(YELLOW)Running migrations...$(NC)"
	docker compose --profile prod exec app-prod npx prisma migrate deploy
	@echo "$(GREEN)✅ Production database setup complete!$(NC)"

db-migrate: ## Create and apply new migration (development)
	@echo "$(BLUE)Creating migration...$(NC)"
	@read -p "Migration name: " name; \
	docker compose --profile dev exec app-dev npx prisma migrate dev --name $$name

db-reset: ## Reset database (WARNING: deletes all data) - development only
	@echo "$(RED)⚠️  WARNING: This will delete all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(BLUE)Resetting database...$(NC)"; \
		docker compose --profile dev exec app-dev npx prisma migrate reset --force; \
		echo "$(GREEN)✅ Database reset complete!$(NC)"; \
	else \
		echo "$(YELLOW)Operation cancelled.$(NC)"; \
	fi

db-push: ## Push schema changes to database without migration (development)
	@echo "$(BLUE)Pushing schema changes...$(NC)"
	docker compose --profile dev exec app-dev npx prisma db push

db-studio-dev: ## Open Prisma Studio in browser (development)
	@echo "$(BLUE)Opening Prisma Studio for development...$(NC)"
	@echo "$(YELLOW)Access at: http://localhost:5555$(NC)"
	docker compose --profile dev exec app-dev npx prisma studio

db-studio-prod: ## Open Prisma Studio in browser (production)
	@echo "$(BLUE)Opening Prisma Studio for production...$(NC)"
	@echo "$(YELLOW)Access at: http://localhost:5556$(NC)"
	docker compose --profile prod exec app-prod npx prisma studio --browser none --port 5556

db-seed: ## Run database seeds (if seed script exists) - development
	@echo "$(BLUE)Seeding database...$(NC)"
	@if [ -f prisma/seed.ts ]; then \
		docker compose --profile dev exec app-dev npx ts-node prisma/seed.ts; \
	elif [ -f prisma/seed.js ]; then \
		docker compose --profile dev exec app-dev node prisma/seed.js; \
	else \
		echo "$(YELLOW)No seed file found.$(NC)"; \
	fi

# Utility Commands
shell-dev: ## Open shell in development app container
	docker compose --profile dev exec app-dev sh

shell-prod: ## Open shell in production app container
	docker compose --profile prod exec app-prod sh

lint-dev: ## Run ESLint in development container
	@echo "$(BLUE)Running ESLint in development...$(NC)"
	docker compose --profile dev exec app-dev npm run lint

lint-prod: ## Run ESLint in production container
	@echo "$(BLUE)Running ESLint in production...$(NC)"
	docker compose --profile prod exec app-prod npm run lint

health-dev: ## Check if development services are running
	@echo "$(BLUE)Checking development service health...$(NC)"
	@echo "$(BLUE)Database:$(NC)"
	@docker compose --profile dev exec -T db-dev pg_isready -U Y && echo "$(GREEN)✅ Database is running$(NC)" || echo "$(RED)❌ Database is not running$(NC)"
	@echo "$(BLUE)App:$(NC)"
	@curl -s http://localhost:3000 > /dev/null && echo "$(GREEN)✅ App is running at http://localhost:3000$(NC)" || echo "$(RED)❌ App is not running$(NC)"

health-prod: ## Check if production services are running
	@echo "$(BLUE)Checking production service health...$(NC)"
	@echo "$(BLUE)Database:$(NC)"
	@docker compose --profile prod exec -T db-prod pg_isready -U Y && echo "$(GREEN)✅ Database is running$(NC)" || echo "$(RED)❌ Database is not running$(NC)"
	@echo "$(BLUE)App:$(NC)"
	@curl -s http://localhost:3001 > /dev/null && echo "$(GREEN)✅ App is running at http://localhost:3001$(NC)" || echo "$(RED)❌ App is not running$(NC)"

# Convenience aliases (default to dev)
up: up-dev ## Start development services (alias for up-dev)
down: down-dev ## Stop development services (alias for down-dev)
restart: restart-dev ## Restart development services (alias for restart-dev)
logs: logs-dev ## Show logs from development services (alias for logs-dev)
logs-app: logs-app-dev ## Show logs from development app (alias for logs-app-dev)
logs-db: logs-db-dev ## Show logs from development database (alias for logs-db-dev)
build: build-dev ## Build development Docker images (alias for build-dev)
rebuild: rebuild-dev ## Rebuild development Docker images (alias for rebuild-dev)
clean: clean-dev ## Clean development (alias for clean-dev)
db-setup: db-setup-dev ## Setup development database (alias for db-setup-dev)
db-studio: db-studio-dev ## Open Prisma Studio for development (alias for db-studio-dev)
shell: shell-dev ## Open shell in development app (alias for shell-dev)
lint: lint-dev ## Run ESLint in development (alias for lint-dev)
health: health-dev ## Check development services (alias for health-dev)

# Other Commands
install-local: ## Install dependencies locally
	npm install

init: ## Initialize project (copy .env files)
	@echo "$(BLUE)Initializing project...$(NC)"
	@if [ ! -f .env.dev ]; then \
		cp .env.example .env.dev; \
		echo "$(GREEN)✅ Created .env.dev from .env.example$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  .env.dev already exists$(NC)"; \
	fi
	@if [ ! -f .env.prod ]; then \
		cp .env.example .env.prod; \
		echo "$(GREEN)✅ Created .env.prod from .env.example$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  .env.prod already exists$(NC)"; \
	fi
	@echo "$(YELLOW)⚠️  Please edit .env.dev and .env.prod with your credentials!$(NC)"
