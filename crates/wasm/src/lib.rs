mod errors;

use grep_regex::RegexMatcher;
use grep_searcher::{sinks::UTF8, Searcher, SearcherBuilder};
use globset::{Glob, GlobSetBuilder};
use ignore::{gitignore::Gitignore, gitignore::GitignoreBuilder, overrides::Override, overrides::OverrideBuilder};
use serde::{Deserialize, Serialize};
use serde_json;
use std::cell::RefCell;
use std::path::Path;
use wasm_bindgen::prelude::*;

pub use errors::{ErrorKind, RipgrepError};

/// A file entry for searching
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    /// The file path
    pub path: String,
    /// The file content as bytes (will be converted to string)
    pub content: String,
}

/// A match result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchResult {
    /// The file path where the match was found
    pub path: String,
    /// The line number (1-indexed)
    pub line_number: u64,
    /// The matched line content
    pub line: String,
    /// The byte offset of the match start
    pub byte_offset: u64,
}

/// Output format for search results
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum OutputFormat {
    /// Return detailed search results with matches
    Detailed,
    /// Return only file paths containing matches
    FilesOnly,
}

impl Default for OutputFormat {
    fn default() -> Self {
        OutputFormat::Detailed
    }
}

/// Search options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchOptions {
    /// Case insensitive search
    #[serde(default)]
    pub case_insensitive: bool,
    /// Fixed strings (disable regex)
    #[serde(default)]
    pub fixed_strings: bool,
    /// Word boundary matching
    #[serde(default)]
    pub word_boundary: bool,
    /// Line numbers in output
    #[serde(default = "default_true")]
    pub line_numbers: bool,
    /// Output format: "detailed" returns full results, "files_only" returns just file paths
    #[serde(default)]
    pub output_format: OutputFormat,
}

fn default_true() -> bool {
    true
}

impl Default for SearchOptions {
    fn default() -> Self {
        Self {
            case_insensitive: false,
            fixed_strings: false,
            word_boundary: false,
            line_numbers: true,
            output_format: OutputFormat::Detailed,
        }
    }
}

/// Search result containing all matches
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    /// All matches found
    pub matches: Vec<MatchResult>,
    /// Total number of matches
    pub total_matches: usize,
    /// Number of files with matches
    pub files_with_matches: usize,
}

/// Gitignore file entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitignoreFile {
    /// The directory path where this .gitignore file is located (relative to root_path)
    pub path: String,
    /// The content of the .gitignore file
    pub content: String,
}

/// Directory search configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DirectorySearchConfig {
    /// Root directory path to search
    pub root_path: String,
    /// Maximum search depth (None = unlimited)
    #[serde(default)]
    pub max_depth: Option<usize>,
    /// File type filters (e.g., ["*.js", "*.ts"])
    #[serde(default)]
    pub file_types: Vec<String>,
    /// Ignore patterns (e.g., ["node_modules", "*.log"])
    #[serde(default)]
    pub ignore_patterns: Vec<String>,
    /// Whether to respect .gitignore files
    #[serde(default = "default_true")]
    pub respect_gitignore: bool,
    /// Whether to search hidden files
    #[serde(default)]
    pub include_hidden: bool,
    /// .gitignore file contents (from JavaScript side)
    #[serde(default)]
    pub gitignore_files: Vec<GitignoreFile>,
    /// Override patterns (whitelist, similar to --include)
    #[serde(default)]
    pub override_patterns: Vec<String>,
    /// Exclude patterns (similar to --exclude)
    #[serde(default)]
    pub exclude_patterns: Vec<String>,
}

/// File path entry (before reading content)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilePathEntry {
    /// Full file path
    pub path: String,
    /// Relative path from root_path
    pub relative_path: String,
    /// Depth from root (0 = root level)
    pub depth: usize,
}

