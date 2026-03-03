use std::path::Path;

use crate::error::Result;

/// Read raw EXIF bytes from a source image.
/// Returns None if the file has no EXIF data or the format does not support it.
pub fn read_exif_bytes(path: &Path) -> Result<Option<Vec<u8>>> {
    // Use the rexif-style approach: read the raw file and extract the EXIF APP1 segment.
    // For now, we use a simple approach that works for JPEG files.
    let data = std::fs::read(path)?;

    // Look for EXIF marker in JPEG (FFE1) or try to extract from other formats
    if let Some(exif_data) = extract_jpeg_exif(&data) {
        return Ok(Some(exif_data));
    }

    Ok(None)
}

/// Write EXIF bytes into a JPEG destination file.
pub fn write_exif_bytes(path: &Path, exif_bytes: &[u8]) -> Result<()> {
    let data = std::fs::read(path)?;

    // Only JPEG writing is supported for now
    if data.len() >= 2 && data[0] == 0xFF && data[1] == 0xD8 {
        let new_data = inject_jpeg_exif(&data, exif_bytes);
        std::fs::write(path, new_data)?;
    }

    Ok(())
}

/// Check if a file contains EXIF data.
pub fn has_exif(path: &Path) -> bool {
    read_exif_bytes(path)
        .map(|opt| opt.is_some())
        .unwrap_or(false)
}

/// Extract EXIF APP1 segment from JPEG data.
fn extract_jpeg_exif(data: &[u8]) -> Option<Vec<u8>> {
    if data.len() < 4 || data[0] != 0xFF || data[1] != 0xD8 {
        return None;
    }

    let mut pos = 2;
    while pos + 4 < data.len() {
        if data[pos] != 0xFF {
            break;
        }
        let marker = data[pos + 1];
        let length = u16::from_be_bytes([data[pos + 2], data[pos + 3]]) as usize;

        // APP1 marker with Exif header
        if marker == 0xE1
            && length > 8
            && pos + 4 + length <= data.len()
            && &data[pos + 4..pos + 8] == b"Exif"
        {
            return Some(data[pos..pos + 2 + length].to_vec());
        }

        pos += 2 + length;
    }

    None
}

/// Inject an EXIF APP1 segment into JPEG data right after the SOI marker.
/// Scans through all markers to remove any existing EXIF APP1 segments.
fn inject_jpeg_exif(data: &[u8], exif_segment: &[u8]) -> Vec<u8> {
    let mut result = Vec::with_capacity(data.len() + exif_segment.len());
    // SOI marker
    result.extend_from_slice(&data[..2]);
    // Insert new EXIF segment
    result.extend_from_slice(exif_segment);

    // Scan through original markers, copying all except existing EXIF APP1
    let mut pos = 2;
    while pos + 4 < data.len() && data[pos] == 0xFF {
        let marker = data[pos + 1];

        // SOS (Start of Scan) means we've hit the image data — copy everything remaining
        if marker == 0xDA {
            break;
        }

        let length = u16::from_be_bytes([data[pos + 2], data[pos + 3]]) as usize;
        if pos + 2 + length > data.len() {
            break;
        }

        if marker == 0xE1
            && length > 8
            && pos + 4 + length <= data.len()
            && &data[pos + 4..pos + 8] == b"Exif"
        {
            // Skip existing EXIF segment (we already injected the new one)
            pos += 2 + length;
            continue;
        }

        // Copy this non-EXIF marker segment
        result.extend_from_slice(&data[pos..pos + 2 + length]);
        pos += 2 + length;
    }

    // Copy remaining data (SOS + image data)
    result.extend_from_slice(&data[pos..]);
    result
}
