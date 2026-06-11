package ledger

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

type Manager struct {
	tasksDir string
	mu       sync.Mutex
}

func NewManager(tasksDir string) *Manager {
	return &Manager{tasksDir: tasksDir}
}

func (m *Manager) AppendStep(taskID string, step *Step) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	taskDir := filepath.Join(m.tasksDir, taskID)
	if err := os.MkdirAll(taskDir, 0o755); err != nil {
		return fmt.Errorf("failed to create task dir: %w", err)
	}

	ledgerPath := filepath.Join(taskDir, "ledger.jsonl")
	f, err := os.OpenFile(ledgerPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o644)
	if err != nil {
		return fmt.Errorf("failed to open ledger file: %w", err)
	}
	defer f.Close()

	data, err := json.Marshal(step)
	if err != nil {
		return fmt.Errorf("failed to marshal step: %w", err)
	}

	if _, err := f.Write(append(data, '\n')); err != nil {
		return fmt.Errorf("failed to write step to ledger: %w", err)
	}
	return nil
}
