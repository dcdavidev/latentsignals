/* cspell:words hljs */

/**
 * formatter.ts
 * ============
 *
 * Core engine for reading and formatting code files for terminals and web apps.
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

import cliHighlightPkg from 'cli-highlight';
import hljs from 'highlight.js';

import { detectLanguage } from './languages.js';
import { DEFAULT_WEB_THEME_CSS } from './styles.js';
import type {
  FileMetadata,
  FormatOptions,
  FormattedContent,
  FormattedFile,
  WebOutput,
} from './types.js';

const highlightTerminal =
  typeof cliHighlightPkg === 'function'
    ? cliHighlightPkg
    : cliHighlightPkg.highlight;

/**
 * Escapes unsafe characters for HTML output.
 *
 * @param text Raw unescaped text.
 * @returns Escaped text safe for HTML rendering.
 */
function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * Generates terminal string with ANSI escape colors and line numbers.
 *
 * @param content Raw code string.
 * @param language Target language name.
 * @param showLineNumbers Whether to prepend line numbers.
 * @returns ANSI-colored terminal formatted code.
 */
function buildTerminalOutput(
  content: string,
  language: string,
  showLineNumbers: boolean
): string {
  let colored: string;
  try {
    colored = highlightTerminal(content, {
      language: language === 'plaintext' ? undefined : language,
      ignoreIllegals: true,
    });
  } catch {
    colored = content;
  }

  if (!showLineNumbers) {
    return colored;
  }

  const lines = colored.split('\n');
  const padLength = Math.max(String(lines.length).length, 3);

  return lines
    .map((line, idx) => {
      const num = String(idx + 1).padStart(padLength, ' ');
      return `\u001B[2m${num} │ \u001B[22m${line}`;
    })
    .join('\n');
}

/**
 * Formats highlighted code into web-ready HTML.
 *
 * @param content Raw code string.
 * @param language Target language name.
 * @param title Title or filename to display in the header.
 * @param linesCount Total number of lines.
 * @returns WebOutput containing both bare semantic HTML and self-contained styled HTML.
 */
function buildWebOutput(
  content: string,
  language: string,
  title: string,
  linesCount: number
): WebOutput {
  let highlightedValue: string;

  try {
    highlightedValue =
      language && language !== 'plaintext' && hljs.getLanguage(language)
        ? hljs.highlight(content, { language }).value
        : hljs.highlightAuto(content).value || escapeHtml(content);
  } catch {
    highlightedValue = escapeHtml(content);
  }

  const lines = highlightedValue.split('\n');
  const padLength = Math.max(String(lines.length).length, 3);

  const formattedLines = lines
    .map((line, idx) => {
      const num = String(idx + 1).padStart(padLength, ' ');
      return `<div class="latentsignals-line"><span class="latentsignals-line-number">${num}</span><span class="latentsignals-line-content">${line || '&nbsp;'}</span></div>`;
    })
    .join('');

  const html = `<pre class="latentsignals-code hljs language-${escapeHtml(language)}"><code>${formattedLines}</code></pre>`;

  const htmlWithStyles = `<div class="latentsignals-viewer">
  <style>${DEFAULT_WEB_THEME_CSS}</style>
  <div class="latentsignals-header">
    <span>${escapeHtml(title)}</span>
    <span>${escapeHtml(language)} • ${linesCount} lines</span>
  </div>
  ${html}
</div>`;

  return { html, htmlWithStyles };
}

/**
 * Formats an in-memory string of code into terminal and web-ready representations.
 *
 * @param content The raw source code to format.
 * @param options Optional configuration including language and display settings.
 * @returns FormattedContent object.
 */
