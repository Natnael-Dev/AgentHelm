// Package scraper provides headless documentation fetching and HTML-to-Markdown conversion.
// Ported from 1broseidon/ketch — a fast, zero-browser doc scraper for AI agent context injection.
package scraper

import (
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"

	"golang.org/x/net/html"
)

// DefaultUserAgent identifies the scraper in HTTP requests
const DefaultUserAgent = "AgentGuard-Ketch/1.0 (docs-scraper)"

// DefaultTimeout is the maximum duration for a single fetch operation
const DefaultTimeout = 15 * time.Second

// FetchResult holds the scraped output
type FetchResult struct {
	URL       string `json:"url"`
	Title     string `json:"title"`
	Markdown  string `json:"markdown"`
	ByteCount int    `json:"byte_count"`
	FetchedAt string `json:"fetched_at"`
}

// FetchDocs fetches a URL and converts its HTML body content to clean Markdown.
// This is the primary public API — importable by the daemon for CONTEXT_FETCHED events.
func FetchDocs(url string) (*FetchResult, error) {
	if url == "" {
		return nil, fmt.Errorf("empty URL provided")
	}

	if !strings.HasPrefix(url, "http://") && !strings.HasPrefix(url, "https://") {
		url = "https://" + url
	}

	client := &http.Client{
		Timeout: DefaultTimeout,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 5 {
				return fmt.Errorf("too many redirects (max 5)")
			}
			return nil
		},
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request for %s: %w", url, err)
	}
	req.Header.Set("User-Agent", DefaultUserAgent)
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	req.Header.Set("Accept-Language", "en-US,en;q=0.5")

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch %s: %w", url, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 400 {
		return nil, fmt.Errorf("HTTP %d from %s", resp.StatusCode, url)
	}

	// Read body with a 2MB cap to prevent memory abuse
	limitedReader := io.LimitReader(resp.Body, 2*1024*1024)
	bodyBytes, err := io.ReadAll(limitedReader)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body from %s: %w", url, err)
	}

	rawHTML := string(bodyBytes)
	title := extractTitle(rawHTML)
	markdown := htmlToMarkdown(rawHTML)

	return &FetchResult{
		URL:       url,
		Title:     title,
		Markdown:  markdown,
		ByteCount: len(markdown),
		FetchedAt: time.Now().UTC().Format(time.RFC3339),
	}, nil
}

// extractTitle pulls the <title> content from raw HTML
func extractTitle(rawHTML string) string {
	doc, err := html.Parse(strings.NewReader(rawHTML))
	if err != nil {
		return ""
	}

	var title string
	var walk func(*html.Node)
	walk = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "title" {
			if n.FirstChild != nil {
				title = strings.TrimSpace(n.FirstChild.Data)
			}
			return
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			walk(c)
		}
	}
	walk(doc)
	return title
}

// htmlToMarkdown performs a lightweight conversion of HTML to readable Markdown.
// Strips scripts, styles, nav, footer, ads. Preserves headings, paragraphs, lists, code blocks, links.
func htmlToMarkdown(rawHTML string) string {
	// Strip script, style, nav, footer, aside tags entirely
	stripTags := []string{"script", "style", "nav", "footer", "aside", "noscript", "svg", "iframe"}
	cleaned := rawHTML
	for _, tag := range stripTags {
		re := regexp.MustCompile(`(?si)<` + tag + `[\s>].*?</` + tag + `>`)
		cleaned = re.ReplaceAllString(cleaned, "")
	}

	doc, err := html.Parse(strings.NewReader(cleaned))
	if err != nil {
		return sanitizeText(cleaned)
	}

	var buf strings.Builder
	renderNode(&buf, doc, 0)

	result := buf.String()

	// Collapse excessive whitespace
	multiNewline := regexp.MustCompile(`\n{4,}`)
	result = multiNewline.ReplaceAllString(result, "\n\n\n")
	result = strings.TrimSpace(result)

	return result
}