/// Internal search function that works with parsed data structures
fn search_internal(
    pattern: &str,
    file_entries: &[FileEntry],
    search_options: &SearchOptions,
) -> Result<SearchResult, RipgrepError> {
    // Build regex pattern
    let mut regex_pattern = pattern.to_string();
    
    if search_options.fixed_strings {
        regex_pattern = regex::escape(&regex_pattern);
    }
    
    if search_options.word_boundary {
        regex_pattern = format!(r"\b{}\b", regex_pattern);
    }
    
    if search_options.case_insensitive {
        regex_pattern = format!(r"(?i){}", regex_pattern);
    }

    // Create matcher
    let matcher = RegexMatcher::new(&regex_pattern)
        .map_err(|e| rg_error!(pattern, pattern, format!("Invalid regex pattern: {}", e)))?;

    // Build searcher
    let mut searcher = {
        let mut builder = SearcherBuilder::new();
        builder.line_number(search_options.line_numbers);
        builder.build()
    };

    // Collect all matches
    let mut all_matches = Vec::new();
    let mut files_with_matches = 0;

    for file_entry in file_entries {
        let file_matches = search_file(&matcher, &mut searcher, file_entry)?;
        
        if !file_matches.is_empty() {
            files_with_matches += 1;
            all_matches.extend(file_matches);
        }
    }

    Ok(SearchResult {
        total_matches: all_matches.len(),
        files_with_matches,
        matches: all_matches,
    })
}

/// Search for a pattern in a list of files
///
/// # Arguments
/// * `pattern` - The search pattern (regex or literal string)
/// * `files` - JSON string of array of FileEntry objects
/// * `options` - Optional JSON string of SearchOptions (pass null or empty string for default)
///
/// # Returns
/// JSON string of SearchResult or array of file paths (depending on output_format)
#[wasm_bindgen]
pub fn search(pattern: &str, files: &str, options: Option<String>) -> Result<String, JsValue> {
    // Parse files
    let file_entries: Vec<FileEntry> = serde_json::from_str(files)
        .map_err(|e| rg_error!(parse, format!("Failed to parse files: {}", e), files).to_js_error())?;

    // Parse options
    let search_options: SearchOptions = if let Some(opts_str) = options {
        if opts_str.is_empty() {
            SearchOptions::default()
        } else {
            serde_json::from_str(&opts_str)
                .map_err(|e| rg_error!(parse, format!("Failed to parse options: {}", e), &opts_str).to_js_error())?
        }
    } else {
        SearchOptions::default()
    };

    // Call internal search
    let result = search_internal(pattern, &file_entries, &search_options)
        .map_err(|e| e.to_js_error())?;

    // Return results based on output format
    match search_options.output_format {
        OutputFormat::FilesOnly => {
            // Extract unique file paths
            let mut file_paths: Vec<String> = result.matches
                .iter()
                .map(|m| m.path.clone())
                .collect::<std::collections::HashSet<_>>()
                .into_iter()
                .collect();
            file_paths.sort();
            serde_json::to_string(&file_paths)
                .map_err(|e| rg_error!(serialization, format!("Failed to serialize file paths: {}", e)).to_js_error())
        }
        OutputFormat::Detailed => {
            serde_json::to_string(&result)
                .map_err(|e| rg_error!(serialization, format!("Failed to serialize result: {}", e)).to_js_error())
        }
    }
}

/// Build gitignore matchers from configuration
fn build_gitignore_matchers(
    config: &DirectorySearchConfig,
) -> Result<Vec<Gitignore>, JsValue> {
    let mut matchers = Vec::new();
    
    for gitignore_file in &config.gitignore_files {
        let mut builder = GitignoreBuilder::new(&gitignore_file.path);
        for line in gitignore_file.content.lines() {
            // Skip empty lines and comments
            let trimmed = line.trim();
            if trimmed.is_empty() || trimmed.starts_with('#') {
                continue;
            }
            
            // Try to add the line, but don't fail on invalid lines
            if let Err(_e) = builder.add_line(None, line) {
                // Log error but continue processing other lines
                // In WASM, we can't easily log, so we'll just skip invalid lines
                continue;
            }
        }
        let gitignore = builder.build()
            .map_err(|e| JsValue::from_str(&format!("Failed to build gitignore: {}", e)))?;
        matchers.push(gitignore);
    }
    
    Ok(matchers)
}

