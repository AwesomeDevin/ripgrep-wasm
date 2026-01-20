/**
 * Advanced Search Example
 * 
 * Demonstrates advanced features like directory filtering,
 * .gitignore support, and error handling
 */

import { ripgrep, RipgrepException } from '../js/index';
import type { FileEntry, DirectorySearchConfig } from '../js/types';

async function main() {
  console.log('=== Advanced Search Examples ===\n');

  // Example 1: Directory filtering
  console.log('1. Filter files by type and ignore patterns:');
  
  const allFiles = [
    '/project/src/main.js',
    '/project/src/utils.js',
    '/project/src/main.test.js',
    '/project/node_modules/lib.js',
    '/project/dist/bundle.js',
    '/project/README.md',
    '/project/.git/config',
  ];

  const config: DirectorySearchConfig = {
    rootPath: '/project',
    maxDepth: 3,
    fileTypes: ['*.js'],
    ignorePatterns: ['node_modules', 'dist', '*.test.js'],
    includeHidden: false,
  };

  const filteredFiles = await ripgrep.filterDirectoryFiles(config, allFiles);
  console.log('   Filtered files:');
  filteredFiles.forEach((entry) => {
    console.log(`     ${entry.relativePath} (depth: ${entry.depth})`);
  });
  console.log();

  // Example 2: Search with .gitignore support
  console.log('2. Search with .gitignore patterns:');
  
  const filesWithContent: FileEntry[] = [
    { path: '/project/src/main.js', content: 'const API_KEY = "secret123";' },
    { path: '/project/src/utils.js', content: 'export function helper() {}' },
    { path: '/project/.env', content: 'API_KEY=secret123' },
  ];

  const configWithGitignore: DirectorySearchConfig = {
    rootPath: '/project',
    respectGitignore: true,
    gitignoreFiles: [
      {
        path: '/project',
        content: `node_modules/
dist/
.env
*.log`,
      },
    ],
  };

  try {
    const results = await ripgrep.searchDirectory(
      'API_KEY',
      configWithGitignore,
      filesWithContent
    );
    console.log(`   Found ${results.totalMatches} matches (respecting .gitignore)`);
    results.matches.forEach((match) => {
      console.log(`     ${match.path}:${match.lineNumber}`);
    });
  } catch (error) {
    if (error instanceof RipgrepException) {
      console.log(`   Error: ${error.message}`);
    }
  }
  console.log();

  // Example 3: Override and exclude patterns
  console.log('3. Using override and exclude patterns:');
  
  const configWithOverrides: DirectorySearchConfig = {
    rootPath: '/project',
    overridePatterns: ['src/**/*.js'], // Only include files matching this
    excludePatterns: ['**/*.test.js'], // But exclude test files
  };

  const moreFiles = [
    '/project/src/main.js',
    '/project/src/utils.js',
    '/project/src/main.test.js',
    '/project/docs/example.js',
  ];

  const filteredWithOverrides = await ripgrep.filterDirectoryFiles(
    configWithOverrides,
    moreFiles
  );
  console.log('   Filtered with overrides:');
  filteredWithOverrides.forEach((entry) => {
    console.log(`     ${entry.relativePath}`);
  });
  console.log();

  // Example 4: Error handling
  console.log('4. Error handling demonstration:');
  
  try {
    // Invalid regex pattern
    await ripgrep.search('[invalid(regex', filesWithContent);
  } catch (error) {
    if (error instanceof RipgrepException) {
      console.log(`   Caught error: ${error.message}`);
      console.log(`   Error type: ${error.error.type}`);
      
      if (error.isPatternError()) {
        console.log('   This is a pattern error');
        const details = error.getDetails();
        console.log('   Details:', details);
      }
    }
  }
  console.log();

  // Example 5: Command-line style grep
  console.log('5. Command-line style grep:');
  
  const simpleFiles: FileEntry[] = [
    { path: 'file1.txt', content: 'Hello World\nFoo Bar' },
    { path: 'file2.txt', content: 'hello there\nbaz qux' },
  ];

  // Equivalent to: grep -i -w "hello"
  const grepResults = await ripgrep.grepCmd(
    ['grep', '-i', '-w', 'hello'],
    simpleFiles
  );
  console.log(`   Files matching "hello" (case-insensitive, whole word):`);
  console.log(`   ${grepResults.join(', ')}`);
  console.log();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
