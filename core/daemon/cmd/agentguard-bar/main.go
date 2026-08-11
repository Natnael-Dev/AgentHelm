package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/agentguard/agentguard-live/core/daemon/internal/core/diff"
	"github.com/agentguard/agentguard-live/core/daemon/internal/core/exec"
	"github.com/agentguard/agentguard-live/core/daemon/internal/core/ledger"
	"github.com/agentguard/agentguard-live/core/daemon/internal/core/policy"
	"github.com/agentguard/agentguard-live/core/daemon/internal/ipc"
	"github.com/agentguard/agentguard-live/core/daemon/internal/util/log"
	scraper "github.com/agentguard/agentguard-live/extensions/docs-scraper"
)

func main() {
	taskID := flag.String("task", "task_default", "Task identifier")
	sessionID := flag.String("session", "sess_default", "Session identifier")
	socketPath := flag.String("sock", ipc.DefaultSocketPath, "Unix domain socket path")
	tunnelPort := flag.Int("port", 9000, "Port for MCP loopback tunnel")
	flag.Parse()

	args := flag.Args()
	if len(args) == 0 {
		printUsage()
		os.Exit(0)
	}

	emitter := ipc.NewUDSEmitter(*socketPath)
	subCommand := args[0]

	// ─── EXTENSION COMMAND 1: fetch-docs <url> (Ketch Scraper) ───────────────────
	if subCommand == "fetch-docs" {
		if len(args) < 2 {
			fmt.Fprintln(os.Stderr, "Error: fetch-docs requires a URL argument. Usage: agentguard-bar fetch-docs <url>")
			os.Exit(1)
		}
		targetURL := args[1]
		log.Info("AgentGuard Ketch: Fetching documentation from %s", targetURL)

		stepID := fmt.Sprintf("step_fetch_%d", time.Now().UnixNano()/1000000)
		result, err := scraper.FetchDocs(targetURL)
		if err != nil {
			log.Error("Failed to fetch documentation from %s: %v", targetURL, err)
			os.Exit(1)
		}

		// Emit CONTEXT_FETCHED wire event to UI & telemetry engine
		_ = emitter.EmitContextFetched(*sessionID, stepID, result.URL, result.Title, result.Markdown)
		log.Info("Context fetched successfully: '%s' (%d bytes). Emitted CONTEXT_FETCHED.", result.Title, result.ByteCount)

		fmt.Printf("# %s\n\n", result.Title)
		fmt.Printf("<!-- URL: %s | Bytes: %d | Time: %s -->\n\n", result.URL, result.ByteCount, result.FetchedAt)
		fmt.Println(result.Markdown)
		return
	}

	// ─── EXTENSION COMMAND 2: start-tunnel (Exeora Node.js MCP Tunnel) ───────────
	if subCommand == "start-tunnel" {
		port := *tunnelPort
		if len(args) >= 2 {
			if p, err := strconv.Atoi(args[1]); err == nil {
				port = p
			}
		}

		log.Info("AgentGuard Exeora: Spawning Node.js MCP loopback tunnel on port %d...", port)
		stepID := fmt.Sprintf("step_tunnel_%d", time.Now().UnixNano()/1000000)

		// Locate tunnel script relative to daemon execution directory
		tunnelScript := findTunnelScript()
		log.Info("Resolved MCP tunnel script path: %s", tunnelScript)

		cmd := osexec.Command("node", tunnelScript, "--port", strconv.Itoa(port), "--host", "127.0.0.1")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		if err := cmd.Start(); err != nil {
			log.Error("Failed to spawn Node.js MCP tunnel child process: %v", err)
			os.Exit(1)
		}

		pid := cmd.Process.Pid
		log.Info("Node.js MCP tunnel child process running (PID: %d)", pid)

		// Broadcast MCP_TUNNEL_ACTIVE wire event to Cockpit UI
		_ = emitter.EmitMCPTunnelActive(*sessionID, stepID, "127.0.0.1", port, pid)
		log.Info("Emitted MCP_TUNNEL_ACTIVE event (ws://127.0.0.1:%d)", port)

		// Trap SIGINT / SIGTERM for graceful child process termination
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

		go func() {
			<-sigChan
			log.Info("Shutting down MCP tunnel child process (PID: %d)...", pid)
			_ = cmd.Process.Kill()
			os.Exit(0)
		}()

		if err := cmd.Wait(); err != nil {
			log.Warn("MCP tunnel process exited: %v", err)
		}
		return
	}

	// ─── DEFAULT BAR EXECUTION INTERCEPTION ──────────────────────────────────────
	commandStr := strings.Join(args, " ")
	log.Info("Intercepting agent command: %s (Task: %s, Session: %s)", commandStr, *taskID, *sessionID)

	// 1. Policy Evaluation
	policyEngine, err := policy.NewEngine(policy.DefaultPolicy())
	if err != nil {
		log.Error("Failed to initialize policy engine: %v", err)
		os.Exit(1)
	}

	eval := policyEngine.Evaluate(commandStr)
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
	_ = emitter.Emit(ipc.EventAgentStepProposed, step)

	if !eval.Allowed {
		log.Warn("BLOCKED by security policy! Violations: %s", strings.Join(eval.Violations, "; "))
		step.EndedAt = time.Now().UTC()
		step.DurationMs = 0
		exitCode := 126
		step.ExitCode = &exitCode
		_ = emitter.Emit(ipc.EventAgentStepBlocked, step)
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

	// 4. Diff inspection
	diffEngine := diff.NewEngine()
	diffStat, affectedFiles := diffEngine.ParsePatch(step.DiffPatch)
	step.DiffStat = diffStat
	step.Files = affectedFiles

	// 5. Broadcast AGENT_STEP_COMPLETED
	_ = emitter.Emit(ipc.EventAgentStepCompleted, step)

	if result != nil {
		fmt.Print(result.Stdout)
		fmt.Fprint(os.Stderr, result.Stderr)
		os.Exit(result.ExitCode)
	}
}

// findTunnelScript searches common relative locations for the MCP tunnel launcher
func findTunnelScript() string {
	candidates := []string{
		"extensions/mcp-tunnel/start.js",
		"../extensions/mcp-tunnel/start.js",
		"../../extensions/mcp-tunnel/start.js",
		"extensions/mcp-tunnel/dist/index.js",
	}

	for _, c := range candidates {
		if abs, err := filepath.Abs(c); err == nil {
			if _, statErr := os.Stat(abs); statErr == nil {
				return abs
			}
		}
	}
	return "extensions/mcp-tunnel/start.js"
}

func printUsage() {
	fmt.Println("AgentGuard Blade Agent Runtime (BAR) Daemon — v2.4.1")
	fmt.Println("Usage:")
	fmt.Println("  agentguard-bar [options] -- <command> [args...]      Intercept and sandbox command")
	fmt.Println("  agentguard-bar fetch-docs <url>                      Scrape documentation with Ketch")
	fmt.Println("  agentguard-bar start-tunnel [--port 9000]            Spawn Exeora MCP tunnel child process")
	fmt.Println("\nOptions:")
	fmt.Println("  -session <id>   Session identifier (default: sess_default)")
	fmt.Println("  -task <id>      Task identifier (default: task_default)")
	fmt.Println("  -sock <path>    Unix domain socket path (default: /tmp/agentguard.sock)")
	fmt.Println("  -port <num>     MCP Tunnel port (default: 9000)")
}
