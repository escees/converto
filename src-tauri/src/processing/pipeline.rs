use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicUsize, Ordering};

use image::DynamicImage;
use rayon::prelude::*;

use crate::error::Result;
use crate::processing::{decoder, encoder, metadata};
use crate::types::*;

/// Crop image to the target aspect ratio (centered crop).
fn apply_aspect_ratio(img: DynamicImage, ratio: AspectRatio) -> DynamicImage {
    let (rw, rh) = ratio.as_ratio();
    let (w, h) = (img.width(), img.height());

    // Calculate the largest centered crop with the target ratio
    let target_w = std::cmp::min(w, (h as u64 * rw as u64 / rh as u64) as u32);
    let target_h = std::cmp::min(h, (w as u64 * rh as u64 / rw as u64) as u32);

    if target_w == w && target_h == h {
        return img;
    }

    let x = (w - target_w) / 2;
    let y = (h - target_h) / 2;
    img.crop_imm(x, y, target_w, target_h)
}

/// Resize image to the given dimensions (fit within bounds, preserving aspect ratio).
fn apply_resize(img: DynamicImage, width: u32, height: u32) -> DynamicImage {
    img.resize(width, height, image::imageops::FilterType::Lanczos3)
}

/// Process a single image through the full pipeline:
/// decode → crop → resize → encode → (optionally preserve EXIF)
pub fn convert_single(
    input_path: &Path,
    output_dir: &Path,
    options: &EncodingOptions,
    progress_callback: &dyn Fn(ProcessingStage),
) -> Result<FileConversionResult> {
    let input_str = input_path.display().to_string();

    // Build output path
    let stem = input_path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("output");
    let output_path = output_dir.join(format!("{}.{}", stem, options.format.extension()));
    let output_path = deduplicate_path(&output_path);

    // Stage 1: Read EXIF from source before decoding
    let exif_data = if options.preserve_metadata {
        metadata::read_exif_bytes(input_path)?
    } else {
        None
    };

    // Stage 2: Decode
    progress_callback(ProcessingStage::Decoding);
    let mut img = decoder::decode_image(input_path)?;

    // Stage 3: Apply aspect ratio crop (if requested)
    if let Some(ratio) = options.aspect_ratio {
        progress_callback(ProcessingStage::Converting);
        img = apply_aspect_ratio(img, ratio);
    }

    // Stage 4: Resize (if requested)
    if let (Some(w), Some(h)) = (options.resize_width, options.resize_height) {
        if w > 0 && h > 0 {
            progress_callback(ProcessingStage::Converting);
            img = apply_resize(img, w, h);
        }
    }

    // Stage 5: Encode to target format
    progress_callback(ProcessingStage::Encoding);
    encoder::encode_image(&img, &output_path, options)?;

    // Stage 4: Write EXIF to output if preserving
    if let Some(ref exif_bytes) = exif_data {
        progress_callback(ProcessingStage::WritingMetadata);
        if options.format.supports_exif() {
            let _ = metadata::write_exif_bytes(&output_path, exif_bytes);
        }
    }

    progress_callback(ProcessingStage::Complete);

    let output_size = std::fs::metadata(&output_path).map(|m| m.len()).ok();

    Ok(FileConversionResult {
        input_path: input_str,
        output_path: Some(output_path.display().to_string()),
        success: true,
        error: None,
        output_size_bytes: output_size,
    })
}

/// Process a batch of images in parallel using rayon with progress reporting.
pub fn convert_batch(
    request: &ConversionRequest,
    progress_callback: impl Fn(ConversionProgress) + Send + Sync,
) -> ConversionResult {
    let output_dir = Path::new(&request.output_directory);
    let total = request.input_paths.len();
    let completed_count = AtomicUsize::new(0);

    let results: Vec<FileConversionResult> = request
        .input_paths
        .par_iter()
        .map(|input_path_str| {
            let input_path = Path::new(input_path_str);
            let file_name = input_path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("unknown")
                .to_string();

            let done = completed_count.load(Ordering::Relaxed);
            let stage_callback = |stage: ProcessingStage| {
                progress_callback(ConversionProgress {
                    current_index: done,
                    total_files: total,
                    current_file: file_name.clone(),
                    stage,
                });
            };

            match convert_single(input_path, output_dir, &request.options, &stage_callback) {
                Ok(result) => {
                    completed_count.fetch_add(1, Ordering::Relaxed);
                    result
                }
                Err(err) => {
                    completed_count.fetch_add(1, Ordering::Relaxed);
                    progress_callback(ConversionProgress {
                        current_index: completed_count.load(Ordering::Relaxed),
                        total_files: total,
                        current_file: file_name,
                        stage: ProcessingStage::Failed,
                    });
                    FileConversionResult {
                        input_path: input_path_str.clone(),
                        output_path: None,
                        success: false,
                        error: Some(err.to_string()),
                        output_size_bytes: None,
                    }
                }
            }
        })
        .collect();

    let succeeded = results.iter().filter(|r| r.success).count();
    let failed = results.iter().filter(|r| !r.success).count();

    ConversionResult {
        total,
        succeeded,
        failed,
        results,
    }
}

fn deduplicate_path(path: &Path) -> PathBuf {
    if !path.exists() {
        return path.to_path_buf();
    }

    let stem = path.file_stem().and_then(|s| s.to_str()).unwrap_or("file");
    let ext = path.extension().and_then(|s| s.to_str()).unwrap_or("");
    let parent = path.parent().unwrap_or(Path::new("."));

    let mut counter = 1u32;
    loop {
        let candidate = parent.join(format!("{}_{}.{}", stem, counter, ext));
        if !candidate.exists() {
            return candidate;
        }
        counter += 1;
    }
}
