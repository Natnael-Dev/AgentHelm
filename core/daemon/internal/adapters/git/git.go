package git

import (
	"bytes"
	"context"
	"fmt"
	"os/exec"
	"strings"
)

type Runner struct {
	RepoRoot string
}

func NewRunner(repoRoot string) *Runner {
	return &Runner{RepoRoot: repoRoot}
}

func (r *Runner) Exec(ctx context.Context, args ...string) (string, error) {
	cmd := exec.CommandContext(ctx, "git", args...)
	cmd.Dir = r.RepoRoot

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("git %s failed: %w (stderr: %s)", strings.Join(args, " "), err, stderr.String())
	}
	return strings.TrimSpace(stdout.String()), nil
}

func (r *Runner) WorktreeAdd(ctx context.Context, path string, branch string, baseRef string) error {
	_, err := r.Exec(ctx, "worktree", "add", "-b", branch, path, baseRef)
	return err
}

func (r *Runner) WorktreeRemove(ctx context.Context, path string) error {
	_, err := r.Exec(ctx, "worktree", "remove", "--force", path)
	return err
}

func (r *Runner) Diff(ctx context.Context, path string) (string, error) {
	cmd := exec.CommandContext(ctx, "git", "diff", "HEAD")
	cmd.Dir = path
	out, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return string(out), nil
}
