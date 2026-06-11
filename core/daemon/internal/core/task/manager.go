package task

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

type Manager struct {
	RepoRoot  string
	BarDir    string
	TasksDir  string
	StatePath string
	mu        sync.Mutex
}

func NewManager(repoRoot string, barDir string) *Manager {
	return &Manager{
		RepoRoot:  repoRoot,
		BarDir:    barDir,
		TasksDir:  filepath.Join(barDir, "tasks"),
		StatePath: filepath.Join(barDir, "state.json"),
	}
}

func (m *Manager) Create(id string, name string, baseRef string, branch string, workspacePath string) (*Task, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	now := time.Now().UTC()
	task := &Task{
		ID:            id,
		Name:          name,
		RepoRoot:      m.RepoRoot,
		BaseRef:       baseRef,
		Branch:        branch,
		WorkspacePath: workspacePath,
		Status:        TaskStatusActive,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	taskDir := filepath.Join(m.TasksDir, id)
	if err := os.MkdirAll(filepath.Join(taskDir, "artifacts"), 0o755); err != nil {
		return nil, fmt.Errorf("failed to create task artifacts dir: %w", err)
	}

	state, err := m.loadStateLocked()
	if err != nil {
		state = &State{Tasks: make(map[string]*Task)}
	}
	state.Tasks[id] = task
	state.ActiveTaskID = id

	if err := m.saveStateLocked(state); err != nil {
		return nil, err
	}
	return task, nil
}

func (m *Manager) Get(id string) (*Task, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	state, err := m.loadStateLocked()
	if err != nil {
		return nil, err
	}
	t, ok := state.Tasks[id]
	if !ok {
		return nil, fmt.Errorf("task %s not found", id)
	}
	return t, nil
}

func (m *Manager) loadStateLocked() (*State, error) {
	if _, err := os.Stat(m.StatePath); os.IsNotExist(err) {
		return &State{Tasks: make(map[string]*Task)}, nil
	}
	data, err := os.ReadFile(m.StatePath)
	if err != nil {
		return nil, err
	}
	var state State
	if err := json.Unmarshal(data, &state); err != nil {
		return nil, err
	}
	return &state, nil
}

func (m *Manager) saveStateLocked(state *State) error {
	if err := os.MkdirAll(filepath.Dir(m.StatePath), 0o755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(state, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(m.StatePath, data, 0o644)
}
