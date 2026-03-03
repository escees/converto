use std::path::Path;

use crate::error::{CmdResult, CommandError, ConvertoError};
use crate::processing::{decoder, metadata};
use crate::types::{FormatInfo, ImageFormat, ImageInfo};

#[tauri::command]
pub async fn get_image_info(path: String) -> CmdResult<ImageInfo> {
    let path_ref = Path::new(&path);

    if !path_ref.exists() {
        return Err(CommandError::from(ConvertoError::FileNotFound(path)));
    }

    let file_name = path_ref
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    let ext = path_ref
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("");

    let format = ImageFormat::from_extension(ext)
        .ok_or_else(|| CommandError::from(ConvertoError::UnsupportedFormat(format!(".{ext}"))))?;

    let file_size_bytes = std::fs::metadata(path_ref)
        .map(|m| m.len())
        .map_err(|e| CommandError::from(ConvertoError::IoError(e)))?;

    let img = tokio::task::spawn_blocking({
        let path_clone = path.clone();
        move || decoder::decode_image(Path::new(&path_clone))
    })
    .await
    .map_err(|e| {
        CommandError::from(ConvertoError::IoError(std::io::Error::new(
            std::io::ErrorKind::Other,
            e,
        )))
    })?
    .map_err(CommandError::from)?;

    let has_exif = metadata::has_exif(path_ref);

    Ok(ImageInfo {
        path,
        file_name,
        format,
        width: img.width(),
        height: img.height(),
        file_size_bytes,
        has_exif,
        color_space: format!("{:?}", img.color()),
    })
}

#[tauri::command]
pub fn get_supported_formats() -> Vec<FormatInfo> {
    crate::formats::supported_formats()
}
