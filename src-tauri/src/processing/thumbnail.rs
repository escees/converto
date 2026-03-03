use base64::Engine;
use std::io::Cursor;
use std::path::Path;

use crate::error::{ConvertoError, Result};
use crate::processing::decoder;
use crate::types::ThumbnailResponse;

const THUMBNAIL_MAX_DIMENSION: u32 = 200;

/// Generate a base64-encoded PNG thumbnail from an image file.
pub fn generate(path: &Path) -> Result<ThumbnailResponse> {
    let img = decoder::decode_image(path)?;
    let thumb = img.thumbnail(THUMBNAIL_MAX_DIMENSION, THUMBNAIL_MAX_DIMENSION);
    let (width, height) = (thumb.width(), thumb.height());

    let mut buffer = Cursor::new(Vec::new());
    thumb
        .write_to(&mut buffer, image::ImageFormat::Png)
        .map_err(|e| ConvertoError::EncodeError {
            path: path.display().to_string(),
            source: Box::new(e),
        })?;

    let data_base64 =
        base64::engine::general_purpose::STANDARD.encode(buffer.into_inner());

    Ok(ThumbnailResponse {
        data_base64,
        width,
        height,
    })
}
