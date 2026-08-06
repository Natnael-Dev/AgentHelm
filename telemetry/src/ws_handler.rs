use crate::hardware::HardwareMonitor;
use crate::wire_protocol::WireEvent;
use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::extract::State;
use axum::response::IntoResponse;
use futures_util::{SinkExt, StreamExt};
use std::sync::Arc;
use tokio::sync::broadcast;
use tracing::{debug, error, info, warn};

#[derive(Clone)]
pub struct WsState {
    pub tx: broadcast::Sender<WireEvent>,
    pub hardware: HardwareMonitor,
}

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<WsState>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: Arc<WsState>) {
    let (mut sender, mut receiver) = socket.split();
    let mut rx = state.tx.subscribe();

    info!("[WS] Client connected to telemetry stream");

    let mut send_task = tokio::spawn(async move {
        loop {
            match rx.recv().await {
                Ok(event) => {
                    match serde_json::to_string(&event) {
                        Ok(json) => {
                            if let Err(e) = sender.send(Message::Text(json)).await {
                                debug!("[WS] Failed to send message to client (client disconnected): {}", e);
                                break;
                            }
                        }
                        Err(e) => {
                            error!("[WS] Failed to serialize wire event: {}", e);
                        }
                    }
                }
                Err(broadcast::error::RecvError::Lagged(skipped)) => {
                    warn!("[WS] Subscriber lagged behind, skipped {} events", skipped);
                }
                Err(broadcast::error::RecvError::Closed) => {
                    info!("[WS] Broadcast channel closed");
                    break;
                }
            }
        }
    });

    let hardware = state.hardware.clone();
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                Message::Text(text) => {
                    debug!("[WS] Received message from UI: {}", text);
                    if text.contains("PANIC") {
                        hardware.trigger_panic();
                    } else if text.contains("RESET_PANIC") {
                        hardware.reset_panic();
                    }
                }
                Message::Ping(_payload) => {
                    debug!("[WS] Received Ping from UI");
                }
                Message::Close(_) => {
                    debug!("[WS] Client requested close");
                    break;
                }
                _ => {}
            }
        }
    });

    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    }

    info!("[WS] Telemetry client session ended");
}
