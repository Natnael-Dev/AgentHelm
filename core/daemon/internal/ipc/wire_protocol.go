package ipc

// Event type constants
const (
	EventAgentStepProposed  = "AGENT_STEP_PROPOSED"
	EventAgentStepBlocked   = "AGENT_STEP_BLOCKED"
	EventAgentStepCompleted = "AGENT_STEP_COMPLETED"
	EventContextFetched     = "CONTEXT_FETCHED"
	EventMCPTunnelActive    = "MCP_TUNNEL_ACTIVE"
)

type SecurityAssessment struct {
	RiskLevel        string   `json:"risk_level"`
	PolicyViolations []string `json:"policy_violations"`
}

type ContextPayload struct {
	URL       string `json:"url,omitempty"`
	Title     string `json:"title,omitempty"`
	Markdown  string `json:"markdown,omitempty"`
	ByteCount int    `json:"byte_count,omitempty"`
}

type MCPTunnelPayload struct {
	Host      string   `json:"host,omitempty"`
	Port      int      `json:"port,omitempty"`
	PID       int      `json:"pid,omitempty"`
	Status    string   `json:"status,omitempty"`
	Endpoints []string `json:"endpoints,omitempty"`
}

type WireEvent struct {
	EventType          string              `json:"event_type"`
	SessionID          string              `json:"session_id"`
	StepID             string              `json:"step_id"`
	Timestamp          string              `json:"timestamp"`
	Command            string              `json:"command"`
	AffectedFiles      []string            `json:"affected_files"`
	DiffPatch          string              `json:"diff_patch"`
	SecurityAssessment SecurityAssessment  `json:"security_assessment"`
	Context            *ContextPayload     `json:"context,omitempty"`
	MCPTunnel          *MCPTunnelPayload   `json:"mcp_tunnel,omitempty"`
}