/// Build override matcher from configuration
fn build_override_matcher(
    config: &DirectorySearchConfig,
    root_path: &Path,
) -> Result<Option<Override>, JsValue> {
    if config.override_patterns.is_empty() && config.exclude_patterns.is_empty() {
        return Ok(None);
    }
    
    let mut builder = OverrideBuilder::new(root_path);
    
    // Add include patterns (whitelist)
    for pattern in &config.override_patterns {
        builder.add(pattern)
            .map_err(|e| JsValue::from_str(&format!("Invalid override pattern '{}': {}", pattern, e)))?;
    }
    
    // Add exclude patterns (prefixed with !)
    for pattern in &config.exclude_patterns {
        let exclude_pattern = format!("!{}", pattern);
        builder.add(&exclude_pattern)
            .map_err(|e| JsValue::from_str(&format!("Invalid exclude pattern '{}': {}", pattern, e)))?;
    }
    
    Ok(Some(builder.build()
        .map_err(|e| JsValue::from_str(&format!("Failed to build override matcher: {}", e)))?))
}

/// Filter directory files based on configuration
///
/// This function filters a list of file paths based on directory search configuration,
/// including file type filters, ignore patterns, depth limits, and hidden file settings.
///
/// # Arguments
/// * `config` - JSON string of DirectorySearchConfig object
/// * `file_paths` - JSON string of array of file path strings
///
/// # Returns
/// JSON string of array of FilePathEntry objects (filtered and annotated with depth)
#[wasm_bindgen]
pub fn filter_directory_files(config: &str, file_paths: &str) -> Result<String, JsValue> {
    // Parse configuration
    let search_config: DirectorySearchConfig = serde_json::from_str(config)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse config: {}", e)))?;

    // Parse file paths
    let paths: Vec<String> = serde_json::from_str(file_paths)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse file paths: {}", e)))?;

    let root_path = Path::new(&search_config.root_path);

    // Build gitignore matchers
    let gitignore_matchers = if search_config.respect_gitignore && !search_config.gitignore_files.is_empty() {
        build_gitignore_matchers(&search_config)?
    } else {
        Vec::new()
    };

    // Build override matcher
    let override_matcher = build_override_matcher(&search_config, root_path)?;

    // Build file type glob set
    let file_type_matcher = if search_config.file_types.is_empty() {
        None
    } else {
        let mut builder = GlobSetBuilder::new();
        for pattern in &search_config.file_types {
            let glob = Glob::new(pattern)
                .map_err(|e| JsValue::from_str(&format!("Invalid file type pattern '{}': {}", pattern, e)))?;
            builder.add(glob);
        }
        Some(builder.build()
            .map_err(|e| JsValue::from_str(&format!("Failed to build file type matcher: {}", e)))?)
    };

    // Build ignore pattern glob set
    let ignore_matcher = if search_config.ignore_patterns.is_empty() {
        None
    } else {
        let mut builder = GlobSetBuilder::new();
        for pattern in &search_config.ignore_patterns {
            let glob = Glob::new(pattern)
                .map_err(|e| JsValue::from_str(&format!("Invalid ignore pattern '{}': {}", pattern, e)))?;
            builder.add(glob);
        }
        Some(builder.build()
            .map_err(|e| JsValue::from_str(&format!("Failed to build ignore matcher: {}", e)))?)
    };

    let mut filtered_entries = Vec::new();

    for file_path_str in paths {
        let file_path = Path::new(&file_path_str);

        // Calculate relative path and depth
        let relative_path = if file_path.is_absolute() && root_path.is_absolute() {
            file_path.strip_prefix(root_path)
                .unwrap_or(file_path)
                .to_string_lossy()
                .to_string()
        } else {
            file_path_str.clone()
        };

        // Calculate depth (count path separators in relative path)
        // Remove leading slash if present for depth calculation
        let path_for_depth = relative_path.trim_start_matches('/');
        let depth = if path_for_depth.is_empty() {
            0
        } else {
            path_for_depth.matches('/').count()
        };

        // Check depth limit
        if let Some(max_depth) = search_config.max_depth {
            if depth > max_depth {
                continue;
            }
        }

        // Check hidden files
        if !search_config.include_hidden {
            let file_name = file_path.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("");
            if file_name.starts_with('.') {
                continue;
            }
        }

        // Apply gitignore rules
        if !gitignore_matchers.is_empty() {
            let mut should_ignore = false;
            for gitignore in &gitignore_matchers {
                match gitignore.matched(&relative_path, false) {
                    ignore::Match::Ignore(_) => {
                        should_ignore = true;
                        break;
                    }
                    ignore::Match::Whitelist(_) => {
                        should_ignore = false;
                        break;
                    }
                    ignore::Match::None => {}
                }
            }
            if should_ignore {
                continue;
            }
        }

        // Apply override rules
        if let Some(ref override_matcher) = override_matcher {
            match override_matcher.matched(&relative_path, false) {
                ignore::Match::Ignore(_) => continue,
                ignore::Match::Whitelist(_) => {}
                ignore::Match::None => {
                    // If there are whitelist rules but current path doesn't match, ignore it
                    if override_matcher.num_whitelists() > 0 {
                        continue;
                    }
                }
            }
        }

        // Check file type filter
        if let Some(ref matcher) = file_type_matcher {
            if !matcher.is_match(&relative_path) {
                continue;
            }
        }

        // Check ignore patterns
        if let Some(ref matcher) = ignore_matcher {
            if matcher.is_match(&relative_path) {
                continue;
            }
        }

        filtered_entries.push(FilePathEntry {
            path: file_path_str,
            relative_path,
            depth,
        });
    }

    serde_json::to_string(&filtered_entries)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize: {}", e)))
}

