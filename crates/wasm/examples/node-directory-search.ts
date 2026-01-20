/**
 * Node.js Directory Search Example
 * 
 * Demonstrates how to search files directly by directory path in Node.js
 */

import {
  searchInDirectory,
  grepInDirectory,
  watchAndSearch,
  getDirectoryStats,
} from '../js/node-helpers';

async function main() {
  console.log('=== Node.js Directory Search Example ===\n');

  // Example 1: Search in current directory
  console.log('1. Search for "function" in current directory:');
  try {
    const results = await searchInDirectory(
      process.cwd(),
      'function',
      {
        fileTypes: ['*.ts', '*.js'],
        ignorePatterns: ['node_modules', 'dist', '*.d.ts'],
        caseInsensitive: false,
        maxDepth: 3,
      }
    );

    console.log(`   Found ${results.totalMatches} matches in ${results.filesWithMatches} files`);
    
    // Show first 5 matches
    results.matches.slice(0, 5).forEach(match => {
      const relativePath = match.path.replace(process.cwd(), '.');
      console.log(`   ${relativePath}:${match.lineNumber}: ${match.line.trim()}`);
    });
    
    if (results.matches.length > 5) {
      console.log(`   ... and ${results.matches.length - 5} more matches`);
    }
  } catch (error) {
    console.error('   Error:', error);
  }
  console.log();

  // Example 2: Simple grep in directory
  console.log('2. Grep for "TODO" comments:');
  try {
    const files = await grepInDirectory(
      process.cwd(),
      'TODO',
      {
        fileTypes: ['*.ts', '*.js'],
        ignorePatterns: ['node_modules'],
        caseInsensitive: false,
        maxDepth: 2,
      }
    );

    if (files.length > 0) {
      console.log(`   Files with TODO comments:`);
      files.forEach(file => {
        const relativePath = file.replace(process.cwd(), '.');
        console.log(`     - ${relativePath}`);
      });
    } else {
      console.log('   No TODO comments found');
    }
  } catch (error) {
    console.error('   Error:', error);
  }
  console.log();

  // Example 3: Case-insensitive regex search
  console.log('3. Search for import statements:');
  try {
    const results = await searchInDirectory(
      process.cwd(),
      'import.*from',
      {
        fileTypes: ['*.ts', '*.js'],
        ignorePatterns: ['node_modules', 'dist'],
        caseInsensitive: false,
        maxDepth: 2,
      }
    );

    console.log(`   Found ${results.totalMatches} import statements`);
    
    // Group by file
    const byFile = new Map<string, number>();
    results.matches.forEach(match => {
      const count = byFile.get(match.path) || 0;
      byFile.set(match.path, count + 1);
    });

    console.log(`   Top files with most imports:`);
    Array.from(byFile.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([file, count]) => {
        const relativePath = file.replace(process.cwd(), '.');
        console.log(`     ${relativePath}: ${count} imports`);
      });
  } catch (error) {
    console.error('   Error:', error);
  }
  console.log();

  // Example 4: Get directory statistics
  console.log('4. Directory statistics:');
  try {
    const stats = await getDirectoryStats(
      process.cwd(),
      {
        fileTypes: ['*.ts', '*.js', '*.md'],
        ignorePatterns: ['node_modules', 'dist'],
      }
    );

    console.log(`   Total files: ${stats.totalFiles}`);
    console.log(`   Total size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
    console.log(`   Files by type:`);
    Object.entries(stats.filesByType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([ext, count]) => {
        console.log(`     ${ext}: ${count} files`);
      });

    console.log(`   Largest files:`);
    stats.largestFiles.slice(0, 3).forEach(file => {
      const relativePath = file.path.replace(process.cwd(), '.');
      console.log(`     ${relativePath}: ${(file.size / 1024).toFixed(2)} KB`);
    });
  } catch (error) {
    console.error('   Error:', error);
  }
  console.log();

  // Example 5: Watch directory for changes (optional, commented out)
  /*
  console.log('5. Watching for console.log statements (press Ctrl+C to stop):');
  const stopWatching = watchAndSearch(
    './src',
    'console\\.log',
    (file, matches) => {
      const relativePath = file.replace(process.cwd(), '.');
      if (matches.length > 0) {
        console.log(`   ${relativePath} has ${matches.length} console.log(s)`);
      } else {
        console.log(`   ${relativePath} - console.log removed`);
      }
    },
    {
      fileTypes: ['*.ts', '*.js'],
      debounceMs: 500,
    }
  );

  // Stop after 30 seconds
  setTimeout(() => {
    stopWatching();
    console.log('   Stopped watching');
  }, 30000);
  */
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
