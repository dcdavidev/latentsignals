/**
 * languages.ts
 * ============
 *
 * Language detection and extension mapping.
 */

import path from 'node:path';

const EXTENSION_MAP: Record<string, string> = {
  // Go
  '.go': 'go',
  // Python
  '.py': 'python',
  '.pyw': 'python',
  '.pyi': 'python',
  // Rust
  '.rs': 'rust',
  // TypeScript & JavaScript
  '.ts': 'typescript',
  '.mts': 'typescript',
  '.cts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.jsx': 'javascript',
  // YAML / YAMLScript
  '.ys': 'yaml',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  // JSON
  '.json': 'json',
  '.jsonc': 'json',
  // Shell
  '.sh': 'bash',
  '.bash': 'bash',
  '.zsh': 'bash',
  // Markup & Styles
  '.html': 'html',
  '.htm': 'html',
  '.xml': 'xml',
  '.svg': 'xml',
  '.css': 'css',
  '.scss': 'scss',
  '.sass': 'scss',
  '.less': 'less',
  // Systems & Other
  '.c': 'c',
  '.h': 'c',
  '.cpp': 'cpp',
  '.hpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.cs': 'csharp',
  '.java': 'java',
  '.kt': 'kotlin',
  '.kts': 'kotlin',
  '.rb': 'ruby',
  '.php': 'php',
  '.sql': 'sql',
  '.toml': 'toml',
  '.ini': 'ini',
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.diff': 'diff',
  '.patch': 'diff',
  '.lua': 'lua',
  '.swift': 'swift',
  '.r': 'r',
  '.dart': 'dart',
  '.zig': 'zig',
};

const FILENAME_MAP: Record<string, string> = {
  Dockerfile: 'dockerfile',
  Makefile: 'makefile',
  GNUmakefile: 'makefile',
  CMakeLists: 'cmake',
  '.gitignore': 'bash',
  '.npmrc': 'ini',
  '.env': 'bash',
};

/**
 * Detects the canonical language for syntax highlighting based on filename or file extension.
 *
 * @param filenameOrPath Relative, absolute path or base filename.
 * @returns Canonical language name (e.g., 'python', 'go', 'rust', 'typescript', 'yaml', etc.).
 */
export function detectLanguage(filenameOrPath: string): string {
  const base = path.basename(filenameOrPath);
  if (FILENAME_MAP[base]) {
    return FILENAME_MAP[base];
  }

  const ext = path.extname(base).toLowerCase();
  if (ext && EXTENSION_MAP[ext]) {
    return EXTENSION_MAP[ext];
  }

  // Handle dotfiles like .eslintrc.json or similar
  const parts = base.split('.');
  if (parts.length > 2) {
    const subExt = `.${parts.at(-1)?.toLowerCase()}`;
    if (EXTENSION_MAP[subExt]) {
      return EXTENSION_MAP[subExt];
    }
  }

  return 'plaintext';
}
