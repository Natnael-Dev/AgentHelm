#!/usr/bin/env node
/**
 * AgentGuard Exeora MCP Tunnel Standalone Launcher
 * Usage: node start.js [--port 9000] [--host 127.0.0.1]
 */

const http = require('http');
const crypto = require('crypto');

const args = process.argv.slice(2);
let port = 9000;
let host = '127.0.0.1';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    port = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--host' && args[i + 1]) {
    host = args[i + 1];
    i++;
  }
}

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/mcp/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ACTIVE',
      tunnel: 'exeora-loopback',
      capabilities: ['tools', 'resources'],
      timestamp: new Date().toISOString()
    }));
    return;
  }

  if (req.method === 'POST' && req.url === '/mcp/rpc') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const json = JSON.parse(body);
        const response = {
          jsonrpc: '2.0',
          id: json.id,
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: { name: 'agentguard-exeora-tunnel', version: '1.0.0' }
          }
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON-RPC' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('AgentGuard MCP Tunnel');
});

server.listen(port, host, () => {
  console.log(`[MCP_TUNNEL_ACTIVE] Listening on http://${host}:${port} (PID: ${process.pid})`);
});
