module github.com/agenthelm/agenthelm-live/core/daemon

go 1.22.0

require (
	github.com/agenthelm/agenthelm-live/extensions/docs-scraper v0.0.0
)

replace github.com/agenthelm/agenthelm-live/extensions/docs-scraper => ../../extensions/docs-scraper
