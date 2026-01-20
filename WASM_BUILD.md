# Building ripgrep for WASM

This document describes how to build ripgrep as a WASM module for use in webcontainer environments.

## Overview

The WASM build provides a JavaScript-compatible interface to ripgrep's search functionality, allowing you to search through file contents in memory without requiring file system access.

## Prerequisites

1. **Rust and Cargo**: Install from [rustup.rs](https://rustup.rs/)
2. **wasm-pack**: Install with `cargo install wasm-pack`
3. **wasm32-unknown-unknown target**: Install with `rustup target add wasm32-unknown-unknown`

## Building

### Quick Build

```bash
cd crates/wasm
./build.sh
```

This will create the WASM module in `crates/wasm/pkg/`.

### Manual Build

```bash
cd crates/wasm
wasm-pack build --target web --out-dir pkg
```

### Build for Node.js

```bash
cd crates/wasm
wasm-pack build --target nodejs --out-dir pkg-node
```

## Project Structure

```
ripgrep/
├── crates/
│   └── wasm/              # WASM bindings crate
│       ├── src/
│       │   └── lib.rs     # Main WASM implementation
│       ├── Cargo.toml     # Crate configuration
│       ├── build.sh       # Build script
│       └── README.md      # Detailed usage documentation
└── WASM_BUILD.md          # This file
```

## Usage in WebContainer

The WASM module provides two main functions:

1. **`search`**: Full search with detailed results (line numbers, content, etc.)
2. **`grep`**: Simple grep that returns file paths containing matches

See `crates/wasm/README.md` for detailed API documentation and examples.

## Integration Example

```javascript
// Initialize WASM module
import init, { grep } from './ripgrep-wasm/pkg/ripgrep_wasm.js';
await init();

// Use in webcontainer
const files = [
  { path: "file1.txt", content: "Hello world\nFoo bar" },
  { path: "file2.txt", content: "Another file\nHello again" }
];

const result = grep("Hello", JSON.stringify(files));
const matchingFiles = JSON.parse(result);
// Returns: ["file1.txt", "file2.txt"]
```

## Features

- ✅ Regex pattern matching
- ✅ Case-insensitive search
- ✅ Fixed string matching
- ✅ Word boundary matching
- ✅ Line number reporting
- ✅ Multiple file search
- ✅ JSON-based API

## Limitations

- No file system access (files must be provided in memory)
- No directory traversal (must provide explicit file list)
- No .gitignore support (all provided files are searched)
- Binary file detection is limited

## Troubleshooting

### Build fails with "wasm-pack not found"

Install wasm-pack:
```bash
cargo install wasm-pack
```

### Build fails with "target not found"

Install the WASM target:
```bash
rustup target add wasm32-unknown-unknown
```

### Large WASM file size

The WASM module includes the full regex engine. For smaller builds, consider:
- Using `wasm-opt` to optimize: `wasm-opt -Os pkg/ripgrep_wasm_bg.wasm -o pkg/ripgrep_wasm_bg.wasm`
- Enabling LTO in release builds (already configured in Cargo.toml)
