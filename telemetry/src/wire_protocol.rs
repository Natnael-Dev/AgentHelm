use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SecurityAssessment {
    pub risk_level: String,
    #[serde(default)]
    pub policy_violations: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WireEvent {
    pub event_type: String,
    pub session_id: String,
    pub step_id: String,
    pub timestamp: String,
    #[serde(default)]
    pub command: String,
    #[serde(default)]
    pub affected_files: Vec<String>,
    #[serde(default)]
    pub diff_patch: String,
    pub security_assessment: SecurityAssessment,
}
