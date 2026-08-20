use telemetry::wire_protocol::{SecurityAssessment, WireEvent};
use tokio::sync::broadcast;

#[tokio::test]
async fn test_broadcast_channel_flow() {
    let (tx, mut rx) = broadcast::channel::<WireEvent>(16);

    let event = WireEvent {
        event_type: "AGENT_STEP_PROPOSED".to_string(),
        session_id: "sess_broadcast_test".to_string(),
        step_id: "step_001".to_string(),
        timestamp: "2026-09-01T12:00:00Z".to_string(),
        command: "ls -la".to_string(),
        affected_files: vec![],
        diff_patch: "".to_string(),
        security_assessment: SecurityAssessment {
            risk_level: "LOW".to_string(),
            policy_violations: vec![],
        },
    };

    tx.send(event.clone()).expect("send must succeed");

    let received = rx.recv().await.expect("receive must succeed");
    assert_eq!(received.step_id, "step_001");
    assert_eq!(received.event_type, "AGENT_STEP_PROPOSED");
}
