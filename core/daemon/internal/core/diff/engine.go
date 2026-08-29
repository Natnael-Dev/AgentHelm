package diff

import (
	"bufio"
	"strings"

	"github.com/agenthelm/agenthelm-live/core/daemon/internal/core/ledger"
)

type Engine struct{}

func NewEngine() *Engine {
	return &Engine{}
}

func (e *Engine) ParsePatch(patch string) (*ledger.DiffStat, []string) {
	filesMap := make(map[string]bool)
	additions := 0
	deletions := 0

	scanner := bufio.NewScanner(strings.NewReader(patch))
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "diff --git ") {
			parts := strings.Fields(line)
			if len(parts) >= 4 {
				targetFile := strings.TrimPrefix(parts[3], "b/")
				filesMap[targetFile] = true
			}
		} else if strings.HasPrefix(line, "+") && !strings.HasPrefix(line, "+++") {
			additions++
		} else if strings.HasPrefix(line, "-") && !strings.HasPrefix(line, "---") {
			deletions++
		}
	}

	files := make([]string, 0, len(filesMap))
	for f := range filesMap {
		files = append(files, f)
	}

	stat := &ledger.DiffStat{
		FilesChanged: len(files),
		Additions:    additions,
		Deletions:    deletions,
	}

	return stat, files
}
