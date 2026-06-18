// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn trigger_approve_merge(step_id: String) -> String {
    println!("[TAURI_IPC] Approved and merged step: {}", step_id);
    format!("Merged {}", step_id)
}

#[tauri::command]
fn trigger_step_undo(step_id: String) -> String {
    println!("[TAURI_IPC] Rollback requested for step: {}", step_id);
    format!("Rolled back {}", step_id)
}

#[tauri::command]
fn trigger_kill_agent(session_id: String) -> String {
    println!("[TAURI_IPC] SIGTERM sent to session: {}", session_id);
    format!("Killed session {}", session_id)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            trigger_approve_merge,
            trigger_step_undo,
            trigger_kill_agent
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
