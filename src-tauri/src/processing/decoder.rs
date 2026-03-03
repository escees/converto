use image::DynamicImage;
use std::path::Path;

use crate::error::{ConvertoError, Result};
use crate::types::ImageFormat;

/// Decodes any supported image file into a DynamicImage.
/// JPEG uses turbojpeg (SIMD-accelerated), HEIC uses libheif-rs, rest uses `image` crate.
pub fn decode_image(path: &Path) -> Result<DynamicImage> {
    let format = detect_format(path)?;

    match format {
        ImageFormat::Jpeg => decode_jpeg_turbo(path),
        ImageFormat::Heic => decode_heic(path),
        _ => decode_standard(path),
    }
}

fn detect_format(path: &Path) -> Result<ImageFormat> {
    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .ok_or_else(|| ConvertoError::UnsupportedFormat("File has no extension".into()))?;

    ImageFormat::from_extension(ext)
        .ok_or_else(|| ConvertoError::UnsupportedFormat(format!(".{ext}")))
}

fn decode_jpeg_turbo(path: &Path) -> Result<DynamicImage> {
    let jpeg_data = std::fs::read(path).map_err(|e| ConvertoError::DecodeError {
        path: path.display().to_string(),
        source: Box::new(e),
    })?;

    let mut decompressor =
        turbojpeg::Decompressor::new().map_err(|e| ConvertoError::DecodeError {
            path: path.display().to_string(),
            source: Box::new(e),
        })?;

    let header = decompressor
        .read_header(&jpeg_data)
        .map_err(|e| ConvertoError::DecodeError {
            path: path.display().to_string(),
            source: Box::new(e),
        })?;

    let width = header.width;
    let height = header.height;
    let pitch = width * 3;
    let mut pixels = vec![0u8; height * pitch];

    let image_buf = turbojpeg::Image {
        pixels: pixels.as_mut_slice(),
        width,
        height,
        pitch,
        format: turbojpeg::PixelFormat::RGB,
    };

    decompressor
        .decompress(&jpeg_data, image_buf)
        .map_err(|e| ConvertoError::DecodeError {
            path: path.display().to_string(),
            source: Box::new(e),
        })?;

    image::RgbImage::from_raw(width as u32, height as u32, pixels)
        .map(DynamicImage::ImageRgb8)
        .ok_or_else(|| ConvertoError::DecodeError {
            path: path.display().to_string(),
            source: "Failed to construct RgbImage from turbojpeg output".into(),
        })
}

fn decode_heic(path: &Path) -> Result<DynamicImage> {
    use libheif_rs::{ColorSpace, HeifContext, LibHeif, RgbChroma};

    let lib_heif = LibHeif::new();

    let path_str = path.to_str().ok_or_else(|| ConvertoError::DecodeError {
        path: path.display().to_string(),
        source: "Path contains invalid UTF-8".into(),
    })?;

    let ctx = HeifContext::read_from_file(path_str).map_err(|e| {
        ConvertoError::DecodeError {
            path: path.display().to_string(),
            source: Box::new(e),
        }
    })?;

    let handle = ctx.primary_image_handle().map_err(|e| {
        ConvertoError::DecodeError {
            path: path.display().to_string(),
            source: Box::new(e),
        }
    })?;

    let has_alpha = handle.has_alpha_channel();
    let width = handle.width();
    let height = handle.height();

    let color_space = if has_alpha {
        ColorSpace::Rgb(RgbChroma::Rgba)
    } else {
        ColorSpace::Rgb(RgbChroma::Rgb)
    };

    let heif_image = lib_heif
        .decode(&handle, color_space, None)
        .map_err(|e| ConvertoError::DecodeError {
            path: path.display().to_string(),
            source: Box::new(e),
        })?;

    let plane = heif_image
        .planes()
        .interleaved
        .ok_or_else(|| ConvertoError::DecodeError {
            path: path.display().to_string(),
            source: "No interleaved plane in HEIC image".into(),
        })?;

    let stride = plane.stride;
    let data = plane.data;
    let channels: u32 = if has_alpha { 4 } else { 3 };

    let mut pixel_data = Vec::with_capacity((width * height * channels) as usize);
    for y in 0..height as usize {
        let row_start = y * stride;
        let row_end = row_start + (width as usize * channels as usize);
        pixel_data.extend_from_slice(&data[row_start..row_end]);
    }

    if has_alpha {
        let rgba_image = image::RgbaImage::from_raw(width, height, pixel_data).ok_or_else(
            || ConvertoError::DecodeError {
                path: path.display().to_string(),
                source: "Failed to construct RgbaImage from HEIC data".into(),
            },
        )?;
        Ok(DynamicImage::ImageRgba8(rgba_image))
    } else {
        let rgb_image = image::RgbImage::from_raw(width, height, pixel_data).ok_or_else(
            || ConvertoError::DecodeError {
                path: path.display().to_string(),
                source: "Failed to construct RgbImage from HEIC data".into(),
            },
        )?;
        Ok(DynamicImage::ImageRgb8(rgb_image))
    }
}

fn decode_standard(path: &Path) -> Result<DynamicImage> {
    image::open(path).map_err(|e| ConvertoError::DecodeError {
        path: path.display().to_string(),
        source: Box::new(e),
    })
}
