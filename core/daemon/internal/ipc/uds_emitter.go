package ipc

import (
	"encoding/json"
	"fmt"
	"net"
	"strings"
	"sync"
	"time"

	"github.com/agenthelm/agenthelm-live/core/daemon/internal/core/ledger"
)

const DefaultSocketPath = "/tmp/agenthelm.sock"

type UDSEmitter struct {
	SocketPath string
	mu         sync.Mutex
}

func NewUDSEmitter(socketPath string) *UDSEmitter {
	if socketPath == "" {
		socketPath = DefaultSocketPath
	}
	return &UDSEmitter{
		SocketPath: socketPath,
	}
}

// ConvertStepToWire formats a BAR ledger.Step into the exact AgentHelm Master Wire Protocol
func (e *UDSEmitter) ConvertStepToWire(eventType string, step *ledger.Step) *WireEvent {
	cmdStr := ""
	if len(step.Cmd) > 0 {
		cmdStr = strings.Join(step.Cmd, " ")
	}

	sessionID := step.SessionID
	if sessionID == "" {
		sessionID = "sess_default"
	}

	riskLevel := step.RiskLevel
	if riskLevel == "" {
		riskLevel = "LOW"
	}

	violations := step.Violations
	if violations == nil {
		violations = []string{}
	}

	affectedFiles := step.Files
	if affectedFiles == nil {
		affectedFiles = []string{}
	}

	ts := step.StartedAt.UTC().Format(time.RFC3339Nano)
	if step.StartedAt.IsZero() {
		ts = time.Now().UTC().Format(time.RFC3339Nano)
	}

	return &WireEvent{
		EventType:     eventType,
		SessionID:     sessionID,
		StepID:        step.StepID,
		Timestamp:     ts,
		Command:       cmdStr,
		AffectedFiles: affectedFiles,
		DiffPatch:     step.DiffPatch,
		SecurityAssessment: SecurityAssessment{
			RiskLevel:        riskLevel,
			PolicyViolations: violations,
		},
	}
}

// Emit broadcasts the step via Unix Domain Socket, or falls back to stdout JSONL if UDS is unavailable.
func (e *UDSEmitter) Emit(eventType string, step *ledger.Step) error {
	wireEvent := e.ConvertStepToWire(eventType, step)
	return e.EmitWireEvent(wireEvent)
}

// EmitWireEvent marshals and sends any WireEvent payload to UDS or stdout JSONL
func (e *UDSEmitter) EmitWireEvent(wireEvent *WireEvent) error {
	e.mu.Lock()
	defer e.mu.Unlock()

	payload, err := json.Marshal(wireEvent)
	if err != nil {
		return fmt.Errorf("failed to marshal wire event: %w", err)
	}

	// Attempt UDS connection
	conn, dialErr := net.DialTimeout("unix", e.SocketPath, 50*time.Millisecond)
	if dialErr == nil {
		defer conn.Close()
		_, writeErr := conn.Write(append(payload, '\n'))
		if writeErr == nil {
			return nil
		}
	}

	// Graceful fallback to stdout JSONL for local debugging/development
	fmt.Printf("[JSONL_FALLBACK] %s\n", string(payload))
	return nil
}

// EmitContextFetched emits a Ketch docs scraping event
func (e *UDSEmitter) EmitContextFetched(sessionID, stepID, url, title, markdown string) error {
	wireEvent := &WireEvent{
		EventType:     EventContextFetched,
		SessionID:     sessionID,
		StepID:        stepID,
		Timestamp:     time.Now().UTC().Format(time.RFC3339Nano),
		Command:       fmt.Sprintf("fetch-docs %s", url),
		AffectedFiles: []string{},
		DiffPatch:     "",
		SecurityAssessment: SecurityAssessment{
			RiskLevel:        "LOW",
			PolicyViolations: []string{},
		},
		Context: &ContextPayload{
			URL:       url,
			Title:     title,
			Markdown:  markdown,
			ByteCount: len(markdown),
		},
	}
	return e.EmitWireEvent(wireEvent)
}

// EmitMCPTunnelActive emits an Exeora MCP tunnel active status event
func (e *UDSEmitter) EmitMCPTunnelActive(sessionID, stepID, host string, port, pid int) error {
	wireEvent := &WireEvent{
		EventType:     EventMCPTunnelActive,
		SessionID:     sessionID,
		StepID:        stepID,
		Timestamp:     time.Now().UTC().Format(time.RFC3339Nano),
		Command:       fmt.Sprintf("start-tunnel --port %d", port),
		AffectedFiles: []string{},
		DiffPatch:     "",
		SecurityAssessment: SecurityAssessment{
			RiskLevel:        "LOW",
			PolicyViolations: []string{},
		},
		MCPTunnel: &MCPTunnelPayload{
			Host:      host,
			Port:      port,
			PID:       pid,
			Status:    "ACTIVE",
			Endpoints: []string{fmt.Sprintf("ws://%s:%d", host, port), fmt.Sprintf("http://%s:%d/mcp/rpc", host, port)},
		},
	}
	return e.EmitWireEvent(wireEvent)
}
