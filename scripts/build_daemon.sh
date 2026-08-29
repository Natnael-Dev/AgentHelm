#!/usr/bin/env bash
set -euo pipefail

echo "Building AgentHelm Live BAR Daemon..."
cd "$(dirname "$0")/../core/daemon"
go build -o ../../bin/agenthelm-bar ./cmd/agenthelm-bar
echo "Built bin/agenthelm-bar successfully."
