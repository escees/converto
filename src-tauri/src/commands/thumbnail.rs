use std::path::Path;

use crate::error::{CmdResult, CommandError, ConvertoError};
use crate::processing::thumbnail;
use crate::types::ThumbnailResponse;

#[tauri::command]
pub async fn generate_thumbnail(path: String) -> CmdResult<ThumbnailResponse> {
    let path_ref = Path::new(&path);

    if !path_ref.exists() {
        return Err(CommandError::from(ConvertoError::FileNotFound(path)));
    }

    let result = tokio::task::spawn_blocking({
        let p = path.clone();
        move || thumbnail::generate(Path::new(&p))
    })
    .await
    .map_err(|e| {
        CommandError::from(ConvertoError::IoError(std::io::Error::new(
            std::io::ErrorKind::Other,
            e,
        )))
    })?
    .map_err(CommandError::from)?;

    Ok(result)
}
