/* tslint:disable */
/* eslint-disable */

/**
 * Filter directory files based on configuration
 *
 * This function filters a list of file paths based on directory search configuration,
 * including file type filters, ignore patterns, depth limits, and hidden file settings.
 *
 * # Arguments
 * * `config` - JSON string of DirectorySearchConfig object
 * * `file_paths` - JSON string of array of file path strings
 *
 * # Returns
 * JSON string of array of FilePathEntry objects (filtered and annotated with depth)
 */
export function filter_directory_files(config: string, file_paths: string): string;

/**
 * Simple grep function that returns files containing the pattern
 *
 * This is a convenience wrapper around `search()` with `output_format: "files_only"`.
 *
 * # Arguments
 * * `pattern` - The search pattern
 * * `files` - JSON string of array of FileEntry objects
 * * `options` - Optional JSON string of SearchOptions (pass null for default options)
 *   Supported options:
 *   - `case_insensitive`: boolean - Case-insensitive search (default: false)
 *   - `word_boundary`: boolean - Word boundary matching (default: false)
 *   - `fixed_strings`: boolean - Fixed string matching (default: false)
 *
 * # Returns
 * JSON string of array of file paths that contain the pattern
 *
 * # Examples
 * ```javascript
 * // Default search (case-sensitive)
 * grep("hello", filesJson, null);
 *
 * // Case-insensitive search
 * grep("hello", filesJson, JSON.stringify({ case_insensitive: true }));
 *
 * // Word boundary matching
 * grep("main", filesJson, JSON.stringify({ word_boundary: true }));
 *
 * // Combined options
 * grep("hello", filesJson, JSON.stringify({
 *   case_insensitive: true,
 *   word_boundary: true
 * }));
 * ```
 */
export function grep(pattern: string, files: string, options?: string | null): string;

/**
 * Command-line style grep function that parses arguments like "grep -i pattern"
 *
 * # Arguments
 * * `args` - JSON string of array of command line arguments, e.g., ["grep", "-i", "pattern"]
 * * `files` - JSON string of array of FileEntry objects
 *
 * # Returns
 * JSON string of array of file paths that contain the pattern
 *
 * # Example
 * ```javascript
 * const result = grep_cmd(
 *   JSON.stringify(["grep", "-i", "hello"]),
 *   JSON.stringify(files)
 * );
 * ```
 */
export function grep_cmd(args: string, files: string): string;

/**
 * Search for a pattern in a list of files
 *
 * # Arguments
 * * `pattern` - The search pattern (regex or literal string)
 * * `files` - JSON string of array of FileEntry objects
 * * `options` - Optional JSON string of SearchOptions (pass null or empty string for default)
 *
 * # Returns
 * JSON string of SearchResult or array of file paths (depending on output_format)
 */
export function search(pattern: string, files: string, options?: string | null): string;

/**
 * Search for a pattern in a directory
 *
 * This function searches for a pattern in files within a directory structure.
 * It applies directory configuration filters and returns detailed search results
 * including line numbers.
 *
 * # Arguments
 * * `pattern` - The search pattern (regex or literal string)
 * * `config` - JSON string of DirectorySearchConfig object
 * * `files` - JSON string of array of FileEntry objects (files should be pre-filtered)
 * * `options` - Optional JSON string of SearchOptions (pass null for default)
 *
 * # Returns
 * JSON string of SearchResult with matches including line numbers
 *
 * # Example
 * ```javascript
 * const config = {
 *   root_path: "/project",
 *   max_depth: 5,
 *   file_types: ["*.js", "*.ts"],
 *   ignore_patterns: ["node_modules", "*.log"]
 * };
 *
 * const files = [
 *   { path: "/project/src/main.js", content: "function main() {}" }
 * ];
 *
 * const result = search_directory(
 *   "function",
 *   JSON.stringify(config),
 *   JSON.stringify(files),
 *   JSON.stringify({ case_insensitive: true })
 * );
 * ```
 */
export function search_directory(pattern: string, config: string, files: string, options?: string | null): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly search: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly filter_directory_files: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly search_directory: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
    readonly grep_cmd: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly grep: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
