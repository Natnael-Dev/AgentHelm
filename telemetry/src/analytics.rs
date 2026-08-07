use crate::wire_protocol::WireEvent;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AnalyticsSnapshot {
    pub total_events: u64,
    pub total_steps: u64,
    pub context_tokens: u64,
    pub estimated_cost_usd: f64,
    pub policy_violations_count: u64,
    pub active_sessions_count: usize,
    pub active_sessions: Vec<String>,
    pub last_updated_rfc3339: String,
}

#[derive(Debug, Default)]
struct State {
    total_events: u64,
    total_steps: u64,
    context_tokens: u64,
    estimated_cost_usd: f64,
    policy_violations_count: u64,
    sessions: HashSet<String>,
}

#[derive(Clone, Default)]
pub struct AnalyticsTracker {
    state: Arc<RwLock<State>>,
}

impl AnalyticsTracker {
    pub fn new() -> Self {
        Self {
            state: Arc::new(RwLock::new(State::default())),
        }
    }

    pub async fn record_event(&self, event: &WireEvent) {
        let mut s = self.state.write().await;
        s.total_events += 1;

        if !event.session_id.is_empty() {
            s.sessions.insert(event.session_id.clone());
        }

        if event.event_type.contains("STEP") {
            s.total_steps += 1;
        }

        if !event.security_assessment.policy_violations.is_empty() {
            s.policy_violations_count += event.security_assessment.policy_violations.len() as u64;
        }

        // Approximate token velocity from command and diff contents
        let payload_len = event.command.len() + event.diff_patch.len() + 64;
        let estimated_tokens = (payload_len / 4).max(1) as u64;
        s.context_tokens += estimated_tokens;

        // Blended cost: $3.00 per 1M input tokens
        s.estimated_cost_usd = (s.context_tokens as f64) * (3.0 / 1_000_000.0);
    }

    pub async fn get_snapshot(&self) -> AnalyticsSnapshot {
        let s = self.state.read().await;
        AnalyticsSnapshot {
            total_events: s.total_events,
            total_steps: s.total_steps,
            context_tokens: s.context_tokens,
            estimated_cost_usd: s.estimated_cost_usd,
            policy_violations_count: s.policy_violations_count,
            active_sessions_count: s.sessions.len(),
            active_sessions: s.sessions.iter().cloned().collect(),
            last_updated_rfc3339: chrono::Utc::now().to_rfc3339(),
        }
    }

    pub async fn reset(&self) {
        let mut s = self.state.write().await;
        *s = State::default();
    }
}
