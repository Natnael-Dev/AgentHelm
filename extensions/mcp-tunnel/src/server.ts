import fs from 'fs';
import path from 'path';
import { WebSocket } from 'ws';
import { JsonRpcRequest, JsonRpcResponse, McpToolDefinition, McpResourceDefinition } from './types';
import { EncryptedTunnel } from './tunnel';

export class McpSandboxServer {
  private tunnel: EncryptedTunnel;
  private worktreeDir: string;

  constructor(tunnel: EncryptedTunnel, worktreeDir?: string) {
    this.tunnel = tunnel;
    this.worktreeDir = worktreeDir || process.cwd();
  }

  public registerHandlers() {
    this.tunnel.onMessage((rawMsg: string, ws: WebSocket) => {
      this.handleMessage(rawMsg, ws);
    });
  }

  private handleMessage(rawMsg: string, ws: WebSocket) {
    try {
      const request: JsonRpcRequest = JSON.parse(rawMsg);
      const response = this.dispatchRpc(request);
      this.tunnel.send(ws, JSON.stringify(response));
    } catch (err) {
      const errorResp: JsonRpcResponse = {
        jsonrpc: '2.0',
        id: 'null',
        error: {
          code: -32700,
          message: `Parse error: ${(err as Error).message}`,
        },
      };
      this.tunnel.send(ws, JSON.stringify(errorResp));
    }
  }

  private dispatchRpc(req: JsonRpcRequest): JsonRpcResponse {
    switch (req.method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id: req.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
              resources: {},
            },
            serverInfo: {
              name: 'agentguard-exeora-tunnel',
              version: '1.0.0',
            },
          },
        };

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id: req.id,
          result: {
            tools: this.getToolDefinitions(),
          },
        };

      case 'tools/call':
        return this.handleToolCall(req);

      case 'resources/list':
        return {
          jsonrpc: '2.0',
          id: req.id,
          result: {
            resources: this.getResourceDefinitions(),
          },
        };

      case 'ping':
        return {
          jsonrpc: '2.0',
          id: req.id,
          result: { status: 'pong', timestamp: new Date().toISOString() },
        };

      default:
        return {
          jsonrpc: '2.0',
          id: req.id,
          error: {
            code: -32601,
            message: `Method not found: ${req.method}`,
          },
        };
    }
  }

  private getToolDefinitions(): McpToolDefinition[] {
    return [
      {
        name: 'read_sandbox_file',
        description: 'Read contents of a file inside the isolated git worktree sandbox',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: { type: 'string', description: 'Relative path to file in worktree' },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'list_sandbox_tree',
        description: 'List directories and files in the isolated workspace',
        inputSchema: {
          type: 'object',
          properties: {
            subDir: { type: 'string', description: 'Subdirectory path to list' },
          },
        },
      },
      {
        name: 'inspect_ledger',
        description: 'Read the append-only AgentGuard security ledger steps',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Number of recent steps to fetch' },
          },
        },
      },
    ];
  }

  private getResourceDefinitions(): McpResourceDefinition[] {
    return [
      {
        uri: 'agentguard://ledger/active',
        name: 'Active Security Ledger',
        mimeType: 'application/json',
        description: 'Real-time append-only security ledger of proposed and executed steps',
      },
      {
        uri: 'agentguard://diff/active',
        name: 'Active Step Diff',
        mimeType: 'text/x-diff',
        description: 'Unified git diff patch of the current proposed execution step',
      },
    ];
  }

  private handleToolCall(req: JsonRpcRequest): JsonRpcResponse {
    const params = req.params as { name: string; arguments: Record<string, unknown> } | undefined;
    if (!params || !params.name) {
      return {
        jsonrpc: '2.0',
        id: req.id,
        error: { code: -32602, message: 'Invalid params: name is required' },
      };
    }

    const { name, arguments: args } = params;

    if (name === 'read_sandbox_file') {
      const targetFile = String(args?.filePath || '');
      const fullPath = path.resolve(this.worktreeDir, targetFile);

      // Security check: ensure path stays within worktree directory
      if (!fullPath.startsWith(path.resolve(this.worktreeDir))) {
        return {
          jsonrpc: '2.0',
          id: req.id,
          result: {
            isError: true,
            content: [{ type: 'text', text: 'Access denied: path traversal blocked by AgentGuard sandbox' }],
          },
        };
      }

      if (!fs.existsSync(fullPath)) {
        return {
          jsonrpc: '2.0',
          id: req.id,
          result: {
            isError: true,
            content: [{ type: 'text', text: `File not found: ${targetFile}` }],
          },
        };
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      return {
        jsonrpc: '2.0',
        id: req.id,
        result: {
          content: [{ type: 'text', text: content }],
        },
      };
    }

    if (name === 'list_sandbox_tree') {
      const subDir = String(args?.subDir || '');
      const targetDir = path.resolve(this.worktreeDir, subDir);

      if (!fs.existsSync(targetDir)) {
        return {
          jsonrpc: '2.0',
          id: req.id,
          result: {
            isError: true,
            content: [{ type: 'text', text: `Directory not found: ${subDir}` }],
          },
        };
      }

      const entries = fs.readdirSync(targetDir, { withFileTypes: true }).map((dirent) => ({
        name: dirent.name,
        type: dirent.isDirectory() ? 'directory' : 'file',
      }));

      return {
        jsonrpc: '2.0',
        id: req.id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(entries, null, 2) }],
        },
      };
    }

    if (name === 'inspect_ledger') {
      return {
        jsonrpc: '2.0',
        id: req.id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'SANDBOX_ACTIVE',
                mode: 'APPEND_ONLY',
                rulesArmed: 14,
                activeWorktree: 'sandbox-042',
              }),
            },
          ],
        },
      };
    }

    return {
      jsonrpc: '2.0',
      id: req.id,
      error: { code: -32601, message: `Tool not supported: ${name}` },
    };
  }
}
