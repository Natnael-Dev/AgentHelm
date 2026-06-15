use telemetry::analytics::AnalyticsTracker;
use telemetry::wire_protocol::{SecurityAssessment, WireEvent};

#[tokio::test]
async fn test_analytics_accumulation() {
    let tracker = AnalyticsTracker::new();

    let event1 = WireEvent {
        event_type: "AGENT_STEP_PROPOSED".to_string(),
        session_id: "sess_1".to_string(),
        step_id: "step_1".to_string(),
        timestamp: "2026-09-01T12:00:00Z".to_string(),
        command: "cargo test".to_string(),
        affected_files: vec![],
        diff_patch: "".to_string(),
        security_assessment: SecurityAssessment {
            risk_level: "LOW".to_string(),
            policy_violations: vec![],
        },
    };

    let event2 = WireEvent {
        event_type: "AGENT_STEP_BLOCKED".to_string(),
        session_id: "sess_2".to_string(),
        step_id: "step_2".to_string(),
        timestamp: "2026-09-01T12:01:00Z".to_string(),
        command: "rm -rf /".to_string(),
        affected_files: vec![],
        diff_patch: "".to_string(),
        security_assessment: SecurityAssessment {
            risk_level: "CRITICAL".to_string(),
            policy_violations: vec!["no-rm-rf-root".to_string()],
        },
    };

    tracker.record_event(&event1).await;
    tracker.record_event(&event2).await;

    let snapshot = tracker.get_snapshot().await;
    assert_eq!(snapshot.total_events, 2);
    assert_eq!(snapshot.total_steps, 2);
    assert_eq!(snapshot.active_sessions_count, 2);
    assert_eq!(snapshot.policy_violations_count, 1);
    assert!(snapshot.context_tokens > 0);
    assert!(snapshot.estimated_cost_usd > 0.0);
}
