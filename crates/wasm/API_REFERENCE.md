# API 参考文档 - @alife/grep-wasm

完整的 API 参数和返回值说明。

---

## 📖 目录

- [核心 API](#核心-api)
  - [search()](#search)
  - [filterDirectoryFiles()](#filterdirectoryfiles)
- [Node.js 辅助函数](#nodejs-辅助函数)
  - [searchInDirectory()](#searchindirectory)
  - [readDirectoryFiles()](#readdirectoryfiles)
- [类型定义](#类型定义)
- [错误处理](#错误处理)

---

## 核心 API

### search()

在文件中搜索模式，返回详细的匹配结果。

```typescript
search(pattern: string, files: FileEntry[], options?: SearchOptions): Promise<SearchResult>
```

#### 参数详解

##### pattern: string

搜索模式，支持字面量和正则表达式。

**示例：**
- `'TODO'` - 字面量搜索
- `'function\\s+\\w+'` - 正则表达式
- `'TODO|FIXME|XXX'` - 多个模式（OR）

##### files: FileEntry[]

要搜索的文件数组。

```typescript
interface FileEntry {
  path: string;      // 文件路径（用于结果标识）
  content: string;   // 文件内容（UTF-8 字符串）
}
```

##### options?: SearchOptions

可选的搜索配置。

```typescript
interface SearchOptions {
  // 大小写不敏感搜索（默认：false）
  // 等同于 grep -i
  caseInsensitive?: boolean;
  
  // 字面量匹配，不使用正则（默认：false）
  // 等同于 grep -F
  fixedStrings?: boolean;
  
  // 全词匹配（默认：false）
  // 等同于 grep -w
  wordBoundary?: boolean;
  
  // 包含行号（默认：true）
  // 等同于 grep -n
  lineNumbers?: boolean;
  
  // 输出格式（默认：'detailed'）
  // 'detailed': 完整匹配详情
  // 'files_only': 仅文件路径
  outputFormat?: 'detailed' | 'files_only';
}
```

**默认值：**
```typescript
{
  caseInsensitive: false,
  fixedStrings: false,
  wordBoundary: false,
  lineNumbers: true,
  outputFormat: 'detailed'
}
```

#### 返回值

```typescript
interface SearchResult {
  // 所有匹配结果数组
  matches: MatchResult[];
  
  // 总匹配数
  totalMatches: number;
  
  // 包含匹配的文件数
  filesWithMatches: number;
}

interface MatchResult {
  // 文件路径
  path: string;
  
  // 行号（1-indexed）
  lineNumber: number;
  
  // 完整行内容
  line: string;
  
  // 字节偏移（当前始终为 0）
  byteOffset: number;
}
```

#### 使用示例

```typescript
// 基础搜索
const results = await search('TODO', files);

// 大小写不敏感
const results = await search('error', files, {
  caseInsensitive: true
});

// 全词匹配
const results = await search('test', files, {
  wordBoundary: true
});

// 组合选项
const results = await search('function', files, {
  caseInsensitive: true,
  wordBoundary: true,
  lineNumbers: true
});
```

---

### filterDirectoryFiles()

根据配置过滤文件路径。

```typescript
filterDirectoryFiles(
  config: DirectorySearchConfig,
  filePaths: string[]
): Promise<FilePathEntry[]>
```

#### 参数详解

##### config: DirectorySearchConfig

过滤配置。

```typescript
interface DirectorySearchConfig {
  // 根目录路径（必需）
  rootPath: string;
  
  // 最大递归深度（可选，默认：无限制）
  maxDepth?: number;
  
  // 文件类型模式（可选，默认：[]）
  // 例如：['*.js', '*.ts']
  fileTypes?: string[];
  
  // 忽略模式（可选，默认：[]）
  // 例如：['node_modules', '*.min.js']
  ignorePatterns?: string[];
  
  // 是否尊重 .gitignore（可选，默认：true）
  respectGitignore?: boolean;
  
  // 是否包含隐藏文件（可选，默认：false）
  includeHidden?: boolean;
  
  // .gitignore 文件内容（可选）
  gitignoreFiles?: GitignoreFile[];
  
  // 覆盖模式-白名单（可选）
  overridePatterns?: string[];
  
  // 排除模式-黑名单（可选）
  excludePatterns?: string[];
}

interface GitignoreFile {
  path: string;      // .gitignore 所在目录
  content: string;   // .gitignore 内容
}
```

##### filePaths: string[]

要过滤的文件路径数组。

#### 返回值

```typescript
interface FilePathEntry {
  // 完整路径
  path: string;
  
  // 相对路径（相对于 rootPath）
  relativePath: string;
  
  // 深度（从 rootPath 开始，0-indexed）
  depth: number;
}
```

#### 使用示例

```typescript
const config = {
  rootPath: '/project',
  maxDepth: 5,
  fileTypes: ['*.ts', '*.js'],
  ignorePatterns: ['node_modules', 'dist'],
  respectGitignore: true
};

const filtered = await filterDirectoryFiles(config, allPaths);
```

---

## Node.js 辅助函数

### searchInDirectory()

自动读取并搜索目录中的所有文件。

```typescript
searchInDirectory(
  dirPath: string,
  pattern: string,
  options?: SearchOptions & DirectoryOptions
): Promise<SearchResult>
```

#### 参数

- `dirPath`: 目录路径
- `pattern`: 搜索模式
- `options`: 搜索和目录选项的组合

```typescript
interface DirectoryOptions {
  maxDepth?: number;
  fileTypes?: string[];
  ignorePatterns?: string[];
  includeHidden?: boolean;
}
```

#### 示例

```typescript
const results = await searchInDirectory(
  './src',
  'TODO',
  {
    fileTypes: ['*.ts', '*.js'],
    ignorePatterns: ['*.test.ts'],
    caseInsensitive: true,
    maxDepth: 5
  }
);
```

---

### readDirectoryFiles()

递归读取目录中的所有文件。

```typescript
readDirectoryFiles(
  dirPath: string,
  options?: DirectoryOptions
): Promise<FileEntry[]>
```

#### 返回

返回 `FileEntry[]` 数组，可直接传递给 `search()` 函数。

#### 示例

```typescript
const files = await readDirectoryFiles('./src', {
  fileTypes: ['*.js'],
  maxDepth: 3
});

const results = await search('pattern', files);
```

---

## 类型定义

### 完整类型列表

```typescript
// 文件条目
export interface FileEntry {
  path: string;
  content: string;
}

// 匹配结果
export interface MatchResult {
  path: string;
  lineNumber: number;
  line: string;
  byteOffset: number;
}

// 搜索结果
export interface SearchResult {
  matches: MatchResult[];
  totalMatches: number;
  filesWithMatches: number;
}

// 搜索选项
export interface SearchOptions {
  caseInsensitive?: boolean;
  fixedStrings?: boolean;
  wordBoundary?: boolean;
  lineNumbers?: boolean;
  outputFormat?: 'detailed' | 'files_only';
}

// 目录搜索配置
export interface DirectorySearchConfig {
  rootPath: string;
  maxDepth?: number;
  fileTypes?: string[];
  ignorePatterns?: string[];
  respectGitignore?: boolean;
  includeHidden?: boolean;
  gitignoreFiles?: GitignoreFile[];
  overridePatterns?: string[];
  excludePatterns?: string[];
}

// .gitignore 文件
export interface GitignoreFile {
  path: string;
  content: string;
}

// 文件路径条目
export interface FilePathEntry {
  path: string;
  relativePath: string;
  depth: number;
}
```

---

## 错误处理

### RipgrepException

自定义异常类，提供详细的错误信息。

```typescript
class RipgrepException extends Error {
  constructor(public readonly error: RipgrepError);
  
  // 类型检查方法
  isParseError(): boolean;
  isPatternError(): boolean;
  isSearchError(): boolean;
  isConfigError(): boolean;
  isFileError(): boolean;
  isMemoryError(): boolean;
  isSerializationError(): boolean;
  
  // 获取错误详情
  getDetails(): unknown;
}
```

### 错误类型

```typescript
enum RipgrepErrorKind {
  ParseError = 'ParseError',              // JSON 解析错误
  InvalidPattern = 'InvalidPattern',      // 无效的正则模式
  SearchError = 'SearchError',            // 搜索操作失败
  InvalidConfiguration = 'InvalidConfiguration', // 无效配置
  MemoryError = 'MemoryError',           // 内存错误
  FileError = 'FileError',                // 文件操作错误
  SerializationError = 'SerializationError' // 序列化错误
}
```

### 使用示例

```typescript
import { ripgrep, RipgrepException } from '@alife/grep-wasm';

try {
  const results = await ripgrep.search('[invalid(regex', files);
} catch (error) {
  if (error instanceof RipgrepException) {
    if (error.isPatternError()) {
      console.error('无效的正则表达式:', error.message);
      const details = error.getDetails();
      console.error('模式:', details.pattern);
    }
  }
}
```

---

## 性能建议

### 1. 使用文件类型过滤

```typescript
const config = {
  fileTypes: ['*.ts', '*.js'],  // 只搜索相关文件
  ignorePatterns: ['node_modules']
};
```

### 2. 限制搜索深度

```typescript
const config = {
  maxDepth: 5  // 限制递归深度
};
```

### 3. 批量处理

```typescript
const batchSize = 100;
for (let i = 0; i < files.length; i += batchSize) {
  const batch = files.slice(i, i + batchSize);
  await search(pattern, batch);
}
```

### 4. 使用固定字符串

```typescript
// 字面量匹配比正则快
await search('TODO', files, { fixedStrings: true });
```

---

## 完整示例

### 基础搜索

```typescript
import { search } from '@alife/grep-wasm';

const files = [
  { path: 'main.ts', content: 'function main() { /* TODO */ }' }
];

const results = await search('TODO', files, {
  caseInsensitive: true
});

console.log(`找到 ${results.totalMatches} 个匹配`);
```

### 目录搜索（Node.js）

```typescript
import { searchInDirectory } from '@alife/grep-wasm/node';

const results = await searchInDirectory(
  './src',
  'TODO',
  {
    fileTypes: ['*.ts'],
    recursive: true,
    caseInsensitive: true
  }
);

results.matches.forEach(match => {
  console.log(`${match.path}:${match.lineNumber}: ${match.line}`);
});
```

---

**完整文档**: [README.md](./README.md)
