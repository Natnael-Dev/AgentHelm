package policy

import "testing"

func TestPolicyEngineBlocking(t *testing.T) {
	engine, err := NewEngine(DefaultPolicy())
	if err != nil {
		t.Fatalf("Failed to initialize engine: %v", err)
	}

	dangerousCommands := []string{
		"rm -rf /",
		"rm -fr /",
		"rm -rf ~/",
		"mkfs.ext4 /dev/sda",
		":(){ :|:& };:",
		"dd if=/dev/zero of=/dev/sda bs=1M",
	}

	for _, cmd := range dangerousCommands {
		eval := engine.Evaluate(cmd)
		if eval.Allowed {
			t.Errorf("Expected dangerous command %q to be blocked, but was allowed", cmd)
		}
		if eval.RiskLevel != "CRITICAL" {
			t.Errorf("Expected risk level CRITICAL for %q, got %s", cmd, eval.RiskLevel)
		}
	}
}

func TestPolicyEngineSafeCommands(t *testing.T) {
	engine, err := NewEngine(DefaultPolicy())
	if err != nil {
		t.Fatalf("Failed to initialize engine: %v", err)
	}

	safeCommands := []string{
		"npm test",
		"cargo build --release",
		"git status",
		"rm -rf node_modules",
		"rm -f ./temp.txt",
		"pytest tests/",
	}

	for _, cmd := range safeCommands {
		eval := engine.Evaluate(cmd)
		if !eval.Allowed {
			t.Errorf("Expected safe command %q to be allowed, but was blocked (violations: %v)", cmd, eval.Violations)
		}
		if eval.RiskLevel != "LOW" {
			t.Errorf("Expected risk level LOW for %q, got %s", cmd, eval.RiskLevel)
		}
	}
}
