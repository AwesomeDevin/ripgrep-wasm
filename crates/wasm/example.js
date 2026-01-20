/**
 * Example usage of ripgrep-wasm
 * 
 * This example demonstrates how to use the WASM module in a webcontainer environment.
 * 
 * To use this:
 * 1. Build the WASM module: ./build.sh
 * 2. Import and initialize the module
 * 3. Call the search or grep functions
 */

// Example: Using in a browser/ES module environment
async function example() {
  // Import the WASM module (adjust path as needed)
  const wasmModule = await import('./pkg/ripgrep_wasm.js');
  await wasmModule.default(); // Initialize WASM

  // Sample files to search
  const files = [
    {
      path: "src/main.rs",
      content: `fn main() {
    println!("Hello, world!");
    let x = 42;
    println!("The answer is {}", x);
}`
    },
    {
      path: "src/lib.rs",
      content: `pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

pub fn multiply(a: i32, b: i32) -> i32 {
    a * b
}`
    },
    {
      path: "README.md",
      content: `# My Project

This is a sample project.
It demonstrates how to use ripgrep-wasm.`
    }
  ];

  // Example 1: Simple grep - find files containing "main"
  console.log("=== Example 1: Simple grep ===");
  const grepResult = wasmModule.grep("main", JSON.stringify(files));
  const matchingFiles = JSON.parse(grepResult);
  console.log("Files containing 'main':", matchingFiles);
  // Output: ["src/main.rs", "README.md"]

  // Example 2: Full search with options
  console.log("\n=== Example 2: Full search ===");
  const searchOptions = {
    case_insensitive: false,
    fixed_strings: false,
    word_boundary: false,
    line_numbers: true
  };
  
  const searchResult = wasmModule.search(
    "println",
    JSON.stringify(files),
    JSON.stringify(searchOptions)
  );
  const results = JSON.parse(searchResult);
  console.log("Search results:", JSON.stringify(results, null, 2));
  
  // Example 3: Case-insensitive search
  console.log("\n=== Example 3: Case-insensitive search ===");
  const caseInsensitiveOptions = {
    case_insensitive: true,
    fixed_strings: false,
    word_boundary: false,
    line_numbers: true
  };
  
  const ciResult = wasmModule.search(
    "PROJECT",
    JSON.stringify(files),
    JSON.stringify(caseInsensitiveOptions)
  );
  const ciResults = JSON.parse(ciResult);
  console.log("Case-insensitive search results:", JSON.stringify(ciResults, null, 2));

  // Example 4: Fixed string search (literal matching)
  console.log("\n=== Example 4: Fixed string search ===");
  const fixedOptions = {
    case_insensitive: false,
    fixed_strings: true,
    word_boundary: false,
    line_numbers: true
  };
  
  const fixedResult = wasmModule.search(
    "fn main",
    JSON.stringify(files),
    JSON.stringify(fixedOptions)
  );
  const fixedResults = JSON.parse(fixedResult);
  console.log("Fixed string search results:", JSON.stringify(fixedResults, null, 2));

  // Example 5: Regex search
  console.log("\n=== Example 5: Regex search ===");
  const regexOptions = {
    case_insensitive: false,
    fixed_strings: false,
    word_boundary: false,
    line_numbers: true
  };
  
  const regexResult = wasmModule.search(
    "fn \\w+",  // Match "fn" followed by word characters
    JSON.stringify(files),
    JSON.stringify(regexOptions)
  );
  const regexResults = JSON.parse(regexResult);
  console.log("Regex search results:", JSON.stringify(regexResults, null, 2));
}

// Example: WebContainer integration
export async function webcontainerGrep(pattern, fileSystem) {
  /**
   * Integrate with WebContainer file system
   * 
   * @param {string} pattern - Search pattern
   * @param {FileSystem} fileSystem - WebContainer file system instance
   * @returns {Promise<string[]>} Array of file paths containing the pattern
   */
  const wasmModule = await import('./pkg/ripgrep_wasm.js');
  await wasmModule.default();

  // Collect all files from the file system
  // This is a simplified example - adjust based on your WebContainer API
  const files = [];
  
  // Traverse the file system and collect file contents
  // (Implementation depends on your WebContainer file system API)
  // Example:
  // for (const [path, content] of fileSystem.entries()) {
  //   if (typeof content === 'string') {
  //     files.push({ path, content });
  //   }
  // }

  const fileEntries = files.map(file => ({
    path: file.path,
    content: file.content
  }));

  const result = wasmModule.grep(pattern, JSON.stringify(fileEntries));
  return JSON.parse(result);
}

// Run example if in Node.js environment
if (typeof require !== 'undefined' && require.main === module) {
  example().catch(console.error);
}