/// Search for a pattern in a directory
///
/// This function searches for a pattern in files within a directory structure.
/// It applies directory configuration filters and returns detailed search results
/// including line numbers.
///
/// # Arguments
/// * `pattern` - The search pattern (regex or literal string)
/// * `config` - JSON string of DirectorySearchConfig object
/// * `files` - JSON string of array of FileEntry objects (files should be pre-filtered)
/// * `options` - Optional JSON string of SearchOptions (pass null for default)
///
/// # Returns
/// JSON string of SearchResult with matches including line numbers
///
/// # Example
/// ```javascript
/// const config = {
///   root_path: "/project",
///   max_depth: 5,
///   file_types: ["*.js", "*.ts"],
///   ignore_patterns: ["node_modules", "*.log"]
/// };
///
/// const files = [
///   { path: "/project/src/main.js", content: "function main() {}" }
/// ];
///
/// const result = search_directory(
///   "function",
///   JSON.stringify(config),
///   JSON.stringify(files),
///   JSON.stringify({ case_insensitive: true })
/// );
/// ```
#[wasm_bindgen]
pub fn search_directory(
    pattern: &str,
    config: &str,
    files: &str,
    options: Option<String>,
) -> Result<String, JsValue> {
    // Parse configuration
    let _search_config: DirectorySearchConfig = serde_json::from_str(config)
        .map_err(|e| rg_error!(parse, format!("Failed to parse config: {}", e), config).to_js_error())?;

    // Parse files
    let file_entries: Vec<FileEntry> = serde_json::from_str(files)
        .map_err(|e| rg_error!(parse, format!("Failed to parse files: {}", e), files).to_js_error())?;

    // Parse options
    let mut search_options: SearchOptions = if let Some(ref opts_str) = options {
        if opts_str.is_empty() {
            SearchOptions::default()
        } else {
            serde_json::from_str(opts_str)
                .map_err(|e| rg_error!(parse, format!("Failed to parse options: {}", e), opts_str).to_js_error())?
        }
    } else {
        SearchOptions::default()
    };
    
    // Force detailed output for directory search (to include line numbers)
    search_options.output_format = OutputFormat::Detailed;

    // Call internal search directly to avoid re-serialization
    let result = search_internal(pattern, &file_entries, &search_options)
        .map_err(|e| e.to_js_error())?;

    serde_json::to_string(&result)
        .map_err(|e| rg_error!(serialization, format!("Failed to serialize result: {}", e)).to_js_error())
}

