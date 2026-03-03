use tauri::ipc::Channel;

use crate::error::{CommandError, CmdResult};
use crate::processing::pipeline;
use crate::types::{ConversionProgress, ConversionRequest, ConversionResult};

#[tauri::command]
pub async fn convert_images(
    request: ConversionRequest,
    on_progress: Channel<ConversionProgress>,
) -> CmdResult<ConversionResult> {
    let result = tokio::task::spawn_blocking(move || {
        pipeline::convert_batch(&request, |progress| {
            let _ = on_progress.send(progress);
        })
    })
    .await
    .map_err(|e| {
        CommandError::from(crate::error::ConvertoError::IoError(std::io::Error::new(
            std::io::ErrorKind::Other,
            e.to_string(),
        )))
    })?;

    Ok(result)
}
