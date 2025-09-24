# =============================================================================
# TASK MANAGEMENT APPLICATION - DEVELOPMENT MAKEFILE
# =============================================================================

.PHONY: help dev dev-server dev-web test test-server test-web lint lint-server lint-web build build-server build-web clean logs seed deploy install

# Default target
.DEFAULT_GOAL := help

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
PURPLE := \033[0;35m
CYAN := \033[0;36m
WHITE := \033[1;37m
NC := \033[0m # No Color

# Project configuration
PROJECT_NAME := taskmanagement
DOCKER_COMPOSE := docker-compose
DOCKER := docker

# =============================================================================
# HELP
# =============================================================================

help: ## Show this help message
	@echo "$(WHITE)TaskManagement Development Commands$(NC)"
	@echo "$(CYAN)====================================$(NC)"
	@echo ""
	@echo "$(YELLOW)Development:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST) | grep -E "(dev|install|clean)"
	@echo ""
	@echo "$(YELLOW)Testing:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST) | grep -E "test"
	@echo ""
	@echo "$(YELLOW)Code Quality:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST) | grep -E "lint"
	@echo ""
	@echo "$(YELLOW)Build & Deploy:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST) | grep -E "(build|deploy)"
	@echo ""
	@echo "$(YELLOW)Utilities:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST) | grep -E "(logs|seed|status)"

# =============================================================================
# INSTALLATION
# =============================================================================

install: install-server install-web ## Install all dependencies
	@echo "$(GREEN)✓ All dependencies installed$(NC)"

install-server: ## Install server dependencies
	@echo "$(BLUE)Installing server dependencies...$(NC)"
	@cd server && npm install
	@echo "$(GREEN)✓ Server dependencies installed$(NC)"

install-web: ## Install web dependencies
	@echo "$(BLUE)Installing web dependencies...$(NC)"
	@cd web && npm install
	@echo "$(GREEN)✓ Web dependencies installed$(NC)"

# =============================================================================
# DEVELOPMENT
# =============================================================================

dev: ## Start full development environment with Docker Compose
	@echo "$(BLUE)Starting development environment...$(NC)"
	@$(DOCKER_COMPOSE) up --build -d
	@echo "$(GREEN)✓ Development environment started$(NC)"
	@echo "$(CYAN)Frontend: http://localhost:3000$(NC)"
	@echo "$(CYAN)Backend:  http://localhost:8080$(NC)"
	@echo "$(CYAN)API Docs: http://localhost:8080/docs$(NC)"

dev-server: ## Start only the server in development mode
	@echo "$(BLUE)Starting server in development mode...$(NC)"
	@cd server && npm run dev

dev-web: ## Start only the web app in development mode
	@echo "$(BLUE)Starting web app in development mode...$(NC)"
	@cd web && npm run dev

dev-stop: ## Stop development environment
	@echo "$(BLUE)Stopping development environment...$(NC)"
	@$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✓ Development environment stopped$(NC)"

# =============================================================================
# TESTING
# =============================================================================

test: test-server test-web ## Run all tests
	@echo "$(GREEN)✓ All tests completed$(NC)"

test-server: ## Run server tests
	@echo "$(BLUE)Running server tests...$(NC)"
	@cd server && npm test
	@echo "$(GREEN)✓ Server tests completed$(NC)"

test-web: ## Run web tests
	@echo "$(BLUE)Running web tests...$(NC)"
	@cd web && npm test
	@echo "$(GREEN)✓ Web tests completed$(NC)"

test-watch: ## Run tests in watch mode
	@echo "$(BLUE)Running tests in watch mode...$(NC)"
	@cd server && npm run test:watch &
	@cd web && npm run test:watch

test-coverage: ## Run tests with coverage
	@echo "$(BLUE)Running tests with coverage...$(NC)"
	@cd server && npm run test:coverage
	@cd web && npm run test:coverage

# =============================================================================
# CODE QUALITY
# =============================================================================

lint: lint-server lint-web ## Run linting for all projects
	@echo "$(GREEN)✓ All linting completed$(NC)"

lint-server: ## Lint server code
	@echo "$(BLUE)Linting server code...$(NC)"
	@cd server && npm run lint
	@echo "$(GREEN)✓ Server linting completed$(NC)"

lint-web: ## Lint web code
	@echo "$(BLUE)Linting web code...$(NC)"
	@cd web && npm run lint
	@echo "$(GREEN)✓ Web linting completed$(NC)"

lint-fix: ## Fix linting issues
	@echo "$(BLUE)Fixing linting issues...$(NC)"
	@cd server && npm run lint:fix
	@cd web && npm run lint:fix
	@echo "$(GREEN)✓ Linting issues fixed$(NC)"

format: ## Format code with Prettier
	@echo "$(BLUE)Formatting code...$(NC)"
	@cd server && npm run format
	@cd web && npm run format
	@echo "$(GREEN)✓ Code formatted$(NC)"

# =============================================================================
# BUILD
# =============================================================================

build: build-server build-web ## Build all projects
	@echo "$(GREEN)✓ All projects built$(NC)"

build-server: ## Build server for production
	@echo "$(BLUE)Building server...$(NC)"
	@cd server && npm run build
	@echo "$(GREEN)✓ Server built$(NC)"

build-web: ## Build web app for production
	@echo "$(BLUE)Building web app...$(NC)"
	@cd web && npm run build
	@echo "$(GREEN)✓ Web app built$(NC)"

build-docker: ## Build Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	@$(DOCKER_COMPOSE) build
	@echo "$(GREEN)✓ Docker images built$(NC)"

# =============================================================================
# CLEANUP
# =============================================================================

clean: clean-containers clean-volumes clean-deps ## Clean everything
	@echo "$(GREEN)✓ Cleanup completed$(NC)"

clean-containers: ## Remove all containers
	@echo "$(BLUE)Removing containers...$(NC)"
	@$(DOCKER_COMPOSE) down --remove-orphans
	@$(DOCKER) container prune -f
	@echo "$(GREEN)✓ Containers removed$(NC)"

clean-volumes: ## Remove all volumes
	@echo "$(BLUE)Removing volumes...$(NC)"
	@$(DOCKER_COMPOSE) down -v
	@$(DOCKER) volume prune -f
	@echo "$(GREEN)✓ Volumes removed$(NC)"

clean-deps: ## Remove node_modules and reinstall
	@echo "$(BLUE)Cleaning dependencies...$(NC)"
	@rm -rf server/node_modules web/node_modules
	@rm -rf server/package-lock.json web/package-lock.json
	@make install
	@echo "$(GREEN)✓ Dependencies cleaned$(NC)"

clean-logs: ## Clean log files
	@echo "$(BLUE)Cleaning log files...$(NC)"
	@rm -rf logs/*.log
	@echo "$(GREEN)✓ Log files cleaned$(NC)"

# =============================================================================
# UTILITIES
# =============================================================================

logs: ## View application logs
	@echo "$(BLUE)Viewing application logs...$(NC)"
	@$(DOCKER_COMPOSE) logs -f

logs-server: ## View server logs
	@echo "$(BLUE)Viewing server logs...$(NC)"
	@$(DOCKER_COMPOSE) logs -f server

logs-web: ## View web logs
	@echo "$(BLUE)Viewing web logs...$(NC)"
	@$(DOCKER_COMPOSE) logs -f web

seed: ## Populate database with sample data
	@echo "$(BLUE)Seeding database...$(NC)"
	@$(DOCKER_COMPOSE) exec server npm run seed
	@echo "$(GREEN)✓ Database seeded$(NC)"

status: ## Show status of all services
	@echo "$(BLUE)Service Status:$(NC)"
	@$(DOCKER_COMPOSE) ps

shell-server: ## Open shell in server container
	@$(DOCKER_COMPOSE) exec server sh

shell-web: ## Open shell in web container
	@$(DOCKER_COMPOSE) exec web sh

shell-db: ## Open MongoDB shell
	@$(DOCKER_COMPOSE) exec mongodb mongosh

# =============================================================================
# DEPLOYMENT
# =============================================================================

deploy: build-docker ## Deploy to production
	@echo "$(BLUE)Deploying to production...$(NC)"
	@$(DOCKER_COMPOSE) -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✓ Deployed to production$(NC)"

deploy-staging: build-docker ## Deploy to staging
	@echo "$(BLUE)Deploying to staging...$(NC)"
	@$(DOCKER_COMPOSE) -f docker-compose.staging.yml up -d
	@echo "$(GREEN)✓ Deployed to staging$(NC)"

# =============================================================================
# DEVELOPMENT HELPERS
# =============================================================================

restart: dev-stop dev ## Restart development environment
	@echo "$(GREEN)✓ Development environment restarted$(NC)"

update: ## Update dependencies
	@echo "$(BLUE)Updating dependencies...$(NC)"
	@cd server && npm update
	@cd web && npm update
	@echo "$(GREEN)✓ Dependencies updated$(NC)"

check: lint test ## Run linting and tests
	@echo "$(GREEN)✓ Code quality check completed$(NC)"

# =============================================================================
# DATABASE OPERATIONS
# =============================================================================

db-backup: ## Backup database
	@echo "$(BLUE)Backing up database...$(NC)"
	@mkdir -p backups
	@$(DOCKER_COMPOSE) exec mongodb mongodump --out /backup
	@$(DOCKER) cp taskmanagement-mongodb:/backup ./backups/$(shell date +%Y%m%d_%H%M%S)
	@echo "$(GREEN)✓ Database backed up$(NC)"

db-restore: ## Restore database from backup
	@echo "$(BLUE)Restoring database...$(NC)"
	@echo "$(YELLOW)Please specify backup directory: make db-restore BACKUP_DIR=backups/20240101_120000$(NC)"
	@if [ -z "$(BACKUP_DIR)" ]; then echo "$(RED)Error: BACKUP_DIR not specified$(NC)"; exit 1; fi
	@$(DOCKER) cp $(BACKUP_DIR) taskmanagement-mongodb:/restore
	@$(DOCKER_COMPOSE) exec mongodb mongorestore /restore
	@echo "$(GREEN)✓ Database restored$(NC)"
