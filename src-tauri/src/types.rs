use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ImageFormat {
    Jpeg,
    Png,
    Webp,
    Heic,
    Avif,
    Bmp,
    Tiff,
    Gif,
    Ico,
}

impl ImageFormat {
    pub fn extension(&self) -> &'static str {
        match self {
            Self::Jpeg => "jpg",
            Self::Png => "png",
            Self::Webp => "webp",
            Self::Heic => "heic",
            Self::Avif => "avif",
            Self::Bmp => "bmp",
            Self::Tiff => "tiff",
            Self::Gif => "gif",
            Self::Ico => "ico",
        }
    }

    pub fn from_extension(ext: &str) -> Option<Self> {
        match ext.to_lowercase().as_str() {
            "jpg" | "jpeg" => Some(Self::Jpeg),
            "png" => Some(Self::Png),
            "webp" => Some(Self::Webp),
            "heic" | "heif" => Some(Self::Heic),
            "avif" => Some(Self::Avif),
            "bmp" => Some(Self::Bmp),
            "tiff" | "tif" => Some(Self::Tiff),
            "gif" => Some(Self::Gif),
            "ico" => Some(Self::Ico),
            _ => None,
        }
    }

    pub fn supports_quality(&self) -> bool {
        matches!(self, Self::Jpeg | Self::Webp | Self::Avif | Self::Heic)
    }

    pub fn supports_exif(&self) -> bool {
        matches!(
            self,
            Self::Jpeg | Self::Png | Self::Webp | Self::Tiff | Self::Heic | Self::Avif
        )
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EncodingOptions {
    pub format: ImageFormat,
    pub quality: Option<u8>,
    pub preserve_metadata: bool,
    pub resize_width: Option<u32>,
    pub resize_height: Option<u32>,
    pub aspect_ratio: Option<AspectRatio>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum AspectRatio {
    #[serde(rename = "16:9")]
    R16x9,
    #[serde(rename = "4:3")]
    R4x3,
    #[serde(rename = "1:1")]
    R1x1,
    #[serde(rename = "3:2")]
    R3x2,
    #[serde(rename = "9:16")]
    R9x16,
    #[serde(rename = "3:4")]
    R3x4,
    #[serde(rename = "2:3")]
    R2x3,
}

impl AspectRatio {
    pub fn as_ratio(self) -> (u32, u32) {
        match self {
            Self::R16x9 => (16, 9),
            Self::R4x3 => (4, 3),
            Self::R1x1 => (1, 1),
            Self::R3x2 => (3, 2),
            Self::R9x16 => (9, 16),
            Self::R3x4 => (3, 4),
            Self::R2x3 => (2, 3),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageInfo {
    pub path: String,
    pub file_name: String,
    pub format: ImageFormat,
    pub width: u32,
    pub height: u32,
    pub file_size_bytes: u64,
    pub has_exif: bool,
    pub color_space: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConversionRequest {
    pub input_paths: Vec<String>,
    pub output_directory: String,
    pub options: EncodingOptions,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConversionResult {
    pub total: usize,
    pub succeeded: usize,
    pub failed: usize,
    pub results: Vec<FileConversionResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileConversionResult {
    pub input_path: String,
    pub output_path: Option<String>,
    pub success: bool,
    pub error: Option<String>,
    pub output_size_bytes: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConversionProgress {
    pub current_index: usize,
    pub total_files: usize,
    pub current_file: String,
    pub stage: ProcessingStage,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ProcessingStage {
    Decoding,
    Converting,
    Encoding,
    WritingMetadata,
    Complete,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ThumbnailResponse {
    pub data_base64: String,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FormatInfo {
    pub format: ImageFormat,
    pub display_name: String,
    pub extensions: Vec<String>,
    pub supports_quality: bool,
    pub supports_lossless: bool,
    pub supports_exif: bool,
}