/// Search a single file
fn search_file(
    matcher: &RegexMatcher,
    searcher: &mut Searcher,
    file_entry: &FileEntry,
) -> Result<Vec<MatchResult>, RipgrepError> {
    let matches = RefCell::new(Vec::new());
    let content_bytes = file_entry.content.as_bytes();
    let path = file_entry.path.clone();

    searcher
        .search_slice(matcher, content_bytes, UTF8(|lnum, line| {
            matches.borrow_mut().push(MatchResult {
                path: path.clone(),
                line_number: lnum,
                line: line.trim_end().to_string(),
                byte_offset: 0,
            });
            Ok(true)
        }))
        .map_err(|e| rg_error!(search, format!("Search error in file '{}': {}", file_entry.path, e)))?;

    Ok(matches.into_inner())
}

/// Parse grep command line arguments and extract pattern and options
///
/// # Arguments
/// * `args` - Array of command line arguments, e.g., ["grep", "-i", "pattern"]
///
/// # Returns
/// Tuple of (pattern, SearchOptions)
fn parse_grep_args(args: &[String]) -> Result<(String, SearchOptions), String> {
    if args.is_empty() {
        return Err("No arguments provided".to_string());
    }

    let mut options = SearchOptions::default();
    let mut pattern: Option<String> = None;
    let mut i = 0;

    // Skip "grep" command name if present
    if i < args.len() && (args[i] == "grep" || args[i].starts_with("grep")) {
        i += 1;
    }

    // Parse flags
    while i < args.len() {
        let arg = &args[i];
        
        if arg.starts_with("--") {
            // Long option
            match arg.as_str() {
                "--ignore-case" => {
                    options.case_insensitive = true;
                }
                "--word-regexp" => {
                    options.word_boundary = true;
                }
                "--fixed-strings" => {
                    options.fixed_strings = true;
                }
                "--line-number" => {
                    options.line_numbers = true;
                }
                "--no-line-number" => {
                    options.line_numbers = false;
                }
                _ => {
                    // Unknown long option, treat as pattern
                    if pattern.is_none() {
                        pattern = Some(arg.clone());
                    } else {
                        return Err(format!("Unexpected argument: {}", arg));
                    }
                }
            }
        } else if arg.starts_with('-') {
            // Short options (can be combined like -iw)
            let flags = arg.chars().skip(1);
            for flag in flags {
                match flag {
                    'i' => {
                        options.case_insensitive = true;
                    }
                    'w' => {
                        options.word_boundary = true;
                    }
                    'F' => {
                        options.fixed_strings = true;
                    }
                    'n' => {
                        options.line_numbers = true;
                    }
                    _ => {
                        return Err(format!("Unknown flag: -{}", flag));
                    }
                }
            }
        } else {
            // Positional argument - this should be the pattern
            if pattern.is_none() {
                pattern = Some(arg.clone());
            } else {
                return Err(format!("Unexpected argument: {}", arg));
            }
        }
        i += 1;
    }

    let pattern = pattern.ok_or_else(|| "No pattern provided".to_string())?;
    Ok((pattern, options))
}

