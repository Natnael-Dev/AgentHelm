package workspace

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	gitadapter "github.com/agentguard/agentguard-live/core/daemon/internal/adapters/git"
)

type Manager struct {
	RepoRoot      string
	WorkspacesDir string
	Git           *gitadapter.Runner
}

func NewManager(repoRoot string, workspacesDir string, git *gitadapter.Runner) *Manager {
	return &Manager{
		RepoRoot:      repoRoot,
		WorkspacesDir: workspacesDir,
		Git:           git,
	}
}

func (m *Manager) Create(ctx context.Context, taskID string, branch string, baseRef string) (string, error) {
	if err := os.MkdirAll(m.WorkspacesDir, 0o755); err != nil {
		return "", fmt.Errorf("failed to create workspaces dir: %w", err)
	}

	targetPath := filepath.Join(m.WorkspacesDir, taskID)
	if _, err := os.Stat(targetPath); err == nil {
		return targetPath, nil
	}

	if baseRef == "" {
		baseRef = "HEAD"
	}

	if err := m.Git.WorktreeAdd(ctx, targetPath, branch, baseRef); err != nil {
		return "", fmt.Errorf("failed to create worktree: %w", err)
	}

	return targetPath, nil
}

func (m *Manager) Cleanup(ctx context.Context, taskID string) error {
	targetPath := filepath.Join(m.WorkspacesDir, taskID)
	if _, err := os.Stat(targetPath); os.IsNotExist(err) {
		return nil
	}
	return m.Git.WorktreeRemove(ctx, targetPath)
}
