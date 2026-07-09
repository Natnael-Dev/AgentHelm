package task

import "time"

type TaskStatus string

const (
	TaskStatusActive    TaskStatus = "active"
	TaskStatusPaused    TaskStatus = "paused"
	TaskStatusCompleted TaskStatus = "completed"
	TaskStatusFailed    TaskStatus = "failed"
)

type Task struct {
	ID            string     `json:"id"`
	Name          string     `json:"name"`
	RepoRoot      string     `json:"repo_root"`
	BaseRef       string     `json:"base_ref"`
	Branch        string     `json:"branch"`
	WorkspacePath string     `json:"workspace_path"`
	Status        TaskStatus `json:"status"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}
