# AgentGuard Extensions (`extensions/`)

Modular power-ups extending the sandbox runtime with documentation retrieval and host IDE integration.

---

## 1. Ketch Docs Scraper (`extensions/docs-scraper/`)
Ported from `1broseidon/ketch`. A headless, high-throughput web scraper designed specifically for AI agent context injection.

- **Capabilities**:
  - Fetches documentation URLs over HTTP/HTTPS with automatic redirect handling (max 5) and custom user-agent.
  - Converts HTML DOM to clean Markdown (strips `<script>`, `<style>`, `<nav>`, `<footer>`, `<aside>`, ads).
  - 2MB memory cap per document to prevent memory exhaustion attacks.
  - Generates `CONTEXT_FETCHED` wire events consumed by the Cockpit UI and Telemetry Engine.
- **Standalone CLI**:
  ```bash
  go run cmd/ketch/main.go https://docs.rs/tokio/latest/tokio/
  go run cmd/ketch/main.go --json https://go.dev/doc/
  ```

---

## 2. Exeora MCP Tunnel (`extensions/mcp-tunnel/`)
Ported from `leynier/exeora`. Encrypted loopback bridge exposing Model Context Protocol (MCP) server capabilities to external AI coding agents (Claude Code, Cursor, Windsurf).

- **Capabilities**:
  - AES-256-GCM encrypted WebSocket loopback transport (`ws://127.0.0.1:9000`).
  - JSON-RPC 2.0 MCP server implementing tools:
    - `read_sandbox_file`: Safely read workspace files with strict directory traversal prevention.
    - `list_sandbox_tree`: Inspect worktree filesystem topology.
    - `inspect_ledger`: Query append-only security ledger steps and policy state.
  - Daemon child process lifecycle management with automatic SIGINT/SIGTERM trapping.
  - Broadcasts `MCP_TUNNEL_ACTIVE` wire events upon successful binding.
- **Standalone Launch**:
  ```bash
  node start.js --port 9000 --host 127.0.0.1
  ```

---

## 3. Daemon CLI Integration (`core/daemon/`)
The extensions are unified directly into the `agentguard-bar` daemon CLI:
```bash
# Scrape documentation into the agent context
agentguard-bar fetch-docs https://docs.rs/tokio/latest/tokio/

# Spawn MCP tunnel for external IDE connection
agentguard-bar start-tunnel --port 9000
```
