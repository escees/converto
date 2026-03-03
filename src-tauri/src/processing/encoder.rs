use image::DynamicImage;
use std::borrow::Cow;
use std::path::Path;

use crate::error::{ConvertoError, Result};
use crate::types::{EncodingOptions, ImageFormat};

/// Encode a DynamicImage to the target format and write to disk.
pub fn encode_image(img: &DynamicImage, output_path: &Path, options: &EncodingOptions) -> Result<()> {
    match options.format {
        ImageFormat::Heic => encode_heic(img, output_path, options),
        ImageFormat::Jpeg => encode_jpeg(img, output_path, options),
        ImageFormat::Webp => encode_webp(img, output_path, options),
        ImageFormat::Avif => encode_avif(img, output_path, options),
        _ => encode_standard(img, output_path, options),
    }
}

/// Borrow RGB pixels zero-copy when the image is already Rgb8, otherwise convert.
fn rgb_pixels(img: &DynamicImage) -> (Cow<'_, [u8]>, u32, u32) {
    let (w, h) = (img.width(), img.height());
    match img {
        DynamicImage::ImageRgb8(buf) => (Cow::Borrowed(buf.as_raw()), w, h),
        other => {
            let rgb = other.to_rgb8();
            (Cow::Owned(rgb.into_raw()), w, h)
        }
    }
}

/// Borrow RGBA pixels zero-copy when the image is already Rgba8, otherwise convert.
fn rgba_pixels(img: &DynamicImage) -> (Cow<'_, [u8]>, u32, u32) {
    let (w, h) = (img.width(), img.height());
    match img {
        DynamicImage::ImageRgba8(buf) => (Cow::Borrowed(buf.as_raw()), w, h),
        other => {
            let rgba = other.to_rgba8();
            (Cow::Owned(rgba.into_raw()), w, h)
        }
    }
}

fn encode_heic(img: &DynamicImage, output_path: &Path, options: &EncodingOptions) -> Result<()> {
    use libheif_rs::{
        Channel, ColorSpace, CompressionFormat, EncoderQuality, HeifContext,
        Image as HeifImage, LibHeif, RgbChroma,
    };

    let lib_heif = LibHeif::new();

    let has_alpha = img.color().has_alpha();

    let (chroma, channels, raw_data, width, height) = if has_alpha {
        let (data, w, h) = rgba_pixels(img);
        (RgbChroma::Rgba, 4, data, w, h)
    } else {
        let (data, w, h) = rgb_pixels(img);
        (RgbChroma::Rgb, 3, data, w, h)
    };

    let mut heif_image =
        HeifImage::new(width, height, ColorSpace::Rgb(chroma)).map_err(|e| {
            ConvertoError::EncodeError {
                path: output_path.display().to_string(),
                source: Box::new(e),
            }
        })?;

    heif_image
        .create_plane(Channel::Interleaved, width, height, 8)
        .map_err(|e| ConvertoError::EncodeError {
            path: output_path.display().to_string(),
            source: Box::new(e),
        })?;

    {
        let plane = heif_image.planes_mut().interleaved.unwrap();
        let stride = plane.stride;
        let dest = plane.data;
        for y in 0..height as usize {
            let src_offset = y * (width as usize * channels);
            let dst_offset = y * stride;
            dest[dst_offset..dst_offset + width as usize * channels]
                .copy_from_slice(&raw_data[src_offset..src_offset + width as usize * channels]);
        }
    }

    let mut ctx = HeifContext::new().map_err(|e| ConvertoError::EncodeError {
        path: output_path.display().to_string(),
        source: Box::new(e),
    })?;

    let mut encoder = lib_heif
        .encoder_for_format(CompressionFormat::Hevc)
        .map_err(|e| ConvertoError::EncodeError {
            path: output_path.display().to_string(),
            source: Box::new(e),
        })?;

    let quality = options.quality.unwrap_or(80);
    encoder
        .set_quality(EncoderQuality::Lossy(quality))
        .map_err(|e| ConvertoError::EncodeError {
            path: output_path.display().to_string(),
            source: Box::new(e),
        })?;

    ctx.encode_image(&heif_image, &mut encoder, None)
        .map_err(|e| ConvertoError::EncodeError {
            path: output_path.display().to_string(),
            source: Box::new(e),
        })?;

    let out_str = output_path.to_str().ok_or_else(|| ConvertoError::EncodeError {
        path: output_path.display().to_string(),
        source: "Output path contains invalid UTF-8".into(),
    })?;

    ctx.write_to_file(out_str)
        .map_err(|e| ConvertoError::EncodeError {
            path: output_path.display().to_string(),
            source: Box::new(e),
        })?;

    Ok(())
}

