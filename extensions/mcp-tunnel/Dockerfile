# ─── RUNTIME STAGE ───────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install build dependencies if needed
RUN apk add --no-cache python3 make g++

# Copy package manifests
COPY extensions/mcp-tunnel/package*.json ./

# Install production and build dependencies
RUN npm ci || npm install

# Copy source code and config
COPY extensions/mcp-tunnel/tsconfig.json ./
COPY extensions/mcp-tunnel/src ./src
COPY extensions/mcp-tunnel/start.js ./

# Compile TypeScript
RUN npm run build || true

EXPOSE 9000

ENV PORT=9000
ENV HOST=0.0.0.0

CMD ["node", "start.js", "--port", "9000", "--host", "0.0.0.0"]
