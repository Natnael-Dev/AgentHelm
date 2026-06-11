package ledger

import (
	"bufio"
	"encoding/json"
	"os"
	"path/filepath"
)

type Reader struct {
	tasksDir string
}

func NewReader(tasksDir string) *Reader {
	return &Reader{tasksDir: tasksDir}
}

func (r *Reader) ReadSteps(taskID string) ([]Step, error) {
	ledgerPath := filepath.Join(r.tasksDir, taskID, "ledger.jsonl")
	f, err := os.Open(ledgerPath)
	if os.IsNotExist(err) {
		return []Step{}, nil
	}
	if err != nil {
		return nil, err
	}
	defer f.Close()

	var steps []Step
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := scanner.Bytes()
		if len(line) == 0 {
			continue
		}
		var step Step
		if err := json.Unmarshal(line, &step); err == nil {
			steps = append(steps, step)
		}
	}
	return steps, scanner.Err()
}
