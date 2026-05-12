# ─── BUILD STAGE ─────────────────────────────────────────────────────────────
FROM rust:1.77-alpine AS builder

WORKDIR /usr/src/agentguard-telemetry

RUN apk add --no-cache musl-dev

# Copy Cargo manifests
COPY Cargo.toml Cargo.lock* ./
COPY telemetry/Cargo.toml ./telemetry/

# Cache dependency layer with dummy source
RUN mkdir -p telemetry/src && echo "fn main() {}" > telemetry/src/main.rs
RUN cargo build --release --package agentguard-telemetry || true

# Copy real source code
COPY telemetry/src ./telemetry/src
RUN touch telemetry/src/main.rs

# Build optimized release binary
RUN cargo build --release --package agentguard-telemetry

# ─── RUNTIME STAGE ───────────────────────────────────────────────────────────
FROM alpine:3.19

RUN apk add --no-cache ca-certificates

WORKDIR /app

# Copy binary from builder
COPY --from=builder /usr/src/agentguard-telemetry/target/release/agentguard-telemetry /usr/local/bin/agentguard-telemetry

EXPOSE 8765

# Shared volume for UDS socket listening
VOLUME ["/tmp"]

ENTRYPOINT ["/usr/local/bin/agentguard-telemetry"]
