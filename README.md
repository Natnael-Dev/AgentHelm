```text
   ▄▄▄       ▄████  ▓█████  ███▄    █ ▄▄▄█████▓ ▄████  █    ██  ▄▄▄       ██▀███  ▓█████▄
  ▒████▄    ██▒ ▀█▒ ▓█   ▀  ██ ▀█   █ ▓  ██▒ ▓▒██▒ ▀█▒ ██  ▓██▒▒████▄    ▓██ ▒ ██▒▒██▀ ██▌
  ▒██  ▀█▄ ▒██░▄▄▄░ ▒███   ▓██  ▀█ ██▒▒ ▓██░ ▒░██░▄▄▄░▓██  ▒██░▒██  ▀█▄  ▓██ ░▄█ ▒░██   █▌
  ░██▄▄▄▄██░▓█  ██▓ ▒▓█  ▄ ▓██▒  ▐▌██▒░ ▓██▓ ░░▓█  ██▓▓▓█  ░██░░██▄▄▄▄██ ▒██▀▀█▄  ░▓█▄   ▌
   ▓█   ▓██▒░▒▓███▀▒░▒████▒▒██░   ▓██░  ▒██▒ ░░▒▓███▀▒▒▒█████▓  ▓█   ▓██▒░██▓ ▒██▒░▒████▓ 
   ▒▒   ▓▒█░ ░▒   ▒ ░░ ▒░ ░░ ▒░   ▒ ▒   ▒ ░░   ░▒   ▒ ▒▒▓▒ ▒ ▒  ▒▒   ▓▒█░░ ▒▓ ░▒▓░ ▒▒▓  ▒ 
    ▒   ▒▒ ░  ░   ░  ░ ░  ░░ ░░   ░ ▒░    ░     ░   ░ ░ ▒░ ░ ░   ▒   ▒▒ ░  ░▒ ░ ▒░ ░ ▒  ▒ 
    ░   ▒   ░ ░   ░    ░      ░   ░ ░   ░      ░ ░   ░ ░ ░  ░ ░   ░   ▒     ░░   ░  ░ ░  ░ 
        ░  ░      ░    ░  ░         ░                ░   ░            ░  ░   ░        ░    
                                                                                        ░     
```

# AgentGuard Live — Mission-Critical AI Execution Cockpit

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Go 1.22](https://img.shields.io/badge/Go-1.22-00ADD8.svg)](https://golang.org)
[![Rust 1.77](https://img.shields.io/badge/Rust-1.77-DEA584.svg)](https://www.rust-lang.org)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24C8D8.svg)](https://tauri.app)
[![Node.js 20](https://img.shields.io/badge/Node.js-20-339933.svg)](https://nodejs.org)

> **AgentGuard Live** is an analog mission-control dashboard and sandboxed execution runtime for autonomous AI coding agents. It intercepts terminal actions, enforces strict security policies, runs operations in isolated Git worktrees, broadcasts live AST step telemetry over Unix Domain Sockets, and provides human-in-the-loop approval, rollback, and kill controls.

---

## ⚡ Quick Start

### 1. Launch with One Command (Docker + Local UI)
```bash
# Clone the repository
git clone https://github.com/agentguard/agentguard-live.git
cd agentguard-live

# Spin up backend containers & launch local cockpit UI
make dev
```
Open **`http://localhost:5173`** (or the native Tauri desktop window) to access the live cockpit.

---

## 🏛️ System Architecture

```text
  ┌─────────────────────────────────────────────────────────────┐
  │                 Autonomous AI Coding Agent                  │
  │               (Claude Code / Cursor / Windsurf)             │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                 CLI Interception / MCP Protocol
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │         AgentGuard Blade Agent Runtime (BAR) Daemon         │
  │                     (Go 1.22 Daemon)                        │
  ├─────────────────────────────────────────────────────────────┤
  │  • Regex Security Policy Engine (Blocks rm -rf, mkfs, etc.) │
  │  • Ephemeral Git Worktree Isolation (sandbox-042)           │
  │  • Append-Only State Ledger (ledger.jsonl)                  │
  │  • Ketch Documentation Scraper (extensions/docs-scraper)    │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                   Unix Domain Socket (JSONL)
                   /tmp/agentguard.sock
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │            Telemetry & Dispatch Nervous System              │
  │                     (Rust 1.77 Axum)                        │
  ├─────────────────────────────────────────────────────────────┤
  │  • High-throughput broadcast channel (tokio::sync::broadcast)│
  │  • Real-time token velocity & $ USD cost aggregation        │
  │  • Stream Deck & Physical Panic Button hardware hooks       │
  └───────────────┬─────────────────────────────┬───────────────┘
                  │                             │
       WebSocket (Port 8765)         MCP Loopback (Port 9000)
                  ▼                             ▼
  ┌──────────────────────────────┐┌─────────────────────────────┐
  │    AgentGuard Cockpit UI     ││     Exeora MCP Tunnel       │
  │ (Tauri v2 + React 18 + Vite) ││   (Node.js 20 + JSON-RPC)   │
  ├──────────────────────────────┤├─────────────────────────────┤
  │ • Mission-Control Brutalist  ││ • Encrypted Local Loopback  │
  │ • Live Step Timeline Cards   ││ • read_sandbox_file         │
  │ • Side-by-Side Monaco Diff   ││ • list_sandbox_tree         │
  │ • Paper Token Analytics      ││ • inspect_ledger            │
  │ • 3D Hardware Keycap Deck    ││                             │
  └──────────────────────────────┘└─────────────────────────────┘
```

---

## 🔌 Connecting External Agents (Claude Code / Cursor)

AgentGuard exposes an encrypted Model Context Protocol (MCP) server so external IDEs can inspect the sandbox safely.

### Cursor / Claude Code Configuration
Add the following to your `mcpServers` configuration (`~/.cursor/mcp.json` or `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "agentguard-sandbox": {
      "command": "node",
      "args": [
        "/path/to/agentguard-live/extensions/mcp-tunnel/start.js",
        "--port",
        "9000",
        "--host",
        "127.0.0.1"
      ],
      "env": {
        "AGENTGUARD_MCP_SECRET": "agentguard_master_secret_key_32b"
      }
    }
  }
}
```

### Available MCP Tools:
- **`read_sandbox_file`**: Read files inside the isolated worktree with strict path traversal prevention.
- **`list_sandbox_tree`**: Inspect the sandbox directory structure.
- **`inspect_ledger`**: Query the append-only security ledger and active policy rules.

---

## 🛠️ CLI Reference

### 1. Intercepting Agent Commands
```bash
agentguard-bar --session sess_9823f4a -- npm test
```

### 2. Fetching Documentation (Ketch Scraper)
```bash
agentguard-bar fetch-docs https://docs.rs/tokio/latest/tokio/
```

### 3. Starting the MCP Tunnel
```bash
agentguard-bar start-tunnel --port 9000
```

---

## 📦 Build & Release

```bash
# Compile backend binaries (Go + Rust) to ./bin/
make build-backend

# Compile and package native Tauri desktop binary
make build-ui

# Run full test suite across Go, Rust, and TypeScript
make test

# Clean all containers and temporary build files
make clean
```

---

## 📄 License
MIT © 2026 AgentGuard Contributors.
