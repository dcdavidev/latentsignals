/**
 * types.ts
 * ========
 *
 * Type definitions for file-reader.
 */

/**
 * Metadata associated with a read and parsed file.
 */
export interface FileMetadata {
  /** Resolved path to the file. */
  path: string;
  /** Name of the file including extension. */
  filename: string;
  /** File extension (e.g., '.go', '.py', '.ts'). */
  extension: string;
  /** Canonical language identifier used for syntax highlighting. */
  language: string;
  /** Total number of lines in the file. */
  linesCount: number;
  /** Total size in bytes. */
  byteSize: number;
}

/**
 * Web-ready representations of highlighted code.
 */
export interface WebOutput {
  /** Semantic HTML fragment without embedded styles. */
  html: string;
  /** Complete standalone HTML element with embedded styles ready to render in web apps. */
  htmlWithStyles: string;
}

/**
 * Result of reading and formatting a file from disk.
 */
export interface FormattedFile {
  /** File metadata and language details. */
  metadata: FileMetadata;
  /** Terminal string formatted with ANSI escape color codes and line numbers. */
  terminal: string;
  /** Web-ready HTML outputs. */
  web: WebOutput;
  /** Raw unformatted file content. */
  raw: string;
}

/**
 * Result of formatting an in-memory string.
 */
export interface FormattedContent {
  /** Detected or specified language. */
  language: string;
  /** Terminal string formatted with ANSI escape color codes. */
  terminal: string;
  /** Web-ready HTML outputs. */
  web: WebOutput;
  /** Raw unformatted content. */
  raw: string;
}

/**
 * Formatting options.
 */
export interface FormatOptions {
  /** Explicit language override. If omitted, language is detected automatically. */
  language?: string;
  /** Whether to prefix lines with line numbers in terminal output. Defaults to true. */
  showLineNumbers?: boolean;
  /** Whether to include an ANSI header banner in terminal output. Defaults to true. */
  showBanner?: boolean;
  /** Optional custom title or filename for the banner. */
  title?: string;
  /** Force ANSI colors even in non-TTY environments. Defaults to true. */
  forceColor?: boolean;
}
