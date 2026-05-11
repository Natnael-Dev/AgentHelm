package scraper

import (
	"strings"
	"testing"
)

func TestExtractTitle(t *testing.T) {
	html := `<html><head><title>Go Documentation</title></head><body><h1>Hello</h1></body></html>`
	title := extractTitle(html)
	if title != "Go Documentation" {
		t.Errorf("expected 'Go Documentation', got '%s'", title)
	}
}

func TestExtractTitleEmpty(t *testing.T) {
	html := `<html><head></head><body></body></html>`
	title := extractTitle(html)
	if title != "" {
		t.Errorf("expected empty title, got '%s'", title)
	}
}

func TestHtmlToMarkdownHeadings(t *testing.T) {
	html := `<html><body><h1>Main Title</h1><h2>Subtitle</h2><p>Hello world.</p></body></html>`
	md := htmlToMarkdown(html)

	if !strings.Contains(md, "# Main Title") {
		t.Errorf("expected h1 heading in markdown, got: %s", md)
	}
	if !strings.Contains(md, "## Subtitle") {
		t.Errorf("expected h2 heading in markdown, got: %s", md)
	}
	if !strings.Contains(md, "Hello world.") {
		t.Errorf("expected paragraph text in markdown, got: %s", md)
	}
}

func TestHtmlToMarkdownStripsScripts(t *testing.T) {
	html := `<html><body><script>alert('xss')</script><p>Safe content</p></body></html>`
	md := htmlToMarkdown(html)

	if strings.Contains(md, "alert") {
		t.Errorf("script content should be stripped, got: %s", md)
	}
	if !strings.Contains(md, "Safe content") {
		t.Errorf("expected paragraph text, got: %s", md)
	}
}

func TestHtmlToMarkdownCodeBlock(t *testing.T) {
	html := `<html><body><pre><code>func main() { fmt.Println("hello") }</code></pre></body></html>`
	md := htmlToMarkdown(html)

	if !strings.Contains(md, "```") {
		t.Errorf("expected code fence in markdown, got: %s", md)
	}
	if !strings.Contains(md, "func main()") {
		t.Errorf("expected code content in markdown, got: %s", md)
	}
}

func TestHtmlToMarkdownLinks(t *testing.T) {
	html := `<html><body><p>Visit <a href="https://go.dev">Go Website</a></p></body></html>`
	md := htmlToMarkdown(html)

	if !strings.Contains(md, "[Go Website](https://go.dev)") {
		t.Errorf("expected markdown link, got: %s", md)
	}
}

func TestHtmlToMarkdownLists(t *testing.T) {
	html := `<html><body><ul><li>Item A</li><li>Item B</li></ul></body></html>`
	md := htmlToMarkdown(html)

	if !strings.Contains(md, "- Item A") {
		t.Errorf("expected list item A, got: %s", md)
	}
	if !strings.Contains(md, "- Item B") {
		t.Errorf("expected list item B, got: %s", md)
	}
}

func TestHtmlToMarkdownBoldItalic(t *testing.T) {
	html := `<html><body><p>This is <strong>bold</strong> and <em>italic</em></p></body></html>`
	md := htmlToMarkdown(html)

	if !strings.Contains(md, "**bold**") {
		t.Errorf("expected bold markdown, got: %s", md)
	}
	if !strings.Contains(md, "*italic*") {
		t.Errorf("expected italic markdown, got: %s", md)
	}
}

func TestSanitizeText(t *testing.T) {
	input := `<p>Hello <b>World</b></p>`
	output := sanitizeText(input)
	if output != "Hello World" {
		t.Errorf("expected 'Hello World', got '%s'", output)
	}
}

func TestFetchDocsEmptyURL(t *testing.T) {
	_, err := FetchDocs("")
	if err == nil {
		t.Error("expected error for empty URL")
	}
}
