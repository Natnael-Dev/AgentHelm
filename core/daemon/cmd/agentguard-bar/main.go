package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/agentguard/agentguard-live/core/daemon/internal/core/diff"
	"github.com/agentguard/agentguard-live/core/daemon/internal/core/exec"
	"github.com/agentguard/agentguard-live/core/daemon/internal/core/ledger"
	"github.com/agentguard/agentguard-live/core/daemon/internal/core/policy"
	"github.com/agentguard/agentguard-live/core/daemon/internal/ipc"
	"github.com/agentguard/agentguard-live/core/daemon/internal/util/log"
)

func main() {
	taskID := flag.String("task", "task_default", "Task identifier")
	sessionID := flag.String("session", "sess_default", "Session identifier")
	socketPath := flag.String("sock", ipc.DefaultSocketPath, "Unix domain socket path")
	flag.Parse()

	args := flag.Args()
	if len(args) == 0 {
		fmt.Println("AgentGuard Blade Agent Runtime (BAR) Daemon")
		fmt.Println("Usage: agentguard-bar [options] -- <command> [args...]")
		os.Exit(0)
	}

	commandStr := strings.Join(args, " ")
	log.Info("Intercepting agent command: %s", commandStr)

	// 1. Policy Evaluation
	policyEngine, err := policy.NewEngine(policy.DefaultPolicy())
	if err != nil {
		log.Error("Failed to initialize policy engine: %v", err)
		os.Exit(1)
	}

	eval := policyEngine.Evaluate(commandStr)
	emitter := ipc.NewUDSEmitter(*socketPath)

	stepID := fmt.Sprintf("step_%d", time.Now().UnixNano()/1000000)
	step := &ledger.Step{
		StepID:     stepID,
		SessionID:  *sessionID,
		Kind:       ledger.StepKindExec,
		StartedAt:  time.Now().UTC(),
		Cmd:        args,
		RiskLevel:  eval.RiskLevel,
		Violations: eval.Violations,
	}

	// 2. Broadcast AGENT_STEP_PROPOSED
	_ = emitter.Emit("AGENT_STEP_PROPOSED", step)

	if !eval.Allowed {
		log.Warn("BLOCKED by security policy! Violations: %s", strings.Join(eval.Violations, "; "))
		step.EndedAt = time.Now().UTC()
		step.DurationMs = 0
		exitCode := 126
		step.ExitCode = &exitCode
		_ = emitter.Emit("AGENT_STEP_BLOCKED", step)
		os.Exit(126)
	}

	// 3. Execution
	runner := exec.NewRunner()
	cwd, _ := os.Getwd()
	ctx := context.Background()

	result, err := runner.Run(ctx, cwd, nil, args)
	step.EndedAt = time.Now().UTC()
	if result != nil {
		step.DurationMs = result.DurationMs
		step.ExitCode = &result.ExitCode
	}

	// 4. Diff inspection (dummy mock for wrapper demonstration)
	diffEngine := diff.NewEngine()
	diffStat, affectedFiles := diffEngine.ParsePatch(step.DiffPatch)
	step.DiffStat = diffStat
	step.Files = affectedFiles

	// 5. Broadcast AGENT_STEP_COMPLETED
	_ = emitter.Emit("AGENT_STEP_COMPLETED", step)

	if result != nil {
		fmt.Print(result.Stdout)
		fmt.Fprint(os.Stderr, result.Stderr)
		os.Exit(result.ExitCode)
	}
}
