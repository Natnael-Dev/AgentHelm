export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SecurityAssessment {
  risk_level: RiskLevel;
  policy_violations: string[];
}

export type EventType =
  | 'AGENT_STEP_PROPOSED'
  | 'AGENT_STEP_EXECUTING'
  | 'AGENT_STEP_COMPLETED'
  | 'AGENT_STEP_BLOCKED'
  | 'AGENT_STEP_ROLLEDBACK'
  | 'HEARTBEAT';

export interface WireEvent {
  event_type: EventType;
  session_id: string;
  step_id: string;
  timestamp: string;
  command: string;
  affected_files: string[];
  diff_patch: string;
  security_assessment: SecurityAssessment;
}

export interface AnalyticsData {
  total_events: number;
  total_steps: number;
  context_tokens: number;
  estimated_cost_usd: number;
  policy_violations_count: number;
  active_sessions_count: number;
  last_updated_rfc3339: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';
