/**
 * Model Context Protocol (MCP) and Exeora Tunnel Data Structures
 */

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface McpResourceDefinition {
  uri: string;
  name: string;
  mimeType?: string;
  description?: string;
}

export interface TunnelConfig {
  port: number;
  host: string;
  authToken?: string;
  udsPath?: string;
  sandboxWorktreeDir?: string;
}

export interface EncryptedPacket {
  iv: string;
  authTag: string;
  payload: string;
}
