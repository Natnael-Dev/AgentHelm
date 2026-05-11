// Ketch CLI — Standalone documentation scraper for AgentGuard
// Usage: ketch <url>
// Fetches the URL and outputs clean Markdown to stdout.
package main

import (
	"encoding/json"
	"fmt"
	"os"

	scraper "github.com/agentguard/agentguard-live/extensions/docs-scraper"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "Ketch Docs Scraper — AgentGuard Extension")
		fmt.Fprintln(os.Stderr, "Usage: ketch <url>")
		fmt.Fprintln(os.Stderr, "       ketch --json <url>")
		os.Exit(1)
	}

	jsonMode := false
	url := os.Args[1]

	if url == "--json" {
		if len(os.Args) < 3 {
			fmt.Fprintln(os.Stderr, "Error: --json flag requires a URL argument")
			os.Exit(1)
		}
		jsonMode = true
		url = os.Args[2]
	}

	result, err := scraper.FetchDocs(url)
	if err != nil {
		fmt.Fprintf(os.Stderr, "FETCH_ERROR: %v\n", err)
		os.Exit(1)
	}

	if jsonMode {
		enc := json.NewEncoder(os.Stdout)
		enc.SetIndent("", "  ")
		_ = enc.Encode(result)
	} else {
		fmt.Printf("# %s\n\n", result.Title)
		fmt.Printf("<!-- Fetched from: %s -->\n", result.URL)
		fmt.Printf("<!-- Fetched at: %s | %d bytes -->\n\n", result.FetchedAt, result.ByteCount)
		fmt.Println(result.Markdown)
	}
}
