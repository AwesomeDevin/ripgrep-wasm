import init, {
  search as wasmSearch,
  filter_directory_files as wasmFilterDirectoryFiles,
} from '../pkg/ripgrep_wasm.js';

import type {
  FileEntry,
  SearchOptions,
  SearchResult,
  MatchResult,
  DirectorySearchConfig,
  FilePathEntry,
} from './types';

import { parseError } from './errors';

// Re-export for user convenience
export { RipgrepException } from './errors';

/**
 * Internal options format for WASM boundary
 */
interface WasmSearchOptions {
  case_insensitive?: boolean;
  fixed_strings?: boolean;
  word_boundary?: boolean;
  line_numbers?: boolean;
  output_format?: 'detailed' | 'files_only';
}

/**
 * Convert TypeScript options to WASM format
 */
function convertOptions(options?: SearchOptions): WasmSearchOptions {
  if (!options) return {};
  
  return {
    case_insensitive: options.caseInsensitive,
    fixed_strings: options.fixedStrings,
    word_boundary: options.wordBoundary,
    line_numbers: options.lineNumbers,
    output_format: options.outputFormat,
  };
}

/**
 * Convert WASM match result to TypeScript format
 */
function convertMatchResult(match: any): MatchResult {
  return {
    path: match.path,
    lineNumber: match.line_number,
    line: match.line,
    byteOffset: match.byte_offset,
  };
}

/**
 * Convert WASM search result to TypeScript format
 */
function convertSearchResult(result: any): SearchResult {
  return {
    matches: result.matches.map(convertMatchResult),
    totalMatches: result.total_matches,
    filesWithMatches: result.files_with_matches,
  };
}

/**
 * Convert WASM file path entry to TypeScript format
 */
function convertFilePathEntry(entry: any): FilePathEntry {
  return {
    path: entry.path,
    relativePath: entry.relative_path,
    depth: entry.depth,
  };
}

/**
 * High-level TypeScript API for grep-wasm
 */
export class RipgrepWasm {
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the WASM module
   * This is called automatically by other methods, but can be called manually for eager initialization
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = init().then(() => {
      this.initialized = true;
    }) as Promise<void>;

    return this.initPromise;
  }

  /**
   * Search for a pattern in files
   * 
   * @param pattern - The search pattern (regex or literal string)
   * @param files - Array of files to search
   * @param options - Search options
   * @returns Search result with all matches
   * @throws {RipgrepException} If search fails
   * 
   * @example
   * ```typescript
   * const results = await ripgrep.search('function', [
   *   { path: 'main.js', content: 'function main() {}' }
   * ], {
   *   caseInsensitive: true
   * });
   * console.log(`Found ${results.totalMatches} matches`);
   * ```
   */
  async search(
    pattern: string,
    files: FileEntry[],
    options?: SearchOptions
  ): Promise<SearchResult> {
    await this.init();

    try {
      const wasmOptions = convertOptions(options);
      const result = wasmSearch(
        pattern,
        JSON.stringify(files),
        wasmOptions && Object.keys(wasmOptions).length > 0
          ? JSON.stringify(wasmOptions)
          : null
      );

      const parsed = JSON.parse(result);
      return convertSearchResult(parsed);
    } catch (error) {
      parseError(error);
    }
  }

  /**
   * Filter directory files based on configuration
   * 
   * @param config - Directory search configuration
   * @param filePaths - Array of file paths to filter
   * @returns Filtered file path entries
   * @throws {RipgrepException} If filtering fails
   * 
   * @example
   * ```typescript
   * const filtered = await ripgrep.filterDirectoryFiles({
   *   rootPath: '/project',
   *   fileTypes: ['*.js', '*.ts'],
   *   ignorePatterns: ['node_modules', '*.min.js']
   * }, allFilePaths);
   * ```
   */
  async filterDirectoryFiles(
    config: DirectorySearchConfig,
    filePaths: string[]
  ): Promise<FilePathEntry[]> {
    await this.init();

    try {
      // Convert TypeScript config to WASM format
      const wasmConfig = {
        root_path: config.rootPath,
        max_depth: config.maxDepth,
        file_types: config.fileTypes || [],
        ignore_patterns: config.ignorePatterns || [],
        respect_gitignore: config.respectGitignore ?? true,
        include_hidden: config.includeHidden ?? false,
        gitignore_files: config.gitignoreFiles || [],
        override_patterns: config.overridePatterns || [],
        exclude_patterns: config.excludePatterns || [],
      };

      const result = wasmFilterDirectoryFiles(
        JSON.stringify(wasmConfig),
        JSON.stringify(filePaths)
      );

      const parsed = JSON.parse(result);
      return parsed.map(convertFilePathEntry);
    } catch (error) {
      parseError(error);
    }
  }
}

/**
 * Singleton instance for convenient access
 */
export const ripgrep = new RipgrepWasm();

/**
 * Convenience function: search for a pattern in files
 */
export async function search(
  pattern: string,
  files: FileEntry[],
  options?: SearchOptions
): Promise<SearchResult> {
  return ripgrep.search(pattern, files, options);
}

/**
 * Convenience function: filter directory files
 */
export async function filterDirectoryFiles(
  config: DirectorySearchConfig,
  filePaths: string[]
): Promise<FilePathEntry[]> {
  return ripgrep.filterDirectoryFiles(config, filePaths);
}
