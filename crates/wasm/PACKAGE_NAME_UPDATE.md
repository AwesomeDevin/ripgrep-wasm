# 📦 包名更新记录

**更新时间**: 2026-01-19  
**旧包名**: `@alife/grep-wasm`  
**新包名**: `grep-wasm`

---

## ✅ 已更新的文件

### 1. 配置文件

- ✅ `package.json` - NPM 包配置（用户已更新）
  - `name: "grep-wasm"`
  - 仓库信息已更新为 `git@github.com:AwesomeDevin/ripgrep-wasm.git`

### 2. 文档文件

- ✅ `README.md` - 主文档
  - 标题改为 `# grep-wasm`
  - 所有安装命令更新为 `npm install grep-wasm`
  - 所有 import 语句更新为 `from 'grep-wasm'`
  - 徽章链接更新

- ✅ `API_REFERENCE.md` - API 参考文档
  - 所有代码示例中的包名更新

- ✅ `CHANGELOG.md` - 变更日志
  - 所有提到包名的地方更新

- ✅ `FINAL_SUMMARY.md` - 优化总结
  - 所有代码示例更新

- ✅ `pkg/README.md` - WASM 包文档（用户已更新）
  - 包名和示例代码已更新

### 3. 源代码文件

- ✅ `js/index.ts` - 主入口文件
  - JSDoc 注释中的包名和示例更新

- ✅ `js/sdk.ts` - SDK 实现
  - 注释中的包名更新

- ✅ `js/types.ts` - 类型定义
  - 注释中的包名更新

- ✅ `js/errors.ts` - 错误类
  - 注释中的包名更新

- ✅ `js/node-helpers.ts` - Node.js 辅助函数
  - 注释中的包名更新

### 4. 示例文件

- ✅ `example.js` - 基础示例
  - 注释中的包名更新

- ✅ `examples/webcontainer-integration.ts` - WebContainer 集成示例
  - 注释中的包名更新

### 5. 构建脚本

- ✅ `build.sh` - 构建脚本
  - 输出消息更新

---

## 📝 更新内容摘要

### 安装命令

**之前:**
```bash
npm install @alife/grep-wasm
pnpm add @alife/grep-wasm
yarn add @alife/grep-wasm
```

**现在:**
```bash
npm install grep-wasm
pnpm add grep-wasm
yarn add grep-wasm
```

### Import 语句

**之前:**
```typescript
import { ripgrep } from '@alife/grep-wasm';
import { searchInDirectory } from '@alife/grep-wasm/node';
```

**现在:**
```typescript
import { ripgrep } from 'grep-wasm';
import { searchInDirectory } from 'grep-wasm/node';
```

### NPM 徽章

**之前:**
```markdown
[![npm version](https://img.shields.io/npm/v/@alife/grep-wasm.svg)](https://www.npmjs.com/package/@alife/grep-wasm)
```

**现在:**
```markdown
[![npm version](https://img.shields.io/npm/v/grep-wasm.svg)](https://www.npmjs.com/package/grep-wasm)
```

---

## 🔄 需要重新构建

由于源代码已更新，需要重新编译 TypeScript 以更新 `dist/` 目录中的文件：

```bash
cd /Users/dengwen/ripgrep/crates/wasm

# 方式 1: 使用 npm scripts
npm run build:ts

# 方式 2: 直接运行 tsc
npx tsc

# 或完整构建（包括 WASM）
npm run build
```

编译后，`dist/` 目录中的所有 `.js` 和 `.d.ts` 文件将自动更新包名引用。

---

## 📋 验证清单

完成更新后，请验证以下内容：

- [ ] `package.json` 中的 `name` 字段为 `"grep-wasm"`
- [ ] 所有文档中的安装命令使用 `grep-wasm`
- [ ] 所有代码示例中的 import 使用 `grep-wasm`
- [ ] 重新构建 TypeScript 代码
- [ ] 运行测试确保一切正常
- [ ] Git 提交所有更改

### 验证命令

```bash
# 检查是否还有遗漏的旧包名
cd /Users/dengwen/ripgrep/crates/wasm
grep -r "@alife/grep-wasm" --exclude-dir=node_modules --exclude-dir=dist .

# 应该只在 node_modules 和 dist 中找到（需要重新构建）
```

---

## 🚀 发布流程

如果要发布新版本到 NPM：

```bash
# 1. 确保所有更改已提交
git status

# 2. 重新构建
npm run build

# 3. 更新版本号
npm version patch  # 或 minor, major

# 4. 发布到 NPM
npm publish

# 5. 推送到 Git
git push origin main --tags
```

---

## 📝 注意事项

### Rust Crate 名称

`Cargo.toml` 中的 crate 名称保持为 `ripgrep-wasm`，这是正确的：
- Rust crate 名称：`ripgrep-wasm` （内部使用）
- NPM 包名称：`grep-wasm` （对外发布）

这两者可以不同，不需要修改 `Cargo.toml`。

### 用户迁移

如果有现有用户使用 `@alife/grep-wasm`，需要提供迁移指南：

```typescript
// 旧版本
import { ripgrep } from '@alife/grep-wasm';

// 新版本 - 只需修改包名
import { ripgrep } from 'grep-wasm';

// API 完全相同，无需其他更改
```

---

## ✨ 更新完成

所有文档和源代码中的包名已成功从 `@alife/grep-wasm` 更新为 `grep-wasm`。

**下一步**: 运行 `npm run build` 重新构建项目。

---

**更新摘要**:
- 📄 更新文件数量: 12
- 🔄 需要重新构建: dist/ 目录
- ✅ 状态: 完成
