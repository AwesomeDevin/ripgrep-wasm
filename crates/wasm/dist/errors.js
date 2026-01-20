/**
 * Exception class for grep-wasm errors
 */
export class RipgrepException extends Error {
    constructor(error) {
        super(error.message);
        this.error = error;
        this.name = 'RipgrepException';
        // Maintain proper stack trace for where our error was thrown (only available on V8)
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, RipgrepException);
        }
    }
    /**
     * Check if this is a parse error
     */
    isParseError() {
        return this.error.type === 'ParseError';
    }
    /**
     * Check if this is an invalid pattern error
     */
    isPatternError() {
        return this.error.type === 'InvalidPattern';
    }
    /**
     * Check if this is a search error
     */
    isSearchError() {
        return this.error.type === 'SearchError';
    }
    /**
     * Check if this is a configuration error
     */
    isConfigError() {
        return this.error.type === 'InvalidConfiguration';
    }
    /**
     * Check if this is a file error
     */
    isFileError() {
        return this.error.type === 'FileError';
    }
    /**
     * Check if this is a memory error
     */
    isMemoryError() {
        return this.error.type === 'MemoryError';
    }
    /**
     * Check if this is a serialization error
     */
    isSerializationError() {
        return this.error.type === 'SerializationError';
    }
    /**
     * Get error details
     */
    getDetails() {
        return this.error.details;
    }
}
/**
 * Parse a WASM error and throw appropriate exception
 */
export function parseError(error) {
    if (typeof error === 'string') {
        try {
            const parsedError = JSON.parse(error);
            throw new RipgrepException(parsedError);
        }
        catch (e) {
            // If JSON parsing fails, throw a generic error
            if (e instanceof RipgrepException) {
                throw e;
            }
            throw new Error(`Ripgrep error: ${error}`);
        }
    }
    // If it's already an Error, rethrow it
    if (error instanceof Error) {
        throw error;
    }
    // Unknown error type
    throw new Error(`Unknown ripgrep error: ${String(error)}`);
}
//# sourceMappingURL=errors.js.map