fn encode_jpeg(img: &DynamicImage, output_path: &Path, options: &EncodingOptions) -> Result<()> {
    let (raw, w, h) = rgb_pixels(img);
    let quality = options.quality.unwrap_or(85) as i32;

    let image_buf = turbojpeg::Image {
        pixels: raw.as_ref(),
        width: w as usize,
        height: h as usize,
        pitch: w as usize * 3,
        format: turbojpeg::PixelFormat::RGB,
    };

    let mut compressor =
        turbojpeg::Compressor::new().map_err(|e| ConvertoError::EncodeError {
            path: output_path.display().to_string(),
            source: Box::new(e),
        })?;
    compressor
        .set_quality(quality)
        .map_err(|e| ConvertoError::EncodeError {
            path: output_path.display().to_string(),
            source: Box::new(e),
        })?;

    let jpeg_data = compressor
        .compress_to_vec(image_buf)
        .map_err(|e| ConvertoError::EncodeError {
            path: output_path.display().to_string(),
            source: Box::new(e),
        })?;

    std::fs::write(output_path, jpeg_data).map_err(|e| ConvertoError::EncodeError {
        path: output_path.display().to_string(),
        source: Box::new(e),
    })?;

    Ok(())
}

fn encode_webp(img: &DynamicImage, output_path: &Path, options: &EncodingOptions) -> Result<()> {
    let quality = options.quality.unwrap_or(80) as f32;
    let (w, h) = (img.width(), img.height());

    let webp_data = if img.color().has_alpha() {
        let (rgba, _, _) = rgba_pixels(img);
        let encoder = webp::Encoder::from_rgba(&rgba, w, h);
        encoder.encode(quality)
    } else {
        let (rgb, _, _) = rgb_pixels(img);
        let encoder = webp::Encoder::from_rgb(&rgb, w, h);
        encoder.encode(quality)
    };

    std::fs::write(output_path, &*webp_data).map_err(|e| ConvertoError::EncodeError {
        path: output_path.display().to_string(),
        source: Box::new(e),
    })?;

    Ok(())
}

fn encode_avif(img: &DynamicImage, output_path: &Path, options: &EncodingOptions) -> Result<()> {
    let quality = options.quality.unwrap_or(70) as f32;
    let (rgba_data, w, h) = rgba_pixels(img);

    let pixels: &[rgb::RGBA8] = bytemuck_cast_rgba(&rgba_data);
    let img_ref = imgref::Img::new(pixels, w as usize, h as usize);

    let res = ravif::Encoder::new()
        .with_quality(quality)
        .with_speed(6)
        .encode_rgba(img_ref)
        .map_err(|e| ConvertoError::EncodeError {
            path: output_path.display().to_string(),
            source: e.to_string().into(),
        })?;

    std::fs::write(output_path, res.avif_file).map_err(|e| ConvertoError::EncodeError {
        path: output_path.display().to_string(),
        source: Box::new(e),
    })?;

    Ok(())
}

/// Safely reinterpret a &[u8] (with length divisible by 4) as &[rgb::RGBA8].
fn bytemuck_cast_rgba(bytes: &[u8]) -> &[rgb::RGBA8] {
    assert!(bytes.len() % 4 == 0, "byte length must be divisible by 4");
    // SAFETY: rgb::RGBA8 is repr(C) with 4 u8 fields, same layout as [u8; 4]
    unsafe { std::slice::from_raw_parts(bytes.as_ptr() as *const rgb::RGBA8, bytes.len() / 4) }
}

fn encode_standard(
    img: &DynamicImage,
    output_path: &Path,
    options: &EncodingOptions,
) -> Result<()> {
    let image_format = match options.format {
        ImageFormat::Png => image::ImageFormat::Png,
        ImageFormat::Bmp => image::ImageFormat::Bmp,
        ImageFormat::Tiff => image::ImageFormat::Tiff,
        ImageFormat::Gif => image::ImageFormat::Gif,
        ImageFormat::Ico => image::ImageFormat::Ico,
        _ => unreachable!("HEIC, JPEG, WebP, and AVIF handled separately"),
    };

    img.save_with_format(output_path, image_format)
        .map_err(|e| ConvertoError::EncodeError {
            path: output_path.display().to_string(),
            source: Box::new(e),
        })?;

    Ok(())
}
