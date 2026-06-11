import { WireEvent } from '../types/telemetry';

export const MOCK_TELEMETRY_EVENTS: WireEvent[] = [
  {
    event_type: 'AGENT_STEP_PROPOSED',
    session_id: 'sess_claude_0492',
    step_id: 'step_101',
    timestamp: new Date().toISOString(),
    command: 'npm test',
    affected_files: ['src/auth/jwt.ts', 'src/auth/jwt.test.ts'],
    diff_patch: `--- a/src/auth/jwt.ts\n+++ b/src/auth/jwt.ts\n@@ -12,4 +12,6 @@\n- const token = sign(payload, "hardcoded_secret");\n+ const secret = process.env.JWT_SECRET || 'dev_secret';\n+ const token = sign(payload, secret);\n`,
    security_assessment: {
      risk_level: 'LOW',
      policy_violations: [],
    },
  },
  {
    event_type: 'AGENT_STEP_BLOCKED',
    session_id: 'sess_claude_0492',
    step_id: 'step_102',
    timestamp: new Date(Date.now() - 30000).toISOString(),
    command: 'rm -rf /',
    affected_files: [],
    diff_patch: '',
    security_assessment: {
      risk_level: 'CRITICAL',
      policy_violations: ['no-rm-rf-root: Dangerous: recursive delete from root directory'],
    },
  },
  {
    event_type: 'AGENT_STEP_COMPLETED',
    session_id: 'sess_claude_0492',
    step_id: 'step_100',
    timestamp: new Date(Date.now() - 90000).toISOString(),
    command: 'git status',
    affected_files: ['package.json'],
    diff_patch: `--- a/package.json\n+++ b/package.json\n@@ -5,2 +5,3 @@\n+ "version": "1.0.1",\n`,
    security_assessment: {
      risk_level: 'LOW',
      policy_violations: [],
    },
  },
];
