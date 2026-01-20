/**
 * Basic Search Example
 * 
 * Demonstrates simple text search across files
 */

import { ripgrep } from '../js/index';
import type { FileEntry } from '../js/types';

async function main() {
  // Sample files to search
  const files: FileEntry[] = [
    {
      path: 'src/main.rs',
      content: `fn main() {
    println!("Hello, world!");
    let result = calculate(5, 10);
    println!("Result: {}", result);
}

fn calculate(a: i32, b: i32) -> i32 {
    a + b
}`,
    },
    {
      path: 'src/lib.rs',
      content: `pub fn hello() -> String {
    String::from("Hello from lib!")
}

pub fn calculate_sum(numbers: &[i32]) -> i32 {
    numbers.iter().sum()
}`,
    },
    {
      path: 'README.md',
      content: `# My Project

This project demonstrates Rust programming.

## Features
- Fast calculation
- Hello world example`,
    },
  ];

  console.log('=== Basic Search Examples ===\n');

  // Example 1: Simple case-sensitive search
  console.log('1. Search for "calculate" (case-sensitive):');
  const results1 = await ripgrep.search('calculate', files);
  console.log(`   Found ${results1.totalMatches} matches in ${results1.filesWithMatches} files`);
  results1.matches.forEach((match) => {
    console.log(`   ${match.path}:${match.lineNumber}: ${match.line.trim()}`);
  });
  console.log();

  // Example 2: Case-insensitive search
  console.log('2. Search for "HELLO" (case-insensitive):');
  const results2 = await ripgrep.search('HELLO', files, {
    caseInsensitive: true,
  });
  console.log(`   Found ${results2.totalMatches} matches`);
  results2.matches.forEach((match) => {
    console.log(`   ${match.path}:${match.lineNumber}: ${match.line.trim()}`);
  });
  console.log();

  // Example 3: Word boundary matching
  console.log('3. Search for whole word "sum":');
  const results3 = await ripgrep.search('sum', files, {
    wordBoundary: true,
    caseInsensitive: true,
  });
  console.log(`   Found ${results3.totalMatches} matches`);
  results3.matches.forEach((match) => {
    console.log(`   ${match.path}:${match.lineNumber}: ${match.line.trim()}`);
  });
  console.log();

  // Example 4: Regex search
  console.log('4. Search for function definitions (regex):');
  const results4 = await ripgrep.search(r'fn\s+\w+', files);
  console.log(`   Found ${results4.totalMatches} function definitions`);
  results4.matches.forEach((match) => {
    console.log(`   ${match.path}:${match.lineNumber}: ${match.line.trim()}`);
  });
  console.log();

  // Example 5: Simple grep (returns only file paths)
  console.log('5. Grep for files containing "calculate":');
  const matchingFiles = await ripgrep.grep('calculate', files, {
    caseInsensitive: true,
  });
  console.log(`   Files found: ${matchingFiles.join(', ')}`);
  console.log();
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
