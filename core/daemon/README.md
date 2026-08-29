# AgentHelm BAR Daemon (`core/daemon`)

The Blade Agent Runtime (BAR) Daemon is the core execution sandbox for AgentHelm Live.

## Features
- **Git Worktree Sandboxing**: Transparent, disposable workspace creation for agent sessions.
- **Regex & Heuristic Policy Interceptor**: Blocks destructive operations (`rm -rf /`, raw disk writes, fork bombs) before execution.
- **Step Ledger**: Append-only log recording commands, cwd, exit codes, and diff statistics.
- **UDS Telemetry Emitter**: Emits events to `/tmp/agenthelm.sock` conforming to the Master Wire Protocol, with graceful fallback to stdout JSONL.

## CLI Usage
```bash
# Wrap agent execution
agenthelm-bar --task task_01 --session sess_123 -- npm test
```
