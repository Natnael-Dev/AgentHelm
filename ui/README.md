# AgentGuard Cockpit UI (`ui/`)

Mission-critical operator cockpit built with **React 18**, **TypeScript**, **Tailwind CSS**, **Monaco Editor**, and **Tauri v2**.

## Features
- **Real-Time Telemetry Feed**: Live WebSocket ingestion at `ws://127.0.0.1:8765/ws/events` with automatic exponential backoff reconnection.
- **Monaco Code Diff Viewer**: Split-pane diff inspection highlighting additions in emerald and deletions in rose.
- **Bento Grid Dashboard Layout**: High-density responsive view showing token velocity, estimated cost ($ USD), and active policy violations.
- **Operator Intervention Deck**: 1-click `[Approve & Merge]`, `[Step Undo]`, and emergency `[KILL PROCESS]` panic button.

## Development
```bash
# Run web preview
npm run dev

# Run Tauri desktop app
npm run tauri dev
```
