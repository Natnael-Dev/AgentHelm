use telemetry::wire_protocol::{SecurityAssessment, WireEvent};

#[test]
fn test_wire_protocol_deserialization() {
    let json_payload = r#"{
        "event_type": "AGENT_STEP_PROPOSED",
        "session_id": "sess_9823f4a",
        "step_id": "step_042",
        "timestamp": "2026-09-01T12:00:00.124Z",
        "command": "npm test",
        "affected_files": ["src/auth/jwt.ts"],
        "diff_patch": "@@ -12,4 +12,6 @@\n+ const token = sign(payload, secret);\n",
        "security_assessment": { "risk_level": "LOW", "policy_violations": [] }
    }"#;

    let event: Result<WireEvent, _> = serde_json::from_str(json_payload);
    assert!(event.is_ok());

    let ev = event.unwrap();
    assert_eq!(ev.event_type, "AGENT_STEP_PROPOSED");
    assert_eq!(ev.session_id, "sess_9823f4a");
    assert_eq!(ev.step_id, "step_042");
    assert_eq!(ev.command, "npm test");
    assert_eq!(ev.affected_files, vec!["src/auth/jwt.ts"]);
    assert_eq!(ev.security_assessment.risk_level, "LOW");
    assert!(ev.security_assessment.policy_violations.is_empty());
}

#[test]
fn test_wire_protocol_blocked_event() {
    let json_payload = r#"{
        "event_type": "AGENT_STEP_BLOCKED",
        "session_id": "sess_malicious_01",
        "step_id": "step_666",
        "timestamp": "2026-09-01T12:05:00.000Z",
        "command": "rm -rf /",
        "affected_files": [],
        "diff_patch": "",
        "security_assessment": {
            "risk_level": "CRITICAL",
            "policy_violations": ["no-rm-rf-root: Dangerous: recursive delete from root directory"]
        }
    }"#;

    let event: WireEvent = serde_json::from_str(json_payload).expect("must parse");
    assert_eq!(ev_risk(&event), "CRITICAL");
    assert_eq!(event.security_assessment.policy_violations.len(), 1);
}

fn ev_risk(ev: &WireEvent) -> &str {
    &ev.security_assessment.risk_level
}
