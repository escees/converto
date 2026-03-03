use crate::types::{FormatInfo, ImageFormat};

/// Single source of truth for format capabilities.
pub fn supported_formats() -> Vec<FormatInfo> {
    vec![
        FormatInfo {
            format: ImageFormat::Jpeg,
            display_name: "JPEG".into(),
            extensions: vec!["jpg".into(), "jpeg".into()],
            supports_quality: true,
            supports_lossless: false,
            supports_exif: true,
        },
        FormatInfo {
            format: ImageFormat::Png,
            display_name: "PNG".into(),
            extensions: vec!["png".into()],
            supports_quality: false,
            supports_lossless: true,
            supports_exif: true,
        },
        FormatInfo {
            format: ImageFormat::Webp,
            display_name: "WebP".into(),
            extensions: vec!["webp".into()],
            supports_quality: true,
            supports_lossless: true,
            supports_exif: true,
        },
        FormatInfo {
            format: ImageFormat::Heic,
            display_name: "HEIC/HEIF".into(),
            extensions: vec!["heic".into(), "heif".into()],
            supports_quality: true,
            supports_lossless: true,
            supports_exif: true,
        },
        FormatInfo {
            format: ImageFormat::Avif,
            display_name: "AVIF".into(),
            extensions: vec!["avif".into()],
            supports_quality: true,
            supports_lossless: true,
            supports_exif: true,
        },
        FormatInfo {
            format: ImageFormat::Bmp,
            display_name: "BMP".into(),
            extensions: vec!["bmp".into()],
            supports_quality: false,
            supports_lossless: true,
            supports_exif: false,
        },
        FormatInfo {
            format: ImageFormat::Tiff,
            display_name: "TIFF".into(),
            extensions: vec!["tiff".into(), "tif".into()],
            supports_quality: false,
            supports_lossless: true,
            supports_exif: true,
        },
        FormatInfo {
            format: ImageFormat::Gif,
            display_name: "GIF".into(),
            extensions: vec!["gif".into()],
            supports_quality: false,
            supports_lossless: true,
            supports_exif: false,
        },
        FormatInfo {
            format: ImageFormat::Ico,
            display_name: "ICO".into(),
            extensions: vec!["ico".into()],
            supports_quality: false,
            supports_lossless: true,
            supports_exif: false,
        },
    ]
}
