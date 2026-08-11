module github.com/agentguard/agentguard-live/core/daemon

go 1.22.0

require (
	github.com/agentguard/agentguard-live/extensions/docs-scraper v0.0.0
)

replace github.com/agentguard/agentguard-live/extensions/docs-scraper => ../../extensions/docs-scraper
