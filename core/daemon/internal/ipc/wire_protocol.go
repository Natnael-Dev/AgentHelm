package ipc

type SecurityAssessment struct {
	RiskLevel        string   `json:"risk_level"`
	PolicyViolations []string `json:"policy_violations"`
}

type WireEvent struct {
	EventType          string             `json:"event_type"`
	SessionID          string             `json:"session_id"`
	StepID             string             `json:"step_id"`
	Timestamp          string             `json:"timestamp"`
	Command            string             `json:"command"`
	AffectedFiles      []string           `json:"affected_files"`
	DiffPatch          string             `json:"diff_patch"`
	SecurityAssessment SecurityAssessment `json:"security_assessment"`
}
