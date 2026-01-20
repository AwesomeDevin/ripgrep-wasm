/**
 * WebContainer Integration Example
 * 
 * Demonstrates how to integrate grep-wasm with WebContainer environments
 */

import { ripgrep } from '../js/index';
import type { FileEntry, DirectorySearchConfig } from '../js/types';

/**
 * Simulated WebContainer file system interface
 */
interface WebContainerFS {
  readdir(path: string): Promise<string[]>;
  readFile(path: string): Promise<string>;
  isDirectory(path: string): Promise<boolean>;
}

/**
 * Helper to recursively read all files from WebContainer
 */
async function readAllFiles(
  fs: WebContainerFS,
  rootPath: string,
  currentPath: string = rootPath
): Promise<FileEntry[]> {
  const files: FileEntry[] = [];
  const entries = await fs.readdir(currentPath);

  for (const entry of entries) {
    const fullPath = `${currentPath}/${entry}`;
    const isDir = await fs.isDirectory(fullPath);

    if (isDir) {
      // Recursively read subdirectory
      const subFiles = await readAllFiles(fs, rootPath, fullPath);
      files.push(...subFiles);
    } else {
      // Read file content
      const content = await fs.readFile(fullPath);
      files.push({
        path: fullPath,
        content,
      });
    }
  }

  return files;
}

/**
 * Implement grep command for WebContainer
 */
async function webcontainerGrep(
  pattern: string,
  directory: string,
  fs: WebContainerFS,
  options?: {
    caseInsensitive?: boolean;
    wordBoundary?: boolean;
    fileTypes?: string[];
    ignorePatterns?: string[];
  }
): Promise<{ path: string; lineNumber: number; line: string }[]> {
  // Step 1: Read all files from the directory
  const allFiles = await readAllFiles(fs, directory);

  // Step 2: Get all file paths
  const filePaths = allFiles.map((f) => f.path);

  // Step 3: Filter files based on configuration
  if (options?.fileTypes || options?.ignorePatterns) {
    const config: DirectorySearchConfig = {
      rootPath: directory,
      fileTypes: options.fileTypes || [],
      ignorePatterns: options.ignorePatterns || ['node_modules', '.git'],
    };

    const filtered = await ripgrep.filterDirectoryFiles(config, filePaths);
    const filteredPaths = new Set(filtered.map((f) => f.path));

    // Keep only filtered files
    const filteredFiles = allFiles.filter((f) => filteredPaths.has(f.path));

    // Step 4: Perform search
    const results = await ripgrep.search(pattern, filteredFiles, {
      caseInsensitive: options?.caseInsensitive,
      wordBoundary: options?.wordBoundary,
    });

    return results.matches;
  } else {
    // No filtering, search all files
    const results = await ripgrep.search(pattern, allFiles, {
      caseInsensitive: options?.caseInsensitive,
      wordBoundary: options?.wordBoundary,
    });

    return results.matches;
  }
}

/**
 * Example usage with simulated WebContainer
 */
async function exampleUsage() {
  console.log('=== WebContainer Integration Example ===\n');

  // Simulate WebContainer file system
  const mockFS: WebContainerFS = {
    async readdir(path: string): Promise<string[]> {
      // Mock implementation
      if (path === '/project') {
        return ['src', 'package.json', 'README.md'];
      } else if (path === '/project/src') {
        return ['main.js', 'utils.js'];
      }
      return [];
    },

    async readFile(path: string): Promise<string> {
      // Mock implementation
      const mockFiles: Record<string, string> = {
        '/project/src/main.js': `import { helper } from './utils.js';

function main() {
  console.log('Hello from main');
  helper();
}

main();`,
        '/project/src/utils.js': `export function helper() {
  console.log('Helper function');
}`,
        '/project/package.json': `{
  "name": "my-project",
  "version": "1.0.0"
}`,
        '/project/README.md': `# My Project

A sample project demonstrating WebContainer integration.`,
      };
      return mockFiles[path] || '';
    },

    async isDirectory(path: string): Promise<boolean> {
      return path.includes('/src') || path === '/project';
    },
  };

  // Example 1: Search for "console" in all JavaScript files
  console.log('1. Search for "console" in JavaScript files:');
  const results1 = await webcontainerGrep('console', '/project', mockFS, {
    fileTypes: ['*.js'],
  });
  console.log(`   Found ${results1.length} matches:`);
  results1.forEach((match) => {
    console.log(`   ${match.path}:${match.lineNumber}: ${match.line.trim()}`);
  });
  console.log();

  // Example 2: Case-insensitive search for "FUNCTION"
  console.log('2. Case-insensitive search for "function":');
  const results2 = await webcontainerGrep('FUNCTION', '/project', mockFS, {
    caseInsensitive: true,
    fileTypes: ['*.js'],
  });
  console.log(`   Found ${results2.length} matches:`);
  results2.forEach((match) => {
    console.log(`   ${match.path}:${match.lineNumber}: ${match.line.trim()}`);
  });
  console.log();

  // Example 3: Quick grep to find files containing "import"
  const allFiles = await readAllFiles(mockFS, '/project');
  const matchingFiles = await ripgrep.grep('import', allFiles);
  console.log('3. Files containing "import":');
  console.log(`   ${matchingFiles.join(', ')}`);
  console.log();
}

// For demonstration purposes - comment out in actual WebContainer
exampleUsage().catch((error) => {
  console.error('Error:', error);
});

// Export the integration functions
export { webcontainerGrep, readAllFiles };
