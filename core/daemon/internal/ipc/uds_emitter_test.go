package ipc

import (
	"testing"
	"time"

	"github.com/agenthelm/agenthelm-live/core/daemon/internal/core/ledger"
)

func TestUDSEmitterWireConversion(t *testing.T) {
	emitter := NewUDSEmitter("/tmp/test_agenthelm.sock")

	exitCode := 0
	step := &ledger.Step{
		StepID:     "step_042",
		SessionID:  "sess_9823f4a",
		Kind:       ledger.StepKindExec,
		StartedAt:  time.Date(2026, 9, 1, 12, 0, 0, 124000000, time.UTC),
		Cmd:        []string{"npm", "test"},
		ExitCode:   &exitCode,
		Files:      []string{"src/auth/jwt.ts"},
		DiffPatch:  "@@ -12,4 +12,6 @@\n+ const token = sign(payload, secret);\n",
		RiskLevel:  "LOW",
		Violations: []string{},
	}

	wire := emitter.ConvertStepToWire("AGENT_STEP_PROPOSED", step)

	if wire.EventType != "AGENT_STEP_PROPOSED" {
		t.Errorf("Expected event_type AGENT_STEP_PROPOSED, got %s", wire.EventType)
	}
	if wire.SessionID != "sess_9823f4a" {
		t.Errorf("Expected session_id sess_9823f4a, got %s", wire.SessionID)
	}
	if wire.StepID != "step_042" {
		t.Errorf("Expected step_id step_042, got %s", wire.StepID)
	}
	if wire.Command != "npm test" {
		t.Errorf("Expected command 'npm test', got %s", wire.Command)
	}
	if len(wire.AffectedFiles) != 1 || wire.AffectedFiles[0] != "src/auth/jwt.ts" {
		t.Errorf("Expected affected_files ['src/auth/jwt.ts'], got %v", wire.AffectedFiles)
	}
	if wire.SecurityAssessment.RiskLevel != "LOW" {
		t.Errorf("Expected risk_level LOW, got %s", wire.SecurityAssessment.RiskLevel)
	}
}

func TestUDSEmitterFallback(t *testing.T) {
	emitter := NewUDSEmitter("/tmp/nonexistent_socket_12345.sock")
	step := &ledger.Step{
		StepID:    "step_001",
		SessionID: "sess_test",
		Cmd:       []string{"ls", "-la"},
	}

	// Should not panic or error; falls back gracefully to stdout
	err := emitter.Emit("AGENT_STEP_PROPOSED", step)
	if err != nil {
		t.Errorf("Expected nil error on fallback, got %v", err)
	}
}