export function formatContent(
  content: string,
  options?: FormatOptions
): FormattedContent {
  if (options?.forceColor !== false && !process.env.FORCE_COLOR) {
    process.env.FORCE_COLOR = '1';
  }

  const language = options?.language ?? 'plaintext';
  const showLineNumbers = options?.showLineNumbers ?? true;
  const linesCount = content.split('\n').length;
  const title = options?.title ?? `snippet.${language}`;

  const terminalBody = buildTerminalOutput(content, language, showLineNumbers);

  let terminal = terminalBody;
  if (options?.showBanner) {
    const header = `\u001B[1;36m┌── \u001B[1;37m${title}\u001B[0;36m [${language}] (${linesCount} lines)\u001B[0m\n`;
    const footer = `\n\u001B[36m└───\u001B[0m`;
    terminal = `${header}${terminalBody}${footer}`;
  }

  const web = buildWebOutput(content, language, title, linesCount);

  return {
    language,
    terminal,
    web,
    raw: content,
  };
}

/**
 * Asynchronously reads a file from disk and formats its content for terminals and web applications.
 *
 * @param filePath Path to the file.
 * @param options Optional formatting configuration.
 * @returns FormattedFile object containing metadata, terminal output, and web outputs.
 */
export async function readFileFormatted(
  filePath: string,
  options?: FormatOptions
): Promise<FormattedFile> {
  const resolvedPath = path.resolve(filePath);
  const stats = await fsp.stat(resolvedPath);
  const rawContent = await fsp.readFile(resolvedPath, 'utf8');

  const filename = path.basename(resolvedPath);
  const extension = path.extname(filename).toLowerCase();
  const language = options?.language ?? detectLanguage(filename);
  const linesCount = rawContent.split('\n').length;
  const byteSize = stats.size;
  const title = options?.title ?? filename;

  const metadata: FileMetadata = {
    path: resolvedPath,
    filename,
    extension,
    language,
    linesCount,
    byteSize,
  };

  const showLineNumbers = options?.showLineNumbers ?? true;
  const showBanner = options?.showBanner ?? true;

  const terminalBody = buildTerminalOutput(
    rawContent,
    language,
    showLineNumbers
  );

  let terminal = terminalBody;
  if (showBanner) {
    const header = `\u001B[1;36m┌── \u001B[1;37m${title}\u001B[0;36m [${language}] (${linesCount} lines, ${byteSize} B)\u001B[0m\n`;
    const footer = `\n\u001B[36m└───\u001B[0m`;
    terminal = `${header}${terminalBody}${footer}`;
  }

  const web = buildWebOutput(rawContent, language, title, linesCount);

  return {
    metadata,
    terminal,
    web,
    raw: rawContent,
  };
}

/**
 * Synchronously reads a file from disk and formats its content for terminals and web applications.
 *
 * @param filePath Path to the file.
 * @param options Optional formatting configuration.
 * @returns FormattedFile object containing metadata, terminal output, and web outputs.
 */
export function readFileSyncFormatted(
  filePath: string,
  options?: FormatOptions
): FormattedFile {
  const resolvedPath = path.resolve(filePath);
  const stats = fs.statSync(resolvedPath);
  const rawContent = fs.readFileSync(resolvedPath, 'utf8');

  const filename = path.basename(resolvedPath);
  const extension = path.extname(filename).toLowerCase();
  const language = options?.language ?? detectLanguage(filename);
  const linesCount = rawContent.split('\n').length;
  const byteSize = stats.size;
  const title = options?.title ?? filename;

  const metadata: FileMetadata = {
    path: resolvedPath,
    filename,
    extension,
    language,
    linesCount,
    byteSize,
  };

  const showLineNumbers = options?.showLineNumbers ?? true;
  const showBanner = options?.showBanner ?? true;

  const terminalBody = buildTerminalOutput(
    rawContent,
    language,
    showLineNumbers
  );

  let terminal = terminalBody;
  if (showBanner) {
    const header = `\u001B[1;36m┌── \u001B[1;37m${title}\u001B[0;36m [${language}] (${linesCount} lines, ${byteSize} B)\u001B[0m\n`;
    const footer = `\n\u001B[36m└───\u001B[0m`;
    terminal = `${header}${terminalBody}${footer}`;
  }

  const web = buildWebOutput(rawContent, language, title, linesCount);

  return {
    metadata,
    terminal,
    web,
    raw: rawContent,
  };
}
