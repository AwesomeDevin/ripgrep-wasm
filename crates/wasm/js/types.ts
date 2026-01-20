/**
 * TypeScript type definitions for grep-wasm
 */

/**
 * Represents a file to be searched
 */
export interface FileEntry {
  /** Full file path (absolute or relative) */
  path: string;
  /** File content as string */
  content: string;
}

/**
 * A single match result
 */
export interface MatchResult {
  /** The file path where the match was found */
  path: string;
  /** The line number (1-indexed) where the match was found */
  lineNumber: number;
  /** The full line content containing the match */
  line: string;
  /** The byte offset of the match (currently always 0) */
  byteOffset: number;
}

/**
 * Complete search result with all matches
 */
export interface SearchResult {
  /** All matches found across all files */
  matches: MatchResult[];
  /** Total number of matches found */
  totalMatches: number;
  /** Number of unique files containing matches */
  filesWithMatches: number;
}

/**
 * Search options for controlling search behavior
 */
export interface SearchOptions {
  /** Perform case-insensitive search (default: false) */
  caseInsensitive?: boolean;
  /** Treat pattern as fixed string, not regex (default: false) */
  fixedStrings?: boolean;
  /** Match whole words only (default: false) */
  wordBoundary?: boolean;
  /** Include line numbers in results (default: true) */
  lineNumbers?: boolean;
  /** Output format: 'detailed' returns full results, 'files_only' returns just file paths (default: 'detailed') */
  outputFormat?: 'detailed' | 'files_only';
}

/**
 * Configuration for directory-based searches
 */
export interface DirectorySearchConfig {
  /** Root directory path */
  rootPath: string;
  /** Maximum search depth (undefined = unlimited) */
  maxDepth?: number;
  /** File type patterns to include (e.g., ["*.js", "*.ts"]) */
  fileTypes?: string[];
  /** Patterns to ignore (e.g., ["node_modules", "*.log"]) */
  ignorePatterns?: string[];
  /** Whether to respect .gitignore files (default: true) */
  respectGitignore?: boolean;
  /** Whether to search hidden files (default: false) */
  includeHidden?: boolean;
  /** .gitignore file contents */
  gitignoreFiles?: GitignoreFile[];
  /** Override patterns (whitelist, similar to --include) */
  overridePatterns?: string[];
  /** Exclude patterns (similar to --exclude) */
  excludePatterns?: string[];
}

/**
 * Represents a .gitignore file
 */
export interface GitignoreFile {
  /** Directory path where this .gitignore file is located */
  path: string;
  /** Content of the .gitignore file */
  content: string;
}

/**
 * File path entry returned by filter operation
 */
export interface FilePathEntry {
  /** Full file path */
  path: string;
  /** Relative path from root */
  relativePath: string;
  /** Depth from root (0 = root level) */
  depth: number;
}

/**
 * Error kinds for ripgrep operations
 */
export enum RipgrepErrorKind {
  ParseError = 'ParseError',
  InvalidPattern = 'InvalidPattern',
  SearchError = 'SearchError',
  InvalidConfiguration = 'InvalidConfiguration',
  MemoryError = 'MemoryError',
  FileError = 'FileError',
  SerializationError = 'SerializationError',
}

/**
 * Details for parse errors
 */
export interface ParseErrorDetails {
  message: string;
  inputPreview?: string;
}

/**
 * Details for pattern errors
 */
export interface PatternErrorDetails {
  message: string;
  pattern: string;
}

/**
 * Details for search errors
 */
export interface SearchErrorDetails {
  message: string;
}

/**
 * Details for configuration errors
 */
export interface ConfigurationErrorDetails {
  field: string;
  message: string;
}

/**
 * Details for file errors
 */
export interface FileErrorDetails {
  message: string;
  path?: string;
}

/**
 * Details for serialization errors
 */
export interface SerializationErrorDetails {
  message: string;
}

/**
 * Error details union type
 */
export type ErrorDetails =
  | { type: 'ParseError'; details: ParseErrorDetails }
  | { type: 'InvalidPattern'; details: PatternErrorDetails }
  | { type: 'SearchError'; details: SearchErrorDetails }
  | { type: 'InvalidConfiguration'; details: ConfigurationErrorDetails }
  | { type: 'MemoryError'; details: SearchErrorDetails }
  | { type: 'FileError'; details: FileErrorDetails }
  | { type: 'SerializationError'; details: SerializationErrorDetails };

/**
 * Structured error from grep-wasm
 */
export interface RipgrepError {
  type: RipgrepErrorKind;
  details: unknown;
  message: string;
}
