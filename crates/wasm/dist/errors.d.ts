import type { RipgrepError } from './types';
/**
 * Exception class for grep-wasm errors
 */
export declare class RipgrepException extends Error {
    readonly error: RipgrepError;
    constructor(error: RipgrepError);
    /**
     * Check if this is a parse error
     */
    isParseError(): boolean;
    /**
     * Check if this is an invalid pattern error
     */
    isPatternError(): boolean;
    /**
     * Check if this is a search error
     */
    isSearchError(): boolean;
    /**
     * Check if this is a configuration error
     */
    isConfigError(): boolean;
    /**
     * Check if this is a file error
     */
    isFileError(): boolean;
    /**
     * Check if this is a memory error
     */
    isMemoryError(): boolean;
    /**
     * Check if this is a serialization error
     */
    isSerializationError(): boolean;
    /**
     * Get error details
     */
    getDetails(): unknown;
}
/**
 * Parse a WASM error and throw appropriate exception
 */
export declare function parseError(error: unknown): never;
//# sourceMappingURL=errors.d.ts.map