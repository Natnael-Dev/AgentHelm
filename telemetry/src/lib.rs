//! AgentHelm Live Telemetry Core Library
//!
//! Real-time telemetry ingestion, Unix Domain Socket stream listener,
//! and Axum WebSocket broadcast pipeline for AgentHelm Live.

pub mod analytics;
pub mod hardware;
pub mod uds_listener;
pub mod wire_protocol;
pub mod ws_handler;

pub use analytics::{AnalyticsSnapshot, AnalyticsTracker};
pub use hardware::HardwareMonitor;
pub use uds_listener::{UdsListener, DEFAULT_SOCKET_PATH};
pub use wire_protocol::{SecurityAssessment, WireEvent};
pub use ws_handler::{ws_handler, WsState, BROADCAST_CAPACITY};
