use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ConvertoError {
    #[error("Unsupported format: {0}")]
    UnsupportedFormat(String),

    #[error("Decode error for '{path}': {source}")]
    DecodeError {
        path: String,
        source: Box<dyn std::error::Error + Send + Sync>,
    },

    #[error("Encode error for '{path}': {source}")]
    EncodeError {
        path: String,
        source: Box<dyn std::error::Error + Send + Sync>,
    },

    #[error("Metadata error: {0}")]
    MetadataError(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("File not found: {0}")]
    FileNotFound(String),
}

/// Serializable error envelope for Tauri IPC.
#[derive(Debug, Serialize)]
pub struct CommandError {
    pub code: String,
    pub message: String,
}

impl From<ConvertoError> for CommandError {
    fn from(err: ConvertoError) -> Self {
        let code = match &err {
            ConvertoError::UnsupportedFormat(_) => "UNSUPPORTED_FORMAT",
            ConvertoError::DecodeError { .. } => "DECODE_ERROR",
            ConvertoError::EncodeError { .. } => "ENCODE_ERROR",
            ConvertoError::MetadataError(_) => "METADATA_ERROR",
            ConvertoError::IoError(_) => "IO_ERROR",
            ConvertoError::FileNotFound(_) => "FILE_NOT_FOUND",
        };
        CommandError {
            code: code.to_string(),
            message: err.to_string(),
        }
    }
}

impl std::fmt::Display for CommandError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "[{}] {}", self.code, self.message)
    }
}

pub type Result<T> = std::result::Result<T, ConvertoError>;
pub type CmdResult<T> = std::result::Result<T, CommandError>;
