use crate::analytics::AnalyticsTracker;
use crate::wire_protocol::WireEvent;
use std::path::Path;
use std::sync::Arc;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::sync::broadcast;
use tokio::time::{sleep, Duration};
use tracing::{debug, error, info, warn};

pub const DEFAULT_SOCKET_PATH: &str = "/tmp/agenthelm.sock";

pub struct UdsListener {
    socket_path: String,
    tx: broadcast::Sender<WireEvent>,
    analytics: AnalyticsTracker,
}

impl UdsListener {
    pub fn new(
        socket_path: impl Into<String>,
        tx: broadcast::Sender<WireEvent>,
        analytics: AnalyticsTracker,
    ) -> Self {
        Self {
            socket_path: socket_path.into(),
            tx,
            analytics,
        }
    }

    #[cfg(unix)]
    pub async fn run(self: Arc<Self>) {
        let path = Path::new(&self.socket_path);
        if path.exists() {
            let _ = std::fs::remove_file(path);
        }

        if let Some(parent) = path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }

        let mut backoff = Duration::from_millis(100);
        let max_backoff = Duration::from_secs(5);

        let listener = loop {
            match tokio::net::UnixListener::bind(&self.socket_path) {
                Ok(l) => {
                    info!("[UDS] Successfully bound Unix domain socket: {}", self.socket_path);
                    break l;
                }
                Err(e) => {
                    error!("[UDS] Bind error (retrying in {:?}): {}", backoff, e);
                    sleep(backoff).await;
                    backoff = (backoff * 2).min(max_backoff);
                }
            }
        };

        loop {
            match listener.accept().await {
                Ok((stream, _addr)) => {
                    let this = Arc::clone(&self);
                    tokio::spawn(async move {
                        this.handle_client(stream).await;
                    });
                }
                Err(e) => {
                    warn!("[UDS] Accept connection error: {}", e);
                    sleep(Duration::from_millis(100)).await;
                }
            }
        }
    }

    #[cfg(not(unix))]
    pub async fn run(self: Arc<Self>) {
        info!("[UDS] Non-unix platform detected; running fallback IPC listener for {}", self.socket_path);
        loop {
            sleep(Duration::from_secs(15)).await;
        }
    }

    #[cfg(unix)]
    async fn handle_client(&self, stream: tokio::net::UnixStream) {
        let reader = BufReader::new(stream);
        let mut lines = reader.lines();

        while let Ok(Some(line)) = lines.next_line().await {
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }

            match serde_json::from_str::<WireEvent>(trimmed) {
                Ok(event) => {
                    debug!("[UDS] Received wire event: {} ({})", event.event_type, event.step_id);
                    self.analytics.record_event(&event).await;
                    if let Err(e) = self.tx.send(event) {
                        debug!("[UDS] No active WS subscribers: {}", e);
                    }
                }
                Err(e) => {
                    warn!("[UDS] Failed to parse JSONL payload: {} | raw: {}", e, trimmed);
                }
            }
        }
    }
}
