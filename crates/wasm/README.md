# @alife/grep-wasm

WebAssembly bindings for [ripgrep](https://github.com/BurntSushi/ripgrep) - blazing-fast text search for browsers and Node.js.

[![npm version](https://img.shields.io/npm/v/@alife/grep-wasm.svg)](https://www.npmjs.com/package/@alife/grep-wasm)
[![GitHub](https://img.shields.io/github/stars/AwesomeDevin/ripgrep-wasm?style=social)](https://github.com/AwesomeDevin/ripgrep-wasm)
[![License: MIT OR Unlicense](https://img.shields.io/badge/license-MIT%20OR%20Unlicense-blue.svg)](LICENSE)

## 🚀 Features

- ⚡ **High Performance** - Powered by ripgrep's efficient search engine compiled to WebAssembly
- 🎯 **Full-Featured** - Regex patterns, case-insensitive matching, whole-word search, and more
- 📦 **TypeScript Native** - Complete type definitions with modern, intuitive API
- 🌐 **Universal** - Works in browsers, Node.js, and WebContainer environments
- 🔍 **Advanced Filtering** - File type filters, .gitignore support, depth limits
- ✨ **Simple API** - Clean, consistent interface with automatic initialization
- 🛡️ **Structured Errors** - Detailed error information for better debugging

---

## 📦 Installation

```bash
npm install @alife/grep-wasm
```

或使用其他包管理器：

```bash
# pnpm
pnpm add @alife/grep-wasm

# yarn
yarn add @alife/grep-wasm
```

---

## ⚡ Quick Start

### Basic Search

```typescript
import { ripgrep } from '@alife/grep-wasm';

// Search for a pattern in files
const results = await ripgrep.search('function', [
  { path: 'main.js', content: 'function main() { console.log("Hello"); }' },
  { path: 'utils.js', content: 'export function helper() { return 42; }' }
], {
  caseInsensitive: true
});

console.log(`Found ${results.totalMatches} matches in ${results.filesWithMatches} files`);

// Display results
results.matches.forEach(match => {
  console.log(`${match.path}:${match.lineNumber}: ${match.line}`);
});
```

### Node.js Directory Search

```typescript
import { searchInDirectory } from '@alife/grep-wasm/node';

// Automatically search all files in a directory
const results = await searchInDirectory(
  './src',              // Directory path
  'TODO',               // Search pattern
  {
    fileTypes: ['*.js', '*.ts'],
    ignorePatterns: ['node_modules', '*.test.js'],
    caseInsensitive: true
  }
);

console.log(`Found ${results.totalMatches} TODOs`);
```

---

## 📚 Core API

### RipgrepWasm Class

The main class providing high-level search functionality.

#### `search(pattern, files, options?)`

Search for a pattern in files with detailed results including line numbers and matched content.

**Parameters:**

##### 1. `pattern: string`

The search pattern. Supports both literal strings and regular expressions.

**Examples:**
```typescript
// Literal string
'TODO'

// Regular expression
'function\\s+\\w+'

// Multiple patterns (OR)
'TODO|FIXME|XXX'

// Word with boundaries
'\\bclass\\b'
```

##### 2. `files: FileEntry[]`

Array of files to search. Each file must include path and content.

```typescript
interface FileEntry {
  /** 
   * Full file path (absolute or relative)
   * Used in search results to identify where matches were found
   * 
   * Examples:
   * - 'src/main.ts'
   * - '/project/src/utils.js'
   * - './README.md'
   */
  path: string;
  
  /** 
   * File content as UTF-8 string
   * The actual text content to search within
   * Must be valid UTF-8 (binary files not supported)
   * 
   * Example:
   * 'function main() {\n  console.log("Hello");\n}'
   */
  content: string;
}
```

**Example:**
```typescript
const files: FileEntry[] = [
  {
    path: 'src/index.ts',
    content: 'import { app } from "./app";\n\napp.start();'
  },
  {
    path: 'src/app.ts',
    content: 'export const app = {\n  start() { console.log("Started"); }\n};'
  }
];
```

##### 3. `options?: SearchOptions`

Optional configuration to control search behavior.

```typescript
interface SearchOptions {
  /**
   * Case-insensitive search (equivalent to grep -i)
   * 
   * Default: false
   * 
   * When true:
   * - 'TODO' matches 'TODO', 'todo', 'Todo', 'tOdO', etc.
   * 
   * Example:
   * await search('hello', files, { caseInsensitive: true });
   * // Matches: "Hello", "HELLO", "hello"
   */
  caseInsensitive?: boolean;
  
  /**
   * Treat pattern as fixed string, not regex (equivalent to grep -F)
   * 
   * Default: false
   * 
   * When true:
   * - Special regex characters are treated literally
   * - Faster than regex matching
   * 
   * Example:
   * await search('[test]', files, { fixedStrings: true });
   * // Matches literal "[test]", not regex character class
   */
  fixedStrings?: boolean;
  
  /**
   * Match whole words only (equivalent to grep -w)
   * 
   * Default: false
   * 
   * When true:
   * - Pattern must match complete words (bounded by non-word characters)
   * - Automatically adds \b word boundaries to pattern
   * 
   * Example:
   * await search('main', files, { wordBoundary: true });
   * // Matches: "main()" but NOT "remain" or "domain"
   */
  wordBoundary?: boolean;
  
  /**
   * Include line numbers in results
   * 
   * Default: true
   * 
   * When false:
   * - lineNumber field still present but may be 0
   * - Slightly faster search
   * 
   * Example:
   * await search('TODO', files, { lineNumbers: true });
   */
  lineNumbers?: boolean;
  
  /**
   * Output format control
   * 
   * Default: 'detailed'
   * 
   * Options:
   * - 'detailed': Full match details (path, line number, line content)
   * - 'files_only': Only file paths (matches array still contains items, use for path extraction)
   * 
   * Example:
   * const results = await search('TODO', files, { outputFormat: 'detailed' });
   * // results.matches contains full MatchResult objects
   * 
   * const results2 = await search('TODO', files, { outputFormat: 'files_only' });
   * const paths = [...new Set(results2.matches.map(m => m.path))];
   */
  outputFormat?: 'detailed' | 'files_only';
}
```

**Complete Options Example:**
```typescript
const options: SearchOptions = {
  caseInsensitive: true,   // Match any case
  fixedStrings: false,     // Use regex (default)
  wordBoundary: true,      // Match whole words only
  lineNumbers: true,       // Include line numbers (default)
  outputFormat: 'detailed' // Full results (default)
};

const results = await ripgrep.search('function', files, options);
```

**Returns:** `Promise<SearchResult>`

Complete search results with match details.

```typescript
interface SearchResult {
  /**
   * All matches found across all files
   * Array of individual match results
   * Ordered by file path, then line number
   * 
   * Empty array if no matches found
   */
  matches: MatchResult[];
  
  /**
   * Total number of matches found
   * Count of all occurrences across all files
   * 
   * Example:
   * - If 'TODO' appears 3 times in file1 and 2 times in file2
   * - totalMatches = 5
   */
  totalMatches: number;
  
  /**
   * Number of unique files containing matches
   * 
   * Example:
   * - If 'TODO' appears in 3 different files
   * - filesWithMatches = 3
   */
  filesWithMatches: number;
}

interface MatchResult {
  /**
   * Full file path where match was found
   * Same as the path provided in FileEntry
   * 
   * Example: 'src/main.ts'
   */
  path: string;
  
  /**
   * Line number where match was found (1-indexed)
   * First line of file is line 1
   * 
   * Example: 42 (means match is on line 42)
   * 
   * Note: Will be 0 if lineNumbers option is false
   */
  lineNumber: number;
  
  /**
   * Full line content containing the match
   * The complete text of the line (trimmed of trailing whitespace)
   * 
   * Example: '  // TODO: implement this feature'
   */
  line: string;
  
  /**
   * Byte offset of the match start position
   * Currently always 0 (reserved for future use)
   * 
   * Future: Will indicate exact position of match within line
   */
  byteOffset: number;
}
```

**Result Example:**
```typescript
const results = await ripgrep.search('TODO', files);

console.log(results);
// Output:
// {
//   matches: [
//     {
//       path: 'src/main.ts',
//       lineNumber: 5,
//       line: '  // TODO: implement error handling',
//       byteOffset: 0
//     },
//     {
//       path: 'src/utils.ts',
//       lineNumber: 12,
//       line: '// TODO: optimize this function',
//       byteOffset: 0
//     }
//   ],
//   totalMatches: 2,
//   filesWithMatches: 2
// }
```

**Usage Examples:**

```typescript
// Example 1: Basic case-sensitive search
const results = await ripgrep.search('TODO', files);
console.log(`Found ${results.totalMatches} TODOs`);

// Example 2: Case-insensitive search (grep -i)
const results = await ripgrep.search('function', files, { 
  caseInsensitive: true 
});
// Matches: "function", "Function", "FUNCTION"

// Example 3: Whole word matching (grep -w)
const results = await ripgrep.search('test', files, {
  wordBoundary: true
});
// Matches: "test()" but NOT "testing" or "latest"

// Example 4: Literal string search (grep -F)
const results = await ripgrep.search('[test]', files, {
  fixedStrings: true
});
// Matches literal "[test]", not regex pattern

// Example 5: Regular expression search
const results = await ripgrep.search('function\\s+\\w+', files);
// Matches: "function main", "function helper", etc.

// Example 6: Multiple patterns (OR)
const results = await ripgrep.search('TODO|FIXME|XXX', files);
// Matches any of the three patterns

// Example 7: Extract unique file paths
const results = await ripgrep.search('import', files);
const uniqueFiles = [...new Set(results.matches.map(m => m.path))];
console.log('Files with imports:', uniqueFiles);

// Example 8: Combined options
const results = await ripgrep.search('error', files, {
  caseInsensitive: true,  // Match any case
  wordBoundary: true,     // Whole word only
  lineNumbers: true       // Include line numbers
});

// Example 9: Find function definitions
const results = await ripgrep.search(
  '^\\s*function\\s+\\w+\\s*\\(',  // Regex for function definitions
  files
);

// Example 10: Count matches per file
const results = await ripgrep.search('console.log', files);
const countsPerFile = results.matches.reduce((acc, match) => {
  acc[match.path] = (acc[match.path] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
```

---

#### `filterDirectoryFiles(config, filePaths)`

Filter file paths based on directory search configuration. Useful for applying .gitignore rules, file type filters, and depth limits.

**Parameters:**

##### 1. `config: DirectorySearchConfig`

Configuration for filtering files.

```typescript
interface DirectorySearchConfig {
  /**
   * Root directory path for calculating relative paths and depths
   * 
   * Required: true
   * 
   * Example: '/project' or './src'
   */
  rootPath: string;
  
  /**
   * Maximum recursion depth from root
   * 
   * Default: undefined (unlimited)
   * 
   * Examples:
   * - 0: Only files in root directory
   * - 1: Root + 1 level of subdirectories
   * - undefined: No limit
   * 
   * Usage:
   * { rootPath: '/project', maxDepth: 2 }
   * // Includes: /project/file.js, /project/src/app.js
   * // Excludes: /project/src/components/Button.js (depth 3)
   */
  maxDepth?: number;
  
  /**
   * File type patterns to include (glob patterns)
   * 
   * Default: [] (all files)
   * 
   * Supports:
   * - Wildcards: *.js, *.ts
   * - Multiple extensions: *.{js,ts}
   * - Subdirectories: **\/*.js
   * 
   * Examples:
   * ['*.ts']           // Only .ts files
   * ['*.js', '*.jsx']  // JavaScript files
   * ['*.{ts,tsx}']     // TypeScript files
   * 
   * Note: If specified, ONLY matching files are included
   */
  fileTypes?: string[];
  
  /**
   * Patterns to ignore (glob patterns)
   * 
   * Default: []
   * 
   * Common examples:
   * ['node_modules']         // Exclude node_modules directory
   * ['*.min.js']            // Exclude minified files
   * ['dist', 'build']       // Exclude build directories
   * ['*.log']               // Exclude log files
   * ['**\/__tests__/**']     // Exclude test directories
   * 
   * Note: These patterns are applied AFTER fileTypes filter
   */
  ignorePatterns?: string[];
  
  /**
   * Whether to respect .gitignore rules
   * 
   * Default: true
   * 
   * When true:
   * - Files matching .gitignore patterns are excluded
   * - Requires gitignoreFiles to be provided
   * 
   * Example:
   * { 
   *   respectGitignore: true,
   *   gitignoreFiles: [
   *     { path: '/project', content: 'node_modules/\n*.log' }
   *   ]
   * }
   */
  respectGitignore?: boolean;
  
  /**
   * Whether to include hidden files (starting with .)
   * 
   * Default: false
   * 
   * When false:
   * - Files like .env, .gitignore are excluded
   * - Directories like .git are excluded
   * 
   * When true:
   * - All files included (subject to other filters)
   */
  includeHidden?: boolean;
  
  /**
   * .gitignore file contents to apply
   * 
   * Default: []
   * 
   * Structure:
   * - path: Directory containing the .gitignore
   * - content: Raw .gitignore file content
   * 
   * Example:
   * gitignoreFiles: [
   *   {
   *     path: '/project',
   *     content: `
   *       node_modules/
   *       dist/
   *       *.log
   *       .env
   *     `
   *   },
   *   {
   *     path: '/project/packages/app',
   *     content: 'build/\n*.test.js'
   *   }
   * ]
   * 
   * Note: Multiple .gitignore files can be specified for monorepos
   */
  gitignoreFiles?: GitignoreFile[];
  
  /**
   * Override patterns (whitelist)
   * Forces inclusion of matching files even if ignored
   * 
   * Default: []
   * 
   * Example:
   * {
   *   ignorePatterns: ['dist/**'],
   *   overridePatterns: ['dist/important.js']
   * }
   * // All dist/** files ignored EXCEPT dist/important.js
   */
  overridePatterns?: string[];
  
  /**
   * Exclude patterns (blacklist)
   * Additional exclusion rules
   * 
   * Default: []
   * 
   * Example:
   * {
   *   fileTypes: ['*.js'],
   *   excludePatterns: ['*.test.js', '*.spec.js']
   * }
   * // Include .js files but exclude test files
   */
  excludePatterns?: string[];
}

interface GitignoreFile {
  /** Directory path where .gitignore is located */
  path: string;
  /** Content of .gitignore file */
  content: string;
}
```

**Config Example:**
```typescript
const config: DirectorySearchConfig = {
  rootPath: '/project',
  maxDepth: 5,
  fileTypes: ['*.ts', '*.tsx', '*.js', '*.jsx'],
  ignorePatterns: [
    'node_modules',
    'dist',
    'build',
    '*.min.js',
    '*.map',
    'coverage'
  ],
  respectGitignore: true,
  includeHidden: false,
  gitignoreFiles: [
    {
      path: '/project',
      content: `
node_modules/
dist/
.env
*.log
.DS_Store
      `.trim()
    }
  ],
  overridePatterns: ['src/**/*'],
  excludePatterns: ['**/*.test.ts']
};
```

##### 2. `filePaths: string[]`

Array of file paths to filter.

**Example:**
```typescript
const filePaths = [
  '/project/src/main.ts',
  '/project/src/utils.ts',
  '/project/node_modules/react/index.js',
  '/project/dist/bundle.js',
  '/project/.env',
  '/project/src/app.test.ts'
];
```

**Returns:** `Promise<FilePathEntry[]>`

Array of filtered file path entries with metadata.

```typescript
interface FilePathEntry {
  /**
   * Full file path (same as input)
   * 
   * Example: '/project/src/main.ts'
   */
  path: string;
  
  /**
   * Path relative to rootPath
   * 
   * Example: 'src/main.ts' (if rootPath is '/project')
   */
  relativePath: string;
  
  /**
   * Depth level from root (0-indexed)
   * 
   * Examples:
   * - '/project/file.js' -> depth: 0
   * - '/project/src/file.js' -> depth: 1
   * - '/project/src/components/Button.js' -> depth: 2
   */
  depth: number;
}
```

**Result Example:**
```typescript
const filtered = await ripgrep.filterDirectoryFiles(config, filePaths);

console.log(filtered);
// Output:
// [
//   {
//     path: '/project/src/main.ts',
//     relativePath: 'src/main.ts',
//     depth: 1
//   },
//   {
//     path: '/project/src/utils.ts',
//     relativePath: 'src/utils.ts',
//     depth: 1
//   }
// ]
// Excluded:
// - /project/node_modules/react/index.js (ignorePatterns)
// - /project/dist/bundle.js (ignorePatterns)
// - /project/.env (includeHidden: false)
// - /project/src/app.test.ts (excludePatterns)
```

**Example:**

```typescript
const filtered = await ripgrep.filterDirectoryFiles({
  rootPath: '/project',
  maxDepth: 3,
  fileTypes: ['*.js', '*.ts'],
  ignorePatterns: ['node_modules', 'dist', '*.min.js'],
  respectGitignore: true
}, allFilePaths);

console.log(`Filtered ${filtered.length} files`);
```

---

### Convenience Functions

```typescript
import { search, filterDirectoryFiles } from '@alife/grep-wasm';

// Same as ripgrep.search(...)
const results = await search(pattern, files, options);

// Same as ripgrep.filterDirectoryFiles(...)
const filtered = await filterDirectoryFiles(config, filePaths);
```

---

## 🟢 Node.js Helper Functions

The `@alife/grep-wasm/node` module provides convenient directory search functions that automatically handle file system access.

### `searchInDirectory(dirPath, pattern, options?)`

Automatically read and search all files in a directory.

```typescript
import { searchInDirectory } from 'ripgrep-wasm/node';

const results = await searchInDirectory(
  '/project/src',
  'function',
  {
    fileTypes: ['*.js', '*.ts'],
    ignorePatterns: ['*.test.js', 'node_modules'],
    caseInsensitive: true,
    maxDepth: 5
  }
);

results.matches.forEach(match => {
  console.log(`${match.path}:${match.lineNumber}: ${match.line}`);
});
```

### `readDirectoryFiles(dirPath, options?)`

Recursively read all files from a directory.

```typescript
import { readDirectoryFiles } from '@alife/grep-wasm/node';

const files = await readDirectoryFiles('/project', {
  fileTypes: ['*.js'],
  ignorePatterns: ['node_modules', 'dist'],
  maxDepth: 3
});

// Use with core search
const results = await search('pattern', files);
```

---

## ⚙️ Supported Features & Limitations

### ✅ Currently Supported

The following features are currently implemented and tested:

| Feature | Option | Equivalent | Description |
|---------|--------|------------|-------------|
| **Case-insensitive** | `caseInsensitive: true` | `grep -i` | Match regardless of case |
| **Fixed strings** | `fixedStrings: true` | `grep -F` | Literal string matching (no regex) |
| **Word boundary** | `wordBoundary: true` | `grep -w` | Match whole words only |
| **Line numbers** | `lineNumbers: true` | `grep -n` | Include line numbers (default: ON) |
| **Regex patterns** | (default) | `grep -E` | Full regular expression support |
| **Multiple patterns** | `pattern1\|pattern2` | `grep -e` | OR multiple patterns |
| **File filtering** | `fileTypes` | `--include` | Filter by file extensions |
| **Ignore patterns** | `ignorePatterns` | `--exclude` | Exclude files/directories |
| **.gitignore** | `respectGitignore` | - | Honor .gitignore rules |
| **Max depth** | `maxDepth` | `--max-depth` | Limit directory recursion |
| **Hidden files** | `includeHidden` | - | Include/exclude hidden files |

### ❌ Not Yet Supported

The following common grep features are **not yet implemented**. We're tracking these for future releases:

| Feature | grep Option | Workaround | Priority |
|---------|-------------|------------|----------|
| **Invert match** | `-v, --invert-match` | Filter results in JS | Medium |
| **Max count** | `-m, --max-count` | Slice results array | Low |
| **Count only** | `-c, --count` | Use `results.totalMatches` | Low |
| **Context lines** | `-A, -B, -C` | Fetch surrounding lines in JS | Medium |
| **Only matching** | `-o, --only-matching` | Extract with regex in JS | Low |
| **Quiet mode** | `-q, --quiet` | Check if `totalMatches > 0` | Low |
| **Binary files** | `--binary` | Not applicable (text only) | N/A |
| **Multiline** | `-U, --multiline` | Use `\n` in pattern | High |

### 🔧 Workarounds for Missing Features

#### Invert Match (show non-matching lines)

```typescript
// grep -v "pattern" file.txt
// Show lines that DON'T contain pattern

const allLines = fileContent.split('\n');
const results = await ripgrep.search('pattern', files);
const matchingLines = new Set(results.matches.map(m => m.lineNumber));

const nonMatchingLines = allLines
  .map((line, index) => ({ line, lineNumber: index + 1 }))
  .filter(item => !matchingLines.has(item.lineNumber));

console.log('Lines without pattern:');
nonMatchingLines.forEach(item => {
  console.log(`${item.lineNumber}: ${item.line}`);
});
```

#### Max Count (limit number of matches)

```typescript
// grep -m 5 "pattern" file.txt
// Show only first 5 matches

const results = await ripgrep.search('pattern', files);
const limitedMatches = results.matches.slice(0, 5);

console.log('First 5 matches:', limitedMatches);
```

#### Count Only (show match count)

```typescript
// grep -c "pattern" file.txt
// Show count of matches per file

const results = await ripgrep.search('pattern', files);

const countsPerFile = results.matches.reduce((acc, match) => {
  acc[match.path] = (acc[match.path] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

Object.entries(countsPerFile).forEach(([path, count]) => {
  console.log(`${path}: ${count}`);
});
```

#### Context Lines (show surrounding lines)

```typescript
// grep -C 2 "pattern" file.txt
// Show 2 lines before and after each match

const fileLines = files[0].content.split('\n');
const results = await ripgrep.search('pattern', files);

results.matches.forEach(match => {
  const lineIndex = match.lineNumber - 1;
  const contextBefore = 2;
  const contextAfter = 2;
  
  const start = Math.max(0, lineIndex - contextBefore);
  const end = Math.min(fileLines.length, lineIndex + contextAfter + 1);
  
  console.log(`\n--- ${match.path}:${match.lineNumber} ---`);
  for (let i = start; i < end; i++) {
    const prefix = i === lineIndex ? '>' : ' ';
    console.log(`${prefix} ${i + 1}: ${fileLines[i]}`);
  }
});
```

#### Only Matching Part (extract matched text)

```typescript
// grep -o "pattern" file.txt
// Show only the matched text, not the full line

const results = await ripgrep.search('\\b\\w+Error\\b', files);

results.matches.forEach(match => {
  // Extract the actual matched text using regex
  const regex = /\b\w+Error\b/g;
  const matches = match.line.match(regex);
  
  if (matches) {
    matches.forEach(text => {
      console.log(`${match.path}:${match.lineNumber}: ${text}`);
    });
  }
});
```

---

## 🎯 Common Use Cases

### 1. Find All TODOs

```typescript
import { searchInDirectory } from 'ripgrep-wasm/node';

const results = await searchInDirectory(
  './src',
  'TODO|FIXME|XXX',  // Regex pattern
  {
    fileTypes: ['*.ts', '*.js'],
    ignorePatterns: ['*.test.ts']
  }
);

// Group by file
const byFile = new Map();
results.matches.forEach(match => {
  if (!byFile.has(match.path)) {
    byFile.set(match.path, []);
  }
  byFile.get(match.path).push(match);
});

byFile.forEach((matches, file) => {
  console.log(`\n${file} (${matches.length} items):`);
  matches.forEach(m => console.log(`  Line ${m.lineNumber}: ${m.line.trim()}`));
});
```

### 2. Search in Web-Based IDE

```typescript
import { ripgrep } from '@alife/grep-wasm';

async function searchInProject(pattern: string, options?: SearchOptions) {
  // Get files from virtual file system (WebContainer, browser File API, etc.)
  const files = await readFilesFromVirtualFS();
  
  // Filter files
  const filtered = await ripgrep.filterDirectoryFiles({
    rootPath: '/project',
    fileTypes: ['*.js', '*.ts'],
    ignorePatterns: ['node_modules', '.git']
  }, files.map(f => f.path));
  
  const filteredPaths = new Set(filtered.map(f => f.path));
  const filesToSearch = files.filter(f => filteredPaths.has(f.path));
  
  // Search
  return ripgrep.search(pattern, filesToSearch, options);
}
```

### 3. Extract File Paths from Results

```typescript
// Get unique file paths containing matches
const results = await search('pattern', files);
const filePaths = [...new Set(results.matches.map(m => m.path))];

console.log(`Found matches in ${filePaths.length} files`);
```

---

## 🛡️ Error Handling

@alife/grep-wasm provides structured error handling with detailed error information.

```typescript
import { ripgrep, RipgrepException } from '@alife/grep-wasm';

try {
  const results = await ripgrep.search('[invalid(regex', files);
} catch (error) {
  if (error instanceof RipgrepException) {
    console.error('Error type:', error.error.type);
    console.error('Message:', error.message);
    
    // Check specific error types
    if (error.isPatternError()) {
      console.error('Invalid regex pattern');
    } else if (error.isParseError()) {
      console.error('Failed to parse input');
    } else if (error.isSearchError()) {
      console.error('Search operation failed');
    }
    
    // Get error details
    const details = error.getDetails();
    console.error('Details:', details);
  }
}
```

**Error Types:**
- `ParseError`: Failed to parse JSON input
- `InvalidPattern`: Invalid regex pattern
- `SearchError`: Search operation failed
- `InvalidConfiguration`: Invalid configuration
- `FileError`: File operation error
- `MemoryError`: Memory-related error
- `SerializationError`: Failed to serialize results

---

## ⚙️ Building from Source

### Prerequisites

1. Install Rust and Cargo: https://rust-lang.org
2. Install wasm-pack:
   ```bash
   cargo install wasm-pack
   ```

### Build Commands

```bash
# Build WASM module
npm run build:wasm

# Build TypeScript wrapper
npm run build:ts

# Build everything
npm run build

# Clean build artifacts
npm run clean
```

---

## 📊 Performance Tips

### 1. Use File Filtering

Pre-filter files to reduce the search space:

```typescript
const filtered = await ripgrep.filterDirectoryFiles(config, allPaths);
// Then search only filtered files
```

### 2. Batch Processing

For large projects, process files in batches:

```typescript
async function searchLargeProject(pattern: string, allFiles: FileEntry[]) {
  const batchSize = 100;
  const allMatches = [];
  
  for (let i = 0; i < allFiles.length; i += batchSize) {
    const batch = allFiles.slice(i, i + batchSize);
    const results = await ripgrep.search(pattern, batch);
    allMatches.push(...results.matches);
  }
  
  return allMatches;
}
```

### 3. Optimize Search Options

- **Fixed strings** are faster than regex:
  ```typescript
  { fixedStrings: true }
  ```

- **Case-sensitive** is faster than case-insensitive:
  ```typescript
  { caseInsensitive: false }  // Default
  ```

### 4. Pre-initialize WASM

For better UX, initialize early:

```typescript
await ripgrep.init();  // Do this once at app startup
```

---

## 🌐 Browser vs Node.js

### Browser

- WASM module loads asynchronously
- No direct file system access - you must provide file contents
- Works great in web workers for non-blocking search

**Vite config:**
```javascript
// vite.config.js
export default {
  optimizeDeps: {
    exclude: ['@alife/grep-wasm']
  }
}
```

### Node.js

- Works out of the box with ESM (recommended) or CommonJS
- Use `@alife/grep-wasm/node` for directory-based search
- Direct file system access via helper functions

---

## 📂 Architecture

### Why No Direct Directory Search in Core SDK?

The core SDK (`@alife/grep-wasm`) **does not** directly access the file system because:
- 🌐 **Browsers**: WASM cannot access local file system (security)
- 📦 **WebContainer**: Requires virtual FS APIs
- 🟢 **Node.js**: Needs `fs` module integration

### Layered Design

```
┌─────────────────────────────────────┐
│   Application Layer                 │
│   - Browser: File API               │
│   - Node.js: fs module              │
│   - WebContainer: Virtual FS        │
└─────────────────────────────────────┘
           ↓ FileEntry[]
┌─────────────────────────────────────┐
│   ripgrep-wasm Core SDK             │
│   - Pattern matching                │
│   - Search logic                    │
│   - Result processing               │
└─────────────────────────────────────┘
```

### Node.js Integration

For Node.js, we provide `@alife/grep-wasm/node` which automatically handles file system operations:

```typescript
// Node.js - Automatic file reading
import { searchInDirectory } from '@alife/grep-wasm/node';
const results = await searchInDirectory('./src', 'pattern');

// Browser/WebContainer - Manual file reading
import { search } from '@alife/grep-wasm';
const files = await readFilesManually();  // Your implementation
const results = await search('pattern', files);
```

---

## 🔧 TypeScript Support

Full TypeScript support with comprehensive type definitions.

```typescript
import { ripgrep, SearchResult, FileEntry, SearchOptions } from '@alife/grep-wasm';

const files: FileEntry[] = [
  { path: 'test.js', content: 'function test() {}' }
];

const options: SearchOptions = {
  caseInsensitive: true,
  wordBoundary: false
};

const results: SearchResult = await ripgrep.search('test', files, options);

// Type-safe access
results.matches.forEach(match => {
  console.log(match.lineNumber);  // number
  console.log(match.line);        // string
});
```

---

## ❓ FAQ

### Q: How large is the WASM module?

The compressed WASM module is approximately 500KB gzipped. Actual size depends on build optimizations.

### Q: Can I use this in a web worker?

Yes! The module works perfectly in web workers for non-blocking search:

```typescript
// In worker.js
import { ripgrep } from '@alife/grep-wasm';

self.onmessage = async (e) => {
  const { pattern, files } = e.data;
  const results = await ripgrep.search(pattern, files);
  self.postMessage(results);
};
```

### Q: Does it support streaming large files?

Currently, files must be loaded into memory. For very large files, consider splitting them or processing in chunks.

### Q: How does it compare to native ripgrep?

This WASM version provides a subset of ripgrep's functionality optimized for browser/JS environments. It's faster than pure JavaScript implementations but slower than native ripgrep.

### Q: Can I use it without TypeScript?

Yes! The package works with plain JavaScript:

```javascript
const { ripgrep } = require('@alife/grep-wasm');

const results = await ripgrep.search('pattern', files);
console.log(results.totalMatches);
```

---

## 🎓 Examples

### Basic Search
```typescript
import { search } from '@alife/grep-wasm';

// Simple search
const results = await search('hello', files);

// Case-insensitive
const results = await search('hello', files, { caseInsensitive: true });

// Whole word
const results = await search('main', files, { wordBoundary: true });
```

### Advanced Filtering
```typescript
import { filterDirectoryFiles } from '@alife/grep-wasm';

const filtered = await filterDirectoryFiles({
  rootPath: '/project',
  fileTypes: ['*.js', '*.ts'],
  ignorePatterns: ['node_modules', 'dist'],
  maxDepth: 5,
  gitignoreFiles: [
    { path: '/project', content: 'node_modules/\n*.log\n' }
  ]
}, allFilePaths);
```

### Node.js Directory Search
```typescript
import { searchInDirectory, readDirectoryFiles } from '@alife/grep-wasm/node';

// Automatic search
const results = await searchInDirectory('./src', 'pattern', {
  fileTypes: ['*.js'],
  caseInsensitive: true
});

// Manual control
const files = await readDirectoryFiles('./src', {
  fileTypes: ['*.js'],
  maxDepth: 3
});
const results = await search('pattern', files);
```

---

## 🌟 Comparison

| Feature | @alife/grep-wasm | grep.js | Native ripgrep |
|---------|--------------|---------|----------------|
| Performance | ⚡ Fast | 🐌 Slow | 🚀 Fastest |
| TypeScript | ✅ Native | ❌ None | ❌ N/A |
| Browser Support | ✅ Yes | ✅ Yes | ❌ No |
| .gitignore Support | ✅ Yes | ❌ No | ✅ Yes |
| File Filtering | ✅ Advanced | ⚠️ Basic | ✅ Advanced |
| Error Handling | ✅ Structured | ❌ Basic | ⚠️ CLI only |
| Bundle Size | 📦 ~500KB | 📦 ~50KB | 📦 N/A |

---

## 📄 License

This project is dual-licensed under MIT OR Unlicense. Choose whichever you prefer.

## 💐 Credits

- Built on [ripgrep](https://github.com/BurntSushi/ripgrep) by Andrew Gallant
- Uses [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen) for Rust/JS interop

## 🔗 Related Projects

- [ripgrep](https://github.com/BurntSushi/ripgrep) - The original CLI tool
- [grep-regex](https://crates.io/crates/grep-regex) - Regex matching engine
- [ignore](https://crates.io/crates/ignore) - .gitignore processing

---

**Made with ❤️ for the web development community**
