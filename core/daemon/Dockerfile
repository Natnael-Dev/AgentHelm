# ─── BUILD STAGE ─────────────────────────────────────────────────────────────
FROM golang:1.22-alpine AS builder

WORKDIR /workspace

# Install build dependencies
RUN apk add --no-cache git build-base

# Copy root workspace configs and go.mod files
COPY go.work go.work.sum* ./
COPY core/daemon/go.mod core/daemon/go.sum* ./core/daemon/
COPY extensions/docs-scraper/go.mod extensions/docs-scraper/go.sum* ./extensions/docs-scraper/

# Download Go dependencies
RUN cd core/daemon && go mod download || true

# Copy source code
COPY core/daemon ./core/daemon
COPY extensions/docs-scraper ./extensions/docs-scraper

# Build static binary
WORKDIR /workspace/core/daemon
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/agentguard-bar ./cmd/agentguard-bar

# ─── RUNTIME STAGE ───────────────────────────────────────────────────────────
FROM alpine:3.19

RUN apk add --no-cache git bash ca-certificates curl

WORKDIR /app

# Copy binary from builder
COPY --from=builder /bin/agentguard-bar /usr/local/bin/agentguard-bar

# Shared volume mount point for UDS socket and worktrees
VOLUME ["/tmp", "/workspace"]

ENTRYPOINT ["/usr/local/bin/agentguard-bar"]
CMD ["--help"]
