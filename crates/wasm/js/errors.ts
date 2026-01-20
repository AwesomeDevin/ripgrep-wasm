import type { RipgrepError } from './types';

/**
 * Exception class for ripgrep-wasm errors
 */
export class RipgrepException extends Error {
  constructor(public readonly error: RipgrepError) {
    super(error.message);
    this.name = 'RipgrepException';
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, RipgrepException);
    }
  }

  /**
   * Check if this is a parse error
   */
  isParseError(): boolean {
    return this.error.type === 'ParseError';
  }

  /**
   * Check if this is an invalid pattern error
   */
  isPatternError(): boolean {
    return this.error.type === 'InvalidPattern';
  }

  /**
   * Check if this is a search error
   */
  isSearchError(): boolean {
    return this.error.type === 'SearchError';
  }

  /**
   * Check if this is a configuration error
   */
  isConfigError(): boolean {
    return this.error.type === 'InvalidConfiguration';
  }

  /**
   * Check if this is a file error
   */
  isFileError(): boolean {
    return this.error.type === 'FileError';
  }

  /**
   * Check if this is a memory error
   */
  isMemoryError(): boolean {
    return this.error.type === 'MemoryError';
  }

  /**
   * Check if this is a serialization error
   */
  isSerializationError(): boolean {
    return this.error.type === 'SerializationError';
  }

  /**
   * Get error details
   */
  getDetails(): unknown {
    return this.error.details;
  }
}

/**
 * Parse a WASM error and throw appropriate exception
 */
export function parseError(error: unknown): never {
  if (typeof error === 'string') {
    try {
      const parsedError = JSON.parse(error) as RipgrepError;
      throw new RipgrepException(parsedError);
    } catch (e) {
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
