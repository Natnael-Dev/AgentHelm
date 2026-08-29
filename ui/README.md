# AgentHelm Cockpit UI (`ui/`)

Mission-critical operator cockpit with pixel-faithful Figma mission-control brutalist design.

## Design System Tokens
- **Palette**: Void (`#0E0D0B`), Charcoal (`#171512`), Border (`#2A2721`), Cream (`#EDE6D6`), Ink (`#14120E`), Orange (`#E4572E`), Green (`#8AB661`), Amber (`#E8A33D`), Red (`#D64533`), Bone (`#8A8578`).
- **Typography**: 
  - Display: `Fraunces` (Display Serif)
  - Data / Labels / Code: `Space Mono` (Monospace)
  - Body: `Archivo` (Sans-serif)
- **Textures**: SVG `feTurbulence` film grain overlay, CRT scanlines (`repeating-linear-gradient`), paper rule textures, corner registration marks, and solid `4px 4px 0 #000` offset shadows.

## Components
1. **TopBar (`Header.tsx`)**: Monospace wordmark, blinking orange status beacon, cream session chip (`SESS_9823F4A • WORKTREE sandbox-042 • CLEAN`), status LEDs (`WS:8765 LINKED`, `UDS LINKED`, `STREAM DECK: ARMED`), and live UTC clock.
2. **StepTimeline (`StepTimeline.tsx`)**: Live step feed with risk pills (`LOW`, `MED`, `HIGH`, `CRIT`), command chips, file tags, and active step scanline highlight.
3. **PatchViewer (`MonacoDiff.tsx`)**: Custom Monaco `agenthelm-brutalist` dark theme, addition/deletion counters, file tabs, and CRT scanlines.
4. **TokenAnalytics (`AnalyticsGauge.tsx`)**: Cream paper card with giant 52px Fraunces cost readout (`$0.0042`), active VU-meter bar waveform, and token velocity readout.
5. **PolicyEngine (`PolicyPanel.tsx`)**: Armed security policy rules with blocked strikethrough indicators and clean violation state.
6. **SandboxCard (`SandboxPanel.tsx`)**: SVG git worktree isolation topology and ledger statistics.
7. **ControlDeck (`ControlPanel.tsx`)**: 3D hardware keycap buttons with tactile press states: `[ ✓ APPROVE & MERGE ]`, `[ ↩ STEP UNDO ]`, and `[ ■ KILL PROCESS ]` with hazard-striped border.

## Development & Production
```bash
# Install dependencies
npm install

# Run Vite dev preview
npm run dev

# Compile production bundle
npm run build
```
