# ─── AGENTGUARD LIVE MASTER BUILD ORCHESTRATION ──────────────────────────────
.PHONY: help dev dev-up dev-down build-backend build-ui build-all test clean

# Default target
.DEFAULT_GOAL := help

help: ## Display this help message
	@echo "========================================================================"
	@echo "  AGENTGUARD LIVE — MISSION-CRITICAL AI COCKPIT BUILD SYSTEM"
	@echo "========================================================================"
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ─── DEVELOPMENT ENVIRONMENT ──────────────────────────────────────────────────

dev: ## Start full stack development environment (Docker backend + local UI)
	@echo "[*] Launching AgentGuard backend services via Docker Compose..."
	docker compose up -d
	@echo "[*] Starting Vite development server for Cockpit UI..."
	cd ui && npm run dev

dev-up: ## Spin up backend containers (Go Daemon, Rust Telemetry, MCP Tunnel)
	docker compose up -d

dev-down: ## Stop all running background Docker containers
	docker compose down

# ─── COMPILATION & PACKAGING ─────────────────────────────────────────────────

build-backend: ## Compile native binaries for Go Daemon and Rust Telemetry
	@echo "[*] Building Go BAR Daemon & Ketch Scraper..."
	cd core/daemon && go build -v -o ../../bin/agentguard-bar ./cmd/agentguard-bar
	cd extensions/docs-scraper && go build -v -o ../../bin/ketch ./cmd/ketch
	@echo "[*] Building Rust Telemetry & Dispatch Engine..."
	cargo build --release --package agentguard-telemetry
	@mkdir -p bin
	@cp target/release/agentguard-telemetry bin/ 2>/dev/null || true
	@echo "[+] Backend binaries compiled to ./bin/"

build-ui: ## Compile production React bundle and assemble Tauri desktop application
	@echo "[*] Compiling React frontend assets..."
	cd ui && npm run build
	@echo "[*] Bundling Tauri desktop application..."
	cd ui && cargo tauri build
	@echo "[+] Desktop binary packaged in ui/src-tauri/target/release/bundle/"

build-all: build-backend build-ui ## Build complete monorepo (backend + desktop app)

# ─── TESTING & VALIDATION ─────────────────────────────────────────────────────

test: ## Execute test suites across Go, Rust, and UI packages
	@echo "[*] Running Go daemon tests..."
	cd core/daemon && go test -v ./...
	cd extensions/docs-scraper && go test -v ./...
	@echo "[*] Running Rust telemetry tests..."
	cargo test --package agentguard-telemetry
	@echo "[*] Validating TypeScript compilation..."
	cd ui && npm run build

# ─── HOUSEKEEPING ─────────────────────────────────────────────────────────────

clean: ## Tear down containers and wipe build artifacts
	@echo "[*] Cleaning Docker environment..."
	docker compose down -v --remove-orphans || true
	@echo "[*] Removing build artifacts..."
	rm -rf bin/ target/ ui/dist/ ui/node_modules/.vite 2>/dev/null || true
	@echo "[+] Clean complete."
