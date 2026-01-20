use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Error kinds for grep-wasm operations
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "details")]
pub enum ErrorKind {
    /// Failed to parse JSON input
    ParseError {
        message: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        input_preview: Option<String>,
    },
    /// Invalid regex pattern
    InvalidPattern {
        message: String,
        pattern: String,
    },
    /// Search operation failed
    SearchError {
        message: String,
    },
    /// Invalid configuration
    InvalidConfiguration {
        field: String,
        message: String,
    },
    /// Memory-related error
    MemoryError {
        message: String,
    },
    /// File operation error
    FileError {
        message: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        path: Option<String>,
    },
    /// Serialization error
    SerializationError {
        message: String,
    },
}

/// Structured error type for grep-wasm
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RipgrepError {
    /// The kind of error
    #[serde(flatten)]
    pub kind: ErrorKind,
    /// Human-readable error message
    pub message: String,
}

impl RipgrepError {
    /// Create a new error
    pub fn new(kind: ErrorKind, message: String) -> Self {
        Self { kind, message }
    }

    /// Create a parse error
    pub fn parse_error(message: String, input: Option<&str>) -> Self {
        let input_preview = input.map(|s| {
            let preview: String = s.chars().take(100).collect();
            if s.len() > 100 {
                format!("{}...", preview)
            } else {
                preview
            }
        });

        Self {
            kind: ErrorKind::ParseError {
                message: message.clone(),
                input_preview,
            },
            message,
        }
    }

    /// Create an invalid pattern error
    pub fn invalid_pattern(pattern: String, message: String) -> Self {
        Self {
            kind: ErrorKind::InvalidPattern {
                message: message.clone(),
                pattern,
            },
            message,
        }
    }

    /// Create a search error
    pub fn search_error(message: String) -> Self {
        Self {
            kind: ErrorKind::SearchError {
                message: message.clone(),
            },
            message,
        }
    }

    /// Create an invalid configuration error
    pub fn invalid_config(field: String, message: String) -> Self {
        Self {
            kind: ErrorKind::InvalidConfiguration {
                field,
                message: message.clone(),
            },
            message,
        }
    }

    /// Create a file error
    pub fn file_error(message: String, path: Option<String>) -> Self {
        Self {
            kind: ErrorKind::FileError {
                message: message.clone(),
                path,
            },
            message,
        }
    }

    /// Create a serialization error
    pub fn serialization_error(message: String) -> Self {
        Self {
            kind: ErrorKind::SerializationError {
                message: message.clone(),
            },
            message,
        }
    }

    /// Convert to JsValue for WASM boundary
    pub fn to_js_error(&self) -> JsValue {
        match serde_json::to_string(self) {
            Ok(json) => JsValue::from_str(&json),
            Err(_) => {
                // Fallback to simple string error if serialization fails
                JsValue::from_str(&format!("Error: {}", self.message))
            }
        }
    }
}

impl std::fmt::Display for RipgrepError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl std::error::Error for RipgrepError {}

/// Helper macro to create errors
#[macro_export]
macro_rules! rg_error {
    (parse, $msg:expr) => {
        $crate::errors::RipgrepError::parse_error($msg.to_string(), None)
    };
    (parse, $msg:expr, $input:expr) => {
        $crate::errors::RipgrepError::parse_error($msg.to_string(), Some($input))
    };
    (pattern, $pattern:expr, $msg:expr) => {
        $crate::errors::RipgrepError::invalid_pattern($pattern.to_string(), $msg.to_string())
    };
    (search, $msg:expr) => {
        $crate::errors::RipgrepError::search_error($msg.to_string())
    };
    (config, $field:expr, $msg:expr) => {
        $crate::errors::RipgrepError::invalid_config($field.to_string(), $msg.to_string())
    };
    (file, $msg:expr) => {
        $crate::errors::RipgrepError::file_error($msg.to_string(), None)
    };
    (file, $msg:expr, $path:expr) => {
        $crate::errors::RipgrepError::file_error($msg.to_string(), Some($path.to_string()))
    };
    (serialization, $msg:expr) => {
        $crate::errors::RipgrepError::serialization_error($msg.to_string())
    };
}
