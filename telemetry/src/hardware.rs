use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tokio::time::{sleep, Duration};
use tracing::{info, warn};

#[derive(Clone, Default)]
pub struct HardwareMonitor {
    panic_triggered: Arc<AtomicBool>,
}

impl HardwareMonitor {
    pub fn new() -> Self {
        Self {
            panic_triggered: Arc::new(AtomicBool::new(false)),
        }
    }

    pub fn is_panic_triggered(&self) -> bool {
        self.panic_triggered.load(Ordering::SeqCst)
    }

    pub fn trigger_panic(&self) {
        self.panic_triggered.store(true, Ordering::SeqCst);
        warn!("[HARDWARE] 🚨 PHYSICAL PANIC BUTTON ACTIVATED! Halting agent runtime!");
    }

    pub fn reset_panic(&self) {
        self.panic_triggered.store(false, Ordering::SeqCst);
        info!("[HARDWARE] Panic state reset to normal.");
    }

    pub async fn start_background_poller(self) {
        tokio::spawn(async move {
            info!("[HARDWARE] Stream Deck & physical panic button poller started.");
            loop {
                if self.is_panic_triggered() {
                    warn!("[HARDWARE] Panic button state: TRIGGERED");
                } else {
                    info!("[HARDWARE] Panic button state: OK");
                }
                sleep(Duration::from_secs(60)).await;
            }
        });
    }
}
