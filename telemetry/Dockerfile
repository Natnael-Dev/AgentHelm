# ─── BUILD STAGE ─────────────────────────────────────────────────────────────
FROM rust:1.77-alpine AS builder

WORKDIR /usr/src/agenthelm-telemetry

RUN apk add --no-cache musl-dev

# Copy Cargo manifests
COPY Cargo.toml Cargo.lock* ./
COPY telemetry/Cargo.toml ./telemetry/

# Cache dependency layer with dummy source
RUN mkdir -p telemetry/src && echo "fn main() {}" > telemetry/src/main.rs
RUN cargo build --release --package agenthelm-telemetry || true

# Copy real source code
COPY telemetry/src ./telemetry/src
RUN touch telemetry/src/main.rs

# Build optimized release binary
RUN cargo build --release --package agenthelm-telemetry

# ─── RUNTIME STAGE ───────────────────────────────────────────────────────────
FROM alpine:3.19

RUN apk add --no-cache ca-certificates

WORKDIR /app

# Copy binary from builder
COPY --from=builder /usr/src/agenthelm-telemetry/target/release/agenthelm-telemetry /usr/local/bin/agenthelm-telemetry

EXPOSE 8765

# Shared volume for UDS socket listening
VOLUME ["/tmp"]

ENTRYPOINT ["/usr/local/bin/agenthelm-telemetry"]
