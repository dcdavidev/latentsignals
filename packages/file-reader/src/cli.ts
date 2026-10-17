#!/usr/bin/env node
/**
 * cli.ts
 * ======
 *
 * Command-line interface for file-reader.
 */

import { readFileFormatted } from './formatter.js';

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith('--')));
const filePaths = args.filter((arg) => !arg.startsWith('--'));

if (filePaths.length === 0 || flags.has('--help') || flags.has('-h')) {
  console.log(`
Usage: file-reader <file-path> [options]

Options:
  --json          Output JSON with metadata, terminal, web, and raw formats
  --html          Output self-contained styled HTML ready for web browsers
  --raw           Output raw unformatted file content
  --no-numbers    Omit line numbers in terminal output
  --no-banner     Omit header/footer banner in terminal output
  --help, -h      Show this help message
`);
  process.exit(filePaths.length === 0 ? 1 : 0);
}

const filePath = filePaths[0];
const showLineNumbers = !flags.has('--no-numbers');
const showBanner = !flags.has('--no-banner');

try {
  const result = await readFileFormatted(filePath, {
    showLineNumbers,
    showBanner,
  });

  if (flags.has('--json')) {
    console.log(JSON.stringify(result, null, 2));
  } else if (flags.has('--html')) {
    console.log(result.web.htmlWithStyles);
  } else if (flags.has('--raw')) {
    console.log(result.raw);
  } else {
    console.log(result.terminal);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\u001B[31mError: ${message}\u001B[0m`);
  process.exit(1);
}
