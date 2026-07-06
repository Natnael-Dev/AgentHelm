import { WireEvent } from '../types/telemetry';

export const MOCK_TELEMETRY_EVENTS: WireEvent[] = [
  {
    event_type: 'AGENT_STEP_PROPOSED',
    session_id: 'sess_9823f4a',
    step_id: 'STEP_042',
    timestamp: '2026-09-01T12:00:15.124Z',
    command: 'npm test',
    affected_files: ['src/auth/jwt.ts'],
    diff_patch: `--- a/src/auth/jwt.ts\n+++ b/src/auth/jwt.ts\n@@ -6,14 +6,19 @@\n-   exp?: number\n+   exp: number\n+   iat: number\n }\n \n- export function verifyToken(token: string): TokenPayload | false {\n-   const payload = jwt.decode(token)\n-   if (!payload.exp) return false\n-   const secret = process.env.JWT_SECRET\n-   return jwt.verify(token, secret)\n+ export function verifyToken(token: string): TokenPayload {\n+   const payload = jwt.decode(token, { complete: true })\n+   if (!payload?.exp || payload.exp < Date.now() / 1000)\n+     throw new TokenExpiredError('Token has expired')\n+   const secret = process.env.JWT_SECRET ?? ''\n+   if (!secret) throw new Error('JWT_SECRET not configured')\n+   return jwt.verify(token, secret, { algorithms: ['HS256'] })\n }\n`,
    security_assessment: {
      risk_level: 'HIGH',
      policy_violations: [],
    },
  },
  {
    event_type: 'AGENT_STEP_COMPLETED',
    session_id: 'sess_9823f4a',
    step_id: 'STEP_041',
    timestamp: '2026-09-01T12:00:01.447Z',
    command: 'jest --watch',
    affected_files: ['tests/auth.test.ts'],
    diff_patch: '',
    security_assessment: {
      risk_level: 'MEDIUM',
      policy_violations: [],
    },
  },
  {
    event_type: 'AGENT_STEP_COMPLETED',
    session_id: 'sess_9823f4a',
    step_id: 'STEP_040',
    timestamp: '2026-09-01T11:59:55.218Z',
    command: 'eslint --fix',
    affected_files: ['src/auth/jwt.ts', 'src/utils/token.ts'],
    diff_patch: '',
    security_assessment: {
      risk_level: 'LOW',
      policy_violations: [],
    },
  },
  {
    event_type: 'AGENT_STEP_COMPLETED',
    session_id: 'sess_9823f4a',
    step_id: 'STEP_039',
    timestamp: '2026-09-01T11:59:42.031Z',
    command: 'git status',
    affected_files: ['src/auth/jwt.ts'],
    diff_patch: '',
    security_assessment: {
      risk_level: 'LOW',
      policy_violations: [],
    },
  },
  {
    event_type: 'AGENT_STEP_COMPLETED',
    session_id: 'sess_9823f4a',
    step_id: 'STEP_038',
    timestamp: '2026-09-01T11:59:28.004Z',
    command: 'git fetch --all',
    affected_files: ['refs/heads/main'],
    diff_patch: '',
    security_assessment: {
      risk_level: 'LOW',
      policy_violations: [],
    },
  },
];
