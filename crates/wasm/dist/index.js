/**
 * ripgrep-wasm - WebAssembly bindings for ripgrep
 *
 * High-level TypeScript API for searching files using ripgrep in WebAssembly.
 *
 * @example
 * ```typescript
 * import { ripgrep } from 'ripgrep-wasm';
 *
 * const results = await ripgrep.search('pattern', [
 *   { path: 'file.ts', content: '...' }
 * ], {
 *   caseInsensitive: true
 * });
 *
 * console.log(`Found ${results.totalMatches} matches`);
 * ```
 *
 * @example Node.js directory search
 * ```typescript
 * import { searchInDirectory } from 'ripgrep-wasm/node';
 *
 * const results = await searchInDirectory('/project/src', 'pattern', {
 *   fileTypes: ['*.js', '*.ts'],
 *   ignorePatterns: ['node_modules']
 * });
 * ```
 */
// Export everything from SDK
export * from './sdk';
// Export types
export * from './types';
// Export errors
export * from './errors';
// Re-export low-level WASM functions for advanced users
export { search as wasmSearch, filter_directory_files as wasmFilterDirectoryFiles, } from '../pkg/ripgrep_wasm.js';
//# sourceMappingURL=index.js.map