// Prevents additional console window on Windows in release.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod error;
mod formats;
mod processing;
mod types;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::convert::convert_images,
            commands::inspect::get_image_info,
            commands::inspect::get_supported_formats,
            commands::thumbnail::generate_thumbnail,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Converto");
}
