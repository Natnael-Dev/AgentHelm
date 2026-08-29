package workspace

import (
	"os"
	"path/filepath"
	"testing"

	gitadapter "github.com/agenthelm/agenthelm-live/core/daemon/internal/adapters/git"
)

func TestWorkspaceManagerCreation(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "agenthelm_test_*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	gitRunner := gitadapter.NewRunner(tempDir)
	workspacesDir := filepath.Join(tempDir, "workspaces")
	mgr := NewManager(tempDir, workspacesDir, gitRunner)

	if mgr.RepoRoot != tempDir {
		t.Errorf("Expected RepoRoot %s, got %s", tempDir, mgr.RepoRoot)
	}
	if mgr.WorkspacesDir != workspacesDir {
		t.Errorf("Expected WorkspacesDir %s, got %s", workspacesDir, mgr.WorkspacesDir)
	}
}