/// Command-line style grep function that parses arguments like "grep -i pattern"
///
/// # Arguments
/// * `args` - JSON string of array of command line arguments, e.g., ["grep", "-i", "pattern"]
/// * `files` - JSON string of array of FileEntry objects
///
/// # Returns
/// JSON string of array of file paths that contain the pattern
///
/// # Example
/// ```javascript
/// const result = grep_cmd(
///   JSON.stringify(["grep", "-i", "hello"]),
///   JSON.stringify(files)
/// );
/// ```
#[wasm_bindgen]
pub fn grep_cmd(args: &str, files: &str) -> Result<String, JsValue> {
    // Parse arguments
    let args_vec: Vec<String> = serde_json::from_str(args)
        .map_err(|e| rg_error!(parse, format!("Failed to parse arguments: {}", e), args).to_js_error())?;

    // Parse grep arguments to extract pattern and options
    let (pattern, options) = parse_grep_args(&args_vec)
        .map_err(|e| RipgrepError::invalid_config("args".to_string(), e).to_js_error())?;

    // Parse files
    let file_entries: Vec<FileEntry> = serde_json::from_str(files)
        .map_err(|e| rg_error!(parse, format!("Failed to parse files: {}", e), files).to_js_error())?;

    // Set output format to files only for grep_cmd
    let mut options = options;
    options.output_format = OutputFormat::FilesOnly;

    // Call internal search
    let result = search_internal(&pattern, &file_entries, &options)
        .map_err(|e| e.to_js_error())?;

    // Extract unique file paths
    let mut file_paths: Vec<String> = result.matches
        .iter()
        .map(|m| m.path.clone())
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect();
    file_paths.sort();
    
    serde_json::to_string(&file_paths)
        .map_err(|e| rg_error!(serialization, format!("Failed to serialize file paths: {}", e)).to_js_error())
}

/// Simple grep function that returns files containing the pattern
///
/// This is a convenience wrapper around `search()` with `output_format: "files_only"`.
///
/// # Arguments
/// * `pattern` - The search pattern
/// * `files` - JSON string of array of FileEntry objects
/// * `options` - Optional JSON string of SearchOptions (pass null for default options)
///   Supported options:
///   - `case_insensitive`: boolean - Case-insensitive search (default: false)
///   - `word_boundary`: boolean - Word boundary matching (default: false)
///   - `fixed_strings`: boolean - Fixed string matching (default: false)
///
/// # Returns
/// JSON string of array of file paths that contain the pattern
///
/// # Examples
/// ```javascript
/// // Default search (case-sensitive)
/// grep("hello", filesJson, null);
///
/// // Case-insensitive search
/// grep("hello", filesJson, JSON.stringify({ case_insensitive: true }));
///
/// // Word boundary matching
/// grep("main", filesJson, JSON.stringify({ word_boundary: true }));
///
/// // Combined options
/// grep("hello", filesJson, JSON.stringify({ 
///   case_insensitive: true, 
///   word_boundary: true 
/// }));
/// ```
#[wasm_bindgen]
pub fn grep(pattern: &str, files: &str, options: Option<String>) -> Result<String, JsValue> {
    // Parse files
    let file_entries: Vec<FileEntry> = serde_json::from_str(files)
        .map_err(|e| rg_error!(parse, format!("Failed to parse files: {}", e), files).to_js_error())?;

    // Parse options
    let mut search_options: SearchOptions = if let Some(opts_str) = &options {
        if opts_str.is_empty() {
            SearchOptions::default()
        } else {
            serde_json::from_str(opts_str)
                .map_err(|e| rg_error!(parse, format!("Failed to parse options: {}", e), opts_str).to_js_error())?
        }
    } else {
        SearchOptions::default()
    };
    
    // Always set output format to files only for grep
    search_options.output_format = OutputFormat::FilesOnly;

    // Call internal search
    let result = search_internal(pattern, &file_entries, &search_options)
        .map_err(|e| e.to_js_error())?;

    // Extract unique file paths
    let mut file_paths: Vec<String> = result.matches
        .iter()
        .map(|m| m.path.clone())
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect();
    file_paths.sort();
    
    serde_json::to_string(&file_paths)
        .map_err(|e| rg_error!(serialization, format!("Failed to serialize file paths: {}", e)).to_js_error())
}