// renderNode recursively walks the DOM tree and writes Markdown output
func renderNode(buf *strings.Builder, n *html.Node, depth int) {
	switch n.Type {
	case html.TextNode:
		text := strings.TrimSpace(n.Data)
		if text != "" {
			buf.WriteString(text)
			buf.WriteString(" ")
		}
		return

	case html.ElementNode:
		tag := strings.ToLower(n.Data)

		switch tag {
		case "h1":
			buf.WriteString("\n\n# ")
			renderChildren(buf, n, depth+1)
			buf.WriteString("\n\n")
			return
		case "h2":
			buf.WriteString("\n\n## ")
			renderChildren(buf, n, depth+1)
			buf.WriteString("\n\n")
			return
		case "h3":
			buf.WriteString("\n\n### ")
			renderChildren(buf, n, depth+1)
			buf.WriteString("\n\n")
			return
		case "h4":
			buf.WriteString("\n\n#### ")
			renderChildren(buf, n, depth+1)
			buf.WriteString("\n\n")
			return
		case "h5", "h6":
			buf.WriteString("\n\n##### ")
			renderChildren(buf, n, depth+1)
			buf.WriteString("\n\n")
			return
		case "p", "div", "section", "article", "main":
			buf.WriteString("\n\n")
			renderChildren(buf, n, depth+1)
			buf.WriteString("\n")
			return
		case "br":
			buf.WriteString("\n")
			return
		case "hr":
			buf.WriteString("\n\n---\n\n")
			return
		case "strong", "b":
			buf.WriteString("**")
			renderChildren(buf, n, depth+1)
			buf.WriteString("**")
			return
		case "em", "i":
			buf.WriteString("*")
			renderChildren(buf, n, depth+1)
			buf.WriteString("*")
			return
		case "code":
			buf.WriteString("`")
			renderChildren(buf, n, depth+1)
			buf.WriteString("`")
			return
		case "pre":
			buf.WriteString("\n\n```\n")
			renderChildren(buf, n, depth+1)
			buf.WriteString("\n```\n\n")
			return
		case "a":
			href := getAttr(n, "href")
			buf.WriteString("[")
			renderChildren(buf, n, depth+1)
			buf.WriteString("](")
			buf.WriteString(href)
			buf.WriteString(")")
			return
		case "img":
			alt := getAttr(n, "alt")
			src := getAttr(n, "src")
			buf.WriteString("![")
			buf.WriteString(alt)
			buf.WriteString("](")
			buf.WriteString(src)
			buf.WriteString(")")
			return
		case "ul":
			buf.WriteString("\n")
			renderListItems(buf, n, "- ", depth+1)
			buf.WriteString("\n")
			return
		case "ol":
			buf.WriteString("\n")
			renderOrderedListItems(buf, n, depth+1)
			buf.WriteString("\n")
			return
		case "li":
			// Handled by renderListItems
			renderChildren(buf, n, depth+1)
			return
		case "blockquote":
			buf.WriteString("\n\n> ")
			renderChildren(buf, n, depth+1)
			buf.WriteString("\n\n")
			return
		case "table":
			buf.WriteString("\n\n")
			renderChildren(buf, n, depth+1)
			buf.WriteString("\n\n")
			return
		case "tr":
			buf.WriteString("| ")
			renderChildren(buf, n, depth+1)
			buf.WriteString("\n")
			return
		case "th", "td":
			renderChildren(buf, n, depth+1)
			buf.WriteString(" | ")
			return
		}
	}

	// Default: recurse into children
	renderChildren(buf, n, depth)
}

func renderChildren(buf *strings.Builder, n *html.Node, depth int) {
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		renderNode(buf, c, depth)
	}
}

func renderListItems(buf *strings.Builder, n *html.Node, prefix string, depth int) {
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if c.Type == html.ElementNode && c.Data == "li" {
			indent := strings.Repeat("  ", depth-1)
			buf.WriteString(indent)
			buf.WriteString(prefix)
			renderChildren(buf, c, depth+1)
			buf.WriteString("\n")
		}
	}
}

func renderOrderedListItems(buf *strings.Builder, n *html.Node, depth int) {
	idx := 1
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if c.Type == html.ElementNode && c.Data == "li" {
			indent := strings.Repeat("  ", depth-1)
			buf.WriteString(fmt.Sprintf("%s%d. ", indent, idx))
			renderChildren(buf, c, depth+1)
			buf.WriteString("\n")
			idx++
		}
	}
}

func getAttr(n *html.Node, key string) string {
	for _, a := range n.Attr {
		if a.Key == key {
			return a.Val
		}
	}
	return ""
}

func sanitizeText(s string) string {
	re := regexp.MustCompile(`<[^>]*>`)
	return strings.TrimSpace(re.ReplaceAllString(s, ""))
}
