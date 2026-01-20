import type { FileEntry, SearchOptions, SearchResult, DirectorySearchConfig, FilePathEntry } from './types';
export { RipgrepException } from './errors';
/**
 * High-level TypeScript API for ripgrep-wasm
 */
export declare class RipgrepWasm {
    private initialized;
    private initPromise;
    /**
     * Initialize the WASM module
     * This is called automatically by other methods, but can be called manually for eager initialization
     */
    init(): Promise<void>;
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
    search(pattern: string, files: FileEntry[], options?: SearchOptions): Promise<SearchResult>;
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
    filterDirectoryFiles(config: DirectorySearchConfig, filePaths: string[]): Promise<FilePathEntry[]>;
}
/**
 * Singleton instance for convenient access
 */
export declare const ripgrep: RipgrepWasm;
/**
 * Convenience function: search for a pattern in files
 */
export declare function search(pattern: string, files: FileEntry[], options?: SearchOptions): Promise<SearchResult>;
/**
 * Convenience function: filter directory files
 */
export declare function filterDirectoryFiles(config: DirectorySearchConfig, filePaths: string[]): Promise<FilePathEntry[]>;
//# sourceMappingURL=sdk.d.ts.map