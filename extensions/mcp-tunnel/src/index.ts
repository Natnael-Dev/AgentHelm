import { EncryptedTunnel } from './tunnel';
import { McpSandboxServer } from './server';
import { TunnelConfig } from './types';

function parseArgs(): TunnelConfig {
  const args = process.argv.slice(2);
  let port = 9000;
  let host = '127.0.0.1';
  let authToken = process.env.AGENTHELM_MCP_SECRET || 'agenthelm_default_secret_key';
  let sandboxWorktreeDir = process.cwd();

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && args[i + 1]) {
      port = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--host' && args[i + 1]) {
      host = args[i + 1];
      i++;
    } else if (args[i] === '--secret' && args[i + 1]) {
      authToken = args[i + 1];
      i++;
    } else if (args[i] === '--worktree' && args[i + 1]) {
      sandboxWorktreeDir = args[i + 1];
      i++;
    }
  }

  return { port, host, authToken, sandboxWorktreeDir };
}

async function main() {
  const config = parseArgs();
  console.log(`[MCP_TUNNEL] Starting Exeora MCP Tunnel on ws://${config.host}:${config.port}`);
  console.log(`[MCP_TUNNEL] Bound Sandbox Worktree: ${config.sandboxWorktreeDir}`);

  const tunnel = new EncryptedTunnel(config);
  const server = new McpSandboxServer(tunnel, config.sandboxWorktreeDir);
  server.registerHandlers();

  await tunnel.start();

  // Handle process shutdown cleanly
  const shutdown = async () => {
    console.log('\n[MCP_TUNNEL] Shutting down tunnel...');
    await tunnel.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[MCP_TUNNEL] Fatal error in tunnel process:', err);
  process.exit(1);
});
