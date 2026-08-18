# AgentGuard Telemetry & Dispatch Engine (`telemetry/`)

High-performance Rust telemetry hub built with **Axum**, **Tokio**, and **broadcast channels**.

## Architecture Pipeline

```
[ Go BAR Daemon ] 
       │ (Unix Domain Socket /tmp/agentguard.sock)
       ▼
[ UdsListener ] ──> [ tokio::sync::broadcast ] ──> [ Axum WebSocket Handler (/ws/events) ]
       │                                                              │
       ▼                                                              ▼
[ AnalyticsTracker ] (/api/analytics)                    [ Tauri Cockpit UI ]
```

## Endpoints
- `GET /health`: Microservice health check
- `GET /api/analytics`: Aggregate token consumption, velocity, and policy violations
- `GET /ws/events`: Full-duplex WebSocket stream forwarding `WireEvent` JSON messages to Cockpit UI

## Running
```bash
cargo run --bin telemetry
```
Server binds to `0.0.0.0:8765`.
