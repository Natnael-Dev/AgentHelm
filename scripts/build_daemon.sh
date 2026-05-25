#!/usr/bin/env bash
set -euo pipefail

echo "Building AgentGuard Live BAR Daemon..."
cd "$(dirname "$0")/../core/daemon"
go build -o ../../bin/agentguard-bar ./cmd/agentguard-bar
echo "Built bin/agentguard-bar successfully."
