# @latentsignals/file-reader

Universal source file reader and syntax highlighter that formats any source file (`.go`, `.py`, `.ts`, `.rs`, `.ys`, `.yaml`, `.json`, etc.) ready for display in **terminals** (ANSI truecolor) and **web applications** (semantic HTML and styled components).

## Installation

```bash
pnpm add @latentsignals/file-reader
```

## Features

- **Multi-language auto-detection**: Recognizes file extensions for Go, Python, Rust, TypeScript, JavaScript, YAML, JSON, Bash, and 180+ languages.
- **Terminal output**: ANSI escape color codes, subtle line numbers, and formatted header banners.
- **Web app output**:
  - `web.html`: Clean semantic `<pre><code class="hljs">` HTML.
  - `web.htmlWithStyles`: Self-contained dark-theme HTML container ready for `dangerouslySetInnerHTML` / `v-html` / `innerHTML` without requiring external stylesheets.
- **TypeScript native**: Full type definitions for `FormattedFile`, `FileMetadata`, `WebOutput`, and options.
- **CLI tool**: Built-in CLI command to view or output files in terminal, HTML, or JSON.

## Programmatic Usage

```typescript
import {
  readFileFormatted,
  readFileSyncFormatted,
  formatContent,
} from '@latentsignals/file-reader';

// Asynchronously read and format any file
const result = await readFileFormatted(
  'poetries/uncollected-reference/lib/uncollected_reference.go'
);

// Print highlighted code with line numbers to terminal:
console.log(result.terminal);

// Use in a web application (React, Next.js, Vue, Svelte, etc.):
// <div dangerouslySetInnerHTML={{ __html: result.web.htmlWithStyles }} />

// Inspect metadata:
console.log(result.metadata.language); // 'go'
console.log(result.metadata.linesCount); // 47
console.log(result.metadata.byteSize); // 1179
```

### In-Memory Formatting

```typescript
import { formatContent } from '@latentsignals/file-reader';

const code = `def hello():\n    print("latent signals")`;
const formatted = formatContent(code, {
  language: 'python',
  showLineNumbers: true,
});

console.log(formatted.terminal);
```

## CLI Usage

```bash
# Print syntax-highlighted file to terminal
file-reader poetries/uncollected-reference/lib/uncollected_reference.py

# Output JSON structure with metadata and all representations
file-reader poetries/not-your-penelope/lib/not_your_penelope.rs --json

# Output self-contained styled HTML
file-reader poetries/uncollected-reference/lib/uncollected_reference.go --html
```
