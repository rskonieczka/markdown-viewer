use std::sync::Mutex;
use serde::Serialize;

#[derive(Serialize, Clone)]
struct CliFileData {
    path: String,
    name: String,
    content: String,
}

struct CliState(Mutex<Option<CliFileData>>);

#[tauri::command]
fn get_cli_file(state: tauri::State<CliState>) -> Option<CliFileData> {
    state.0.lock().unwrap().clone()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let args: Vec<String> = std::env::args().collect();

    let mut file_data: Option<CliFileData> = None;
    for arg in args.iter().skip(1) {
        if !arg.starts_with('-') {
            let path = std::path::PathBuf::from(arg);
            if path.exists() {
                let abs = std::fs::canonicalize(&path).unwrap_or(path.clone());
                let abs_str = abs.to_string_lossy().to_string();
                let name = abs.file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();
                match std::fs::read_to_string(&abs) {
                    Ok(content) => {
                        file_data = Some(CliFileData {
                            path: abs_str,
                            name,
                            content,
                        });
                    }
                    Err(e) => eprintln!("Failed to read {}: {}", abs_str, e),
                }
            }
            break;
        }
    }


    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .manage(CliState(Mutex::new(file_data)))
        .invoke_handler(tauri::generate_handler![get_cli_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
