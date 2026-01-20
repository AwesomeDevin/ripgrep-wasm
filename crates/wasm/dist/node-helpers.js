/**
 * Node.js helper functions for directory-based search
 *
 * These helpers provide convenient directory search functionality
 * by combining Node.js file system APIs with ripgrep-wasm.
 */
import * as fs from 'fs';
import * as path from 'path';
import { ripgrep } from './sdk';
/**
 * Recursively read all files from a directory
 *
 * @param dirPath - Directory path to read from
 * @param options - Optional filtering configuration
 * @returns Array of file entries with content
 */
export async function readDirectoryFiles(dirPath, options) {
    const files = [];
    const ignorePatterns = options?.ignorePatterns || ['node_modules', '.git', 'dist', 'build'];
    const maxDepth = options?.maxDepth ?? Infinity;
    async function traverse(currentPath, depth = 0) {
        if (depth > maxDepth)
            return;
        const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            const relativePath = path.relative(dirPath, fullPath);
            // Skip hidden files unless requested
            if (!options?.includeHidden && entry.name.startsWith('.')) {
                continue;
            }
            // Check ignore patterns
            if (ignorePatterns.some(pattern => {
                if (pattern.includes('*')) {
                    // Simple glob matching
                    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
                    return regex.test(entry.name) || regex.test(relativePath);
                }
                return entry.name === pattern || relativePath.includes(pattern);
            })) {
                continue;
            }
            if (entry.isDirectory()) {
                await traverse(fullPath, depth + 1);
            }
            else if (entry.isFile()) {
                // Check file type filters
                if (options?.fileTypes && options.fileTypes.length > 0) {
                    const matchesType = options.fileTypes.some(type => {
                        const pattern = type.replace(/\*/g, '.*');
                        const regex = new RegExp(pattern + '$');
                        return regex.test(entry.name);
                    });
                    if (!matchesType)
                        continue;
                }
                try {
                    const content = await fs.promises.readFile(fullPath, 'utf-8');
                    files.push({
                        path: fullPath,
                        content
                    });
                }
                catch (err) {
                    // Skip files that can't be read (binary, permissions, etc.)
                    console.warn(`Skipping ${fullPath}: ${err}`);
                }
            }
        }
    }
    await traverse(dirPath);
    return files;
}
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
export async function searchInDirectory(dirPath, pattern, options) {
    // Validate directory exists
    try {
        const stat = await fs.promises.stat(dirPath);
        if (!stat.isDirectory()) {
            throw new Error(`${dirPath} is not a directory`);
        }
    }
    catch (err) {
        throw new Error(`Cannot access directory ${dirPath}: ${err}`);
    }
    // Read all files
    const files = await readDirectoryFiles(dirPath, {
        maxDepth: options?.maxDepth,
        fileTypes: options?.fileTypes,
        ignorePatterns: options?.ignorePatterns,
        includeHidden: options?.includeHidden,
    });
    // Search in files
    return ripgrep.search(pattern, files, {
        caseInsensitive: options?.caseInsensitive,
        fixedStrings: options?.fixedStrings,
        wordBoundary: options?.wordBoundary,
        lineNumbers: options?.lineNumbers,
        outputFormat: options?.outputFormat,
    });
}
//# sourceMappingURL=node-helpers.js.map