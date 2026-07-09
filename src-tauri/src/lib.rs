use std::fs;
use std::path::Path;
use std::process::Command;

#[derive(serde::Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GitStatus {
    pub branch: String,
    pub last_commit_message: String,
    pub last_commit_time: String,
    pub last_push_time: String,
    pub remote_url: String,
    pub modified_files: i32,
    pub staged_files: i32,
    pub untracked_files: i32,
    pub ahead: i32,
    pub behind: i32,
    pub last_updated: String,
}

fn run_git(dir: &str, args: &[&str]) -> Result<String, String> {
    let output = Command::new("git")
        .args(args)
        .current_dir(dir)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).trim().to_string())
    }
}

#[tauri::command]
fn get_git_status_real(project_path: String) -> Result<GitStatus, String> {
    let path = Path::new(&project_path);
    if !path.exists() {
        return Err("Project directory does not exist".to_string());
    }

    if !path.join(".git").exists() {
        return Err("Not a Git repository".to_string());
    }

    let branch = run_git(&project_path, &["rev-parse", "--abbrev-ref", "HEAD"])
        .unwrap_or_else(|_| "unknown".to_string());

    let last_commit_message = run_git(&project_path, &["log", "-1", "--pretty=format:%s"])
        .unwrap_or_else(|_| "No commits yet".to_string());

    let last_commit_time = run_git(&project_path, &["log", "-1", "--pretty=format:%cr"])
        .unwrap_or_else(|_| "Never".to_string());

    let remote_url = run_git(&project_path, &["remote", "get-url", "origin"])
        .unwrap_or_else(|_| "".to_string());

    let status_output = run_git(&project_path, &["status", "--porcelain"]).unwrap_or_default();
    let mut modified_files = 0;
    let mut staged_files = 0;
    let mut untracked_files = 0;

    for line in status_output.lines() {
        if line.len() >= 3 {
            let chars: Vec<char> = line.chars().collect();
            let c1 = chars[0];
            let c2 = chars[1];
            if c1 == '?' && c2 == '?' {
                untracked_files += 1;
            } else {
                if c1 != ' ' {
                    staged_files += 1;
                }
                if c2 != ' ' {
                    modified_files += 1;
                }
            }
        }
    }

    let mut ahead = 0;
    let mut behind = 0;
    if let Ok(upstream) = run_git(&project_path, &["rev-parse", "--abbrev-ref", "@{u}"]) {
        if let Ok(ab_count) = run_git(&project_path, &["rev-list", "--left-right", "--count", &format!("HEAD...{}", upstream)]) {
            let parts: Vec<&str> = ab_count.split_whitespace().collect();
            if parts.len() == 2 {
                ahead = parts[0].parse::<i32>().unwrap_or(0);
                behind = parts[1].parse::<i32>().unwrap_or(0);
            }
        }
    }

    let last_push_time = if !remote_url.is_empty() {
        if ahead == 0 {
            "Senkronize (Push yapıldı)".to_string()
        } else {
            format!("Push yapılmadı ({} commit önde)", ahead)
        }
    } else {
        "Remote yok".to_string()
    };

    Ok(GitStatus {
        branch,
        last_commit_message,
        last_commit_time,
        last_push_time,
        remote_url,
        modified_files,
        staged_files,
        untracked_files,
        ahead,
        behind,
        last_updated: "Yeni güncellendi".to_string(),
    })
}

#[tauri::command]
fn read_project_file(project_path: String, filename: String) -> Result<String, String> {
    let dir_path = Path::new(&project_path).join(".projectos");
    let file_path = dir_path.join(filename);
    
    if !file_path.exists() {
        return Err("File not found".to_string());
    }

    fs::read_to_string(file_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_project_file(project_path: String, filename: String, content: String) -> Result<(), String> {
    let dir_path = Path::new(&project_path).join(".projectos");
    
    if !dir_path.exists() {
        fs::create_dir_all(&dir_path).map_err(|e| e.to_string())?;
    }

    let file_path = dir_path.join(filename);
    fs::write(file_path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn project_file_exists(project_path: String, filename: String) -> bool {
    let file_path = Path::new(&project_path).join(".projectos").join(filename);
    file_path.exists()
}

#[tauri::command]
fn list_project_md_files(project_path: String) -> Result<Vec<String>, String> {
    let dir_path = Path::new(&project_path).join(".projectos");
    if !dir_path.exists() {
        return Ok(Vec::new());
    }
    
    let mut files = Vec::new();
    let entries = fs::read_dir(dir_path).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_file() {
            if let Some(ext) = path.extension() {
                if ext == "md" {
                    if let Some(name) = path.file_name() {
                        if let Some(name_str) = name.to_str() {
                            files.push(name_str.to_string());
                        }
                    }
                }
            }
        }
    }
    Ok(files)
}

#[tauri::command]
fn delete_project_file(project_path: String, filename: String) -> Result<(), String> {
    let file_path = Path::new(&project_path).join(".projectos").join(filename);
    if file_path.exists() {
        fs::remove_file(file_path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn git_push(project_path: String, commit_message: String) -> Result<String, String> {
    let path = Path::new(&project_path);
    if !path.exists() {
        return Err("Project directory does not exist".to_string());
    }

    // 1. Stage all changes
    run_git(&project_path, &["add", "."])?;

    // 2. Commit if there are changes
    let status_output = run_git(&project_path, &["status", "--porcelain"]).unwrap_or_default();
    if !status_output.is_empty() {
        run_git(&project_path, &["commit", "-m", &commit_message])?;
    }

    // 3. Push
    run_git(&project_path, &["push", "origin", "HEAD"])
}

#[tauri::command]
fn git_pull(project_path: String) -> Result<String, String> {
    let path = Path::new(&project_path);
    if !path.exists() {
        return Err("Project directory does not exist".to_string());
    }

    run_git(&project_path, &["pull", "origin"])
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_git_status_real,
            read_project_file,
            write_project_file,
            project_file_exists,
            list_project_md_files,
            delete_project_file,
            git_push,
            git_pull
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


