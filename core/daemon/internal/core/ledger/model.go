package ledger

import "time"

type StepKind string

const (
	StepKindExec    StepKind = "exec"
	StepKindDiff    StepKind = "diff"
	StepKindApply   StepKind = "apply"
	StepKindPolicy  StepKind = "policy"
	StepKindSession StepKind = "session"
)

type DiffStat struct {
	FilesChanged int `json:"files_changed"`
	Additions    int `json:"additions"`
	Deletions    int `json:"deletions"`
}

type Step struct {
	StepID      string            `json:"step_id"`
	SessionID   string            `json:"session_id,omitempty"`
	Kind        StepKind          `json:"kind"`
	StartedAt   time.Time         `json:"started_at"`
	EndedAt     time.Time         `json:"ended_at"`
	DurationMs  int64             `json:"duration_ms,omitempty"`
	Cmd         []string          `json:"cmd,omitempty"`
	Cwd         string            `json:"cwd,omitempty"`
	Env         map[string]string `json:"env,omitempty"`
	ExitCode    *int              `json:"exit_code,omitempty"`
	DiffStat    *DiffStat         `json:"diff_stat,omitempty"`
	DiffPatch   string            `json:"diff_patch,omitempty"`
	Files       []string          `json:"affected_files,omitempty"`
	RiskLevel   string            `json:"risk_level,omitempty"`
	Violations  []string          `json:"policy_violations,omitempty"`
	Artifacts   []string          `json:"artifacts,omitempty"`
	Description string            `json:"description,omitempty"`
}
