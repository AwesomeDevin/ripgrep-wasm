#!/bin/bash
set -e

echo "🔧 Building ripgrep-wasm..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v cargo &> /dev/null; then
    echo "❌ Cargo not found. Please install Rust: https://rustup.rs/"
    exit 1
fi

if ! command -v wasm-pack &> /dev/null; then
    echo "❌ wasm-pack not found. Installing..."
    cargo install wasm-pack
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

# Step 2: Clean previous builds
echo -e "${BLUE}Cleaning previous builds...${NC}"
rm -rf pkg dist
echo -e "${GREEN}✓ Clean complete${NC}"
echo ""

# Step 3: Build WASM module
echo -e "${BLUE}Building WASM module...${NC}"
wasm-pack build --target web --out-dir pkg

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ WASM build successful${NC}"
    
    # Get WASM file size
    if [ -f "pkg/ripgrep_wasm_bg.wasm" ]; then
        SIZE=$(ls -lh pkg/ripgrep_wasm_bg.wasm | awk '{print $5}')
        echo "   WASM size: $SIZE"
    fi
else
    echo "❌ WASM build failed"
    exit 1
fi
echo ""

# Step 4: Build TypeScript (if package.json exists)
if [ -f "package.json" ]; then
    echo -e "${BLUE}Building TypeScript wrapper...${NC}"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
    
    # Build TypeScript
    npx tsc
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ TypeScript build successful${NC}"
    else
        echo "⚠️  TypeScript build failed (optional)"
    fi
    echo ""
fi

# Step 5: Summary
echo -e "${GREEN}════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Build complete!${NC}"
echo -e "${GREEN}════════════════════════════════════${NC}"
echo ""
echo "📦 Output directories:"
echo "   - WASM module: ./pkg/"
if [ -d "dist" ]; then
    echo "   - TypeScript: ./dist/"
fi
echo ""
echo "🚀 Next steps:"
echo "   1. npm run build:ts  # Build TypeScript wrapper"
echo "   2. npm test         # Run tests"
echo "   3. npm publish      # Publish to npm"
echo ""
