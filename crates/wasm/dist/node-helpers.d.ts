/**
 * Node.js helper functions for directory-based search
 *
 * These helpers provide convenient directory search functionality
 * by combining Node.js file system APIs with grep-wasm.
 */
import type { FileEntry, SearchResult, SearchOptions } from './types';
/**
 * Recursively read all files from a directory
 *
 * @param dirPath - Directory path to read from
 * @param options - Optional filtering configuration
 * @returns Array of file entries with content
 */
export declare function readDirectoryFiles(dirPath: string, options?: {
    maxDepth?: number;
    fileTypes?: string[];
    ignorePatterns?: string[];
    includeHidden?: boolean;
}): Promise<FileEntry[]>;
/**
 * Search for a pattern in all files within a directory
 *
 * @param dirPath - Directory path to search in
 * @param pattern - Search pattern (regex or literal)
 * @param options - Combined directory and search options
 * @returns Search results with matches
 *
 * @example
 * ```typescript
 * const results = await searchInDirectory(
 *   '/project/src',
 *   'function',
 *   {
 *     fileTypes: ['*.js', '*.ts'],
 *     ignorePatterns: ['*.test.js', 'node_modules'],
 *     caseInsensitive: true,
 *     maxDepth: 5
 *   }
 * );
 *
 * console.log(`Found ${results.totalMatches} matches`);
 * results.matches.forEach(match => {
 *   console.log(`${match.path}:${match.lineNumber}: ${match.line}`);
 * });
 * ```
 */
export declare function searchInDirectory(dirPath: string, pattern: string, options?: SearchOptions & {
    maxDepth?: number;
    fileTypes?: string[];
    ignorePatterns?: string[];
    includeHidden?: boolean;
}): Promise<SearchResult>;
//# sourceMappingURL=node-helpers.d.ts.map