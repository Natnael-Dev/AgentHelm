use axum::extract::State;
use axum::response::Json;
use axum::routing::get;
use axum::Router;
use serde_json::json;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::broadcast;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;

mod analytics;
mod hardware;
mod uds_listener;
mod wire_protocol;
mod ws_handler;

use analytics::AnalyticsTracker;
use hardware::HardwareMonitor;
use uds_listener::{UdsListener, DEFAULT_SOCKET_PATH};
use wire_protocol::WireEvent;
use ws_handler::{ws_handler, WsState, BROADCAST_CAPACITY};

#[derive(Clone)]
pub struct AppState {
    pub ws_state: Arc<WsState>,
    pub analytics: AnalyticsTracker,
}

async fn health_check() -> Json<serde_json::Value> {
    Json(json!({
        "status": "healthy",
        "service": "agentguard-telemetry",
        "version": env!("CARGO_PKG_VERSION"),
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

async fn get_analytics(State(state): State<AppState>) -> Json<analytics::AnalyticsSnapshot> {
    let snapshot = state.analytics.get_snapshot().await;
    Json(snapshot)
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .finish();
    tracing::subscriber::set_global_default(subscriber)
        .expect("setting default subscriber failed");

    info!("Starting AgentGuard Live Telemetry Server v{}...", env!("CARGO_PKG_VERSION"));

    let (tx, _rx) = broadcast::channel::<WireEvent>(BROADCAST_CAPACITY);
    let analytics = AnalyticsTracker::new();
    let hardware = HardwareMonitor::new();

    // Start hardware poller
    hardware.clone().start_background_poller().await;

    // Start UDS listener in background
    let uds = Arc::new(UdsListener::new(
        DEFAULT_SOCKET_PATH,
        tx.clone(),
        analytics.clone(),
    ));
    tokio::spawn(async move {
        uds.run().await;
    });

    let ws_state = Arc::new(WsState {
        tx,
        hardware,
    });

    let app_state = AppState {
        ws_state,
        analytics,
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/analytics", get(get_analytics))
        .route("/ws/events", get({
            let state = app_state.ws_state.clone();
            move |ws| ws_handler(ws, State(state))
        }))
        .with_state(app_state)
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    let addr = SocketAddr::from(([0, 0, 0, 0], 8765));
    info!("[SERVER] Telemetry & WebSocket engine bound to http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
