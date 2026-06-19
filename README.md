# 🛡️ AgentGuard Live

> **Mission-Critical Autonomous Agent Security, Isolation Runtime & Real-Time Telemetry Streaming Platform**

AgentGuard Live is an integrated, high-performance monorepo platform designed for governing, sandboxing, and monitoring autonomous coding agents (such as Claude Code, Cline, OpenCode, and custom AI agents) in real time.

---

## 🏛️ Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                              AgentGuard Cockpit (UI)                              |
|                   (Tauri v2 + React + Tailwind + Lucide Icons)                    |
+-----------------------------------------------------------------------------------+
                                         │  ▲ (ws://127.0.0.1:4000/ws/events)
                                         ▼  │
+-----------------------------------------------------------------------------------+
|                           Telemetry & Ingestion Core                              |
|                   (Rust + Axum + Tokio + SQLite / In-Memory State)                |
+-----------------------------------------------------------------------------------+
                                         ▲
                                         │ (IPC / JSON Socket Wire Protocol)
                                         ▼
+-----------------------------------------------------------------------------------+
|                            BAR Execution Sandbox Core                             |
|               (Go + Git Worktree Isolation + Ledger + Policy Engine)              |
+-----------------------------------------------------------------------------------+
        │                                                           │
        ▼                                                           ▼
+-----------------------+                                   +-----------------------+
|  MCP Secure Gateway   |                                   | Live Docs Scraper     |
|   (TypeScript / Node) |                                   |     (Go CLI)          |
+-----------------------+                                   +-----------------------+
```

---

## 📁 Repository Structure

```
agentguard-live/
├── scripts/              # Developer tooling & contribution automation
├── core/                 # Go BAR runtime daemon (worktree sandboxing & policy engine)
│   └── daemon/
├── telemetry/            # Rust Axum/Tokio telemetry aggregation & metrics service
│   └── src/
├── ui/                   # Tauri v2 / React cockpit dashboard
│   └── src/
├── extensions/           # Auxiliary agent bridges & scrapers
│   ├── mcp-tunnel/       # Model Context Protocol secure proxy
│   └── docs-scraper/     # High-speed headless documentation crawler
├── shared/               # Cross-language contracts & schemas
│   ├── schemas/          # JSON wire formats (EventEnvelope, ExecutionStep)
│   └── contracts/        # IPC / WebSocket protocols
├── docker/               # Container deployment configurations
├── Cargo.toml            # Rust workspace root
├── go.work               # Go workspace root
└── README.md
```

---

## ⚡ Key Capabilities

1. **Deterministic Execution Isolation**: Git-worktree-backed disposable environments prevent uncommitted workspace corruption.
2. **Real-Time Policy Interception**: Regex-based and heuristic command policy checks intercept destructive actions (`rm -rf /`, raw disk writes) before execution.
3. **Structured Step Ledger**: Immutable audit log capturing command payloads, working directories, execution duration, diffs, and exit codes.
4. **Sub-Millisecond Telemetry Streaming**: High-throughput Axum WebSocket hub broadcasting agent activity, token burn, and regression signals to the UI.
5. **Universal Tool Collector**: Ingests session traces from Claude Code, Cline, Gemini CLI, and custom agents via local log tailing.

---

## 🚀 Quick Start

### Prerequisites
- **Go**: 1.22+
- **Rust**: 1.78+ (Edition 2021/2024)
- **Node.js**: 20+
- **Git**: 2.38+

### Setup
```bash
# Clone the repository
git clone https://github.com/agentguard/agentguard-live.git
cd agentguard-live

# Verify Go workspace
go work sync

# Verify Rust workspace
cargo check
```

---

## 📄 License
MIT License.
