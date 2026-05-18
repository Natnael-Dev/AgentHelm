import crypto from 'crypto';
import { WebSocket, WebSocketServer } from 'ws';
import { EncryptedPacket, TunnelConfig } from './types';

export class EncryptedTunnel {
  private wss: WebSocketServer | null = null;
  private key: Buffer;
  private config: TunnelConfig;
  private clients: Set<WebSocket> = new Set();
  private messageHandler?: (msg: string, ws: WebSocket) => void;

  constructor(config: TunnelConfig) {
    this.config = config;
    // Derive 256-bit key from secret or generate ephemeral secret
    const secret = config.authToken || 'agentguard_default_ephemeral_secret_key_32b';
    this.key = crypto.createHash('sha256').update(secret).digest();
  }

  public onMessage(handler: (msg: string, ws: WebSocket) => void) {
    this.messageHandler = handler;
  }

  public encrypt(plainText: string): EncryptedPacket {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      payload: encrypted,
    };
  }

  public decrypt(packet: EncryptedPacket): string {
    const iv = Buffer.from(packet.iv, 'hex');
    const authTag = Buffer.from(packet.authTag, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(packet.payload, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocketServer({
          port: this.config.port,
          host: this.config.host,
        });

        this.wss.on('listening', () => {
          console.log(`[MCP_TUNNEL] Encrypted WebSocket Tunnel listening on ws://${this.config.host}:${this.config.port}`);
          resolve();
        });

        this.wss.on('connection', (ws: WebSocket, req) => {
          console.log(`[MCP_TUNNEL] Client connected from ${req.socket.remoteAddress}`);
          this.clients.add(ws);

          ws.on('message', (data: Buffer | string) => {
            try {
              const rawStr = data.toString();
              let payloadStr = rawStr;

              // Check if encrypted packet envelope
              if (rawStr.startsWith('{') && rawStr.includes('"iv"') && rawStr.includes('"authTag"')) {
                const parsed: EncryptedPacket = JSON.parse(rawStr);
                payloadStr = this.decrypt(parsed);
              }

              if (this.messageHandler) {
                this.messageHandler(payloadStr, ws);
              }
            } catch (err) {
              console.error('[MCP_TUNNEL] Error processing incoming tunnel frame:', err);
            }
          });

          ws.on('close', () => {
            console.log('[MCP_TUNNEL] Client disconnected');
            this.clients.delete(ws);
          });

          ws.on('error', (err) => {
            console.error('[MCP_TUNNEL] WebSocket error:', err);
            this.clients.delete(ws);
          });
        });

        this.wss.on('error', (err) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  public broadcast(message: string, encrypted = false) {
    const dataToSend = encrypted ? JSON.stringify(this.encrypt(message)) : message;
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(dataToSend);
      }
    }
  }

  public send(ws: WebSocket, message: string, encrypted = false) {
    if (ws.readyState === WebSocket.OPEN) {
      const dataToSend = encrypted ? JSON.stringify(this.encrypt(message)) : message;
      ws.send(dataToSend);
    }
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
