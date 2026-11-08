#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::net::{TcpStream, ToSocketAddrs};
use std::path::PathBuf;
use std::time::Duration;
use tauri::{AppHandle, Manager, Url, WebviewWindow};

const DEFAULT_SERVER_URL: &str = "http://localhost:8000";

fn server_config_path(app: &AppHandle) -> Option<PathBuf> {
    app.path()
        .app_config_dir()
        .ok()
        .map(|dir| dir.join("server_url.txt"))
}

fn read_saved_url(app: &AppHandle) -> String {
    if let Some(path) = server_config_path(app) {
        if let Ok(contents) = fs::read_to_string(path) {
            let trimmed = contents.trim();
            if !trimmed.is_empty() {
                return trimmed.to_string();
            }
        }
    }
    DEFAULT_SERVER_URL.to_string()
}

fn save_url(app: &AppHandle, url: &str) {
    if let Some(path) = server_config_path(app) {
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        let _ = fs::write(path, url);
    }
}

fn normalize_and_parse_url(raw: &str) -> Result<Url, String> {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return Err("Please enter the GeoReport server URL.".to_string());
    }

    let candidate = if trimmed.starts_with("http://") || trimmed.starts_with("https://") {
        trimmed.to_string()
    } else {
        format!("http://{}", trimmed)
    };

    let parsed = Url::parse(&candidate)
        .map_err(|e| format!("Invalid server URL '{}': {}", candidate, e))?;

    match parsed.scheme() {
        "http" | "https" => Ok(parsed),
        other => Err(format!(
            "Unsupported URL scheme '{}'. Use http:// or https://.",
            other
        )),
    }
}

fn check_tcp_reachable(url: &Url, timeout_ms: u64) -> Result<(), String> {
    let host = url
        .host_str()
        .ok_or_else(|| "Server URL is missing a hostname.".to_string())?;
    let port = url
        .port_or_known_default()
        .ok_or_else(|| "Server URL is missing a valid port.".to_string())?;

    let addrs: Vec<_> = (host, port)
        .to_socket_addrs()
        .map_err(|e| format!("Could not resolve {}:{} ({})", host, port, e))?
        .collect();

    if addrs.is_empty() {
        return Err(format!("No network address found for {}:{}.", host, port));
    }

    let timeout = Duration::from_millis(timeout_ms);
    for addr in addrs {
        if TcpStream::connect_timeout(&addr, timeout).is_ok() {
            return Ok(());
        }
    }

    Err(format!(
        "Could not connect to {}:{}. Make sure your Docker stack is running (docker compose up -d) or verify the server IP.",
        host, port
    ))
}

#[tauri::command]
fn get_saved_server(app: AppHandle) -> String {
    read_saved_url(&app)
}

#[tauri::command]
async fn connect_server(
    app: AppHandle,
    window: WebviewWindow,
    url: String,
) -> Result<String, String> {
    let parsed = normalize_and_parse_url(&url)?;
    let check_target = parsed.clone();

    tauri::async_runtime::spawn_blocking(move || check_tcp_reachable(&check_target, 900))
        .await
        .map_err(|e| format!("Connection check failed: {}", e))??;

    let final_url = parsed.to_string();
    save_url(&app, &final_url);

    window
        .navigate(parsed)
        .map_err(|e| format!("Failed to open GeoReport portal: {}", e))?;

    Ok(final_url)
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let initial_url = read_saved_url(app.handle());
            if let Ok(parsed) = normalize_and_parse_url(&initial_url) {
                if check_tcp_reachable(&parsed, 350).is_ok() {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.navigate(parsed);
                    }
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_saved_server, connect_server])
        .run(tauri::generate_context!())
        .expect("error while running GeoReport desktop application");
}
