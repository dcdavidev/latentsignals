/**
 * poetries.server.ts
 * ==================
 *
 * Server-side helpers to locate, read, and syntax-highlight code poems from the monorepo.
 */

import fs from 'node:fs';
import path from 'node:path';

import hljs from 'highlight.js';

export interface LanguageInfo {
  id: string;
  label: string;
  extension: string;
  filename: string;
  linesCount: number;
  byteSize: number;
}

export interface LanguageFile extends LanguageInfo {
  rawCode: string;
  highlightedHtml: string;
}

export interface PoetrySummary {
  slug: string;
  packageName: string;
  title: string;
  description: string;
  languages: LanguageInfo[];
}

export interface PoetryDetail extends PoetrySummary {
  files: Record<string, LanguageFile>;
  defaultLanguageId: string;
}

const EXTENSION_MAP: Record<
  string,
  { id: string; label: string; hljsLang: string }
> = {
  '.go': { id: 'go', label: 'Go', hljsLang: 'go' },
  '.mjs': {
    id: 'javascript',
    label: 'JavaScript (ESM)',
    hljsLang: 'javascript',
  },
  '.js': { id: 'javascript', label: 'JavaScript', hljsLang: 'javascript' },
  '.py': { id: 'python', label: 'Python', hljsLang: 'python' },
  '.rs': { id: 'rust', label: 'Rust', hljsLang: 'rust' },
  '.ts': { id: 'typescript', label: 'TypeScript', hljsLang: 'typescript' },
};

/**
 * Locates the `poetries/` directory from an environment variable or directory tree traversal.
 *
 * @returns The absolute path to the `poetries/` directory.
 */
function getPoetriesDir(): string {
  if (
    process.env.POETRIES_DIR &&
    fs.existsSync(process.env.POETRIES_DIR) &&
    fs.statSync(process.env.POETRIES_DIR).isDirectory()
  ) {
    return process.env.POETRIES_DIR;
  }

  let curr = process.cwd();
  while (curr !== path.dirname(curr)) {
    const candidate = path.join(curr, 'poetries');
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
    curr = path.dirname(curr);
  }
  throw new Error('Poetries directory could not be located');
}

/**
 * Finds the source directory containing code files for a given poem (`lib/` or fallback `src/`).
 *
 * @param poetryDir The directory path of the poetry package.
 * @returns The path to the source directory, or null if none found.
 */
function getSourceDir(poetryDir: string): string | null {
  const libDir = path.join(poetryDir, 'lib');
  if (fs.existsSync(libDir) && fs.statSync(libDir).isDirectory()) {
    return libDir;
  }
  const srcDir = path.join(poetryDir, 'src');
  if (fs.existsSync(srcDir) && fs.statSync(srcDir).isDirectory()) {
    return srcDir;
  }
  return null;
}

/**
 * Scans and returns all poetry packages sorted in alphabetical order.
 *
 * @returns Sorted array of poetry summaries.
 */
export function getAllPoetries(): PoetrySummary[] {
  const poetriesDir = getPoetriesDir();
  const entries = fs.readdirSync(poetriesDir, { withFileTypes: true });

  const summaries: PoetrySummary[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) {
      continue;
    }

    const slug = entry.name;
    const poetryPath = path.join(poetriesDir, slug);
    const pkgPath = path.join(poetryPath, 'package.json');

    let packageName = `@latentsignals/${slug}`;
    let description = '';

    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.name) packageName = pkg.name;
        if (pkg.description) description = pkg.description;
      } catch {
        // ignore parse errors
      }
    }

    const sourceDir = getSourceDir(poetryPath);
    const languages: LanguageInfo[] = [];

    if (sourceDir) {
      const files = fs.readdirSync(sourceDir);
      for (const file of files) {
        const ext = path.extname(file);
        const mapped = EXTENSION_MAP[ext];
        if (mapped) {
          const filePath = path.join(sourceDir, file);
          const stat = fs.statSync(filePath);
          const content = fs.readFileSync(filePath, 'utf8');
          const linesCount = content.split('\n').length;

          languages.push({
            id: mapped.id,
            label: mapped.label,
            extension: ext,
            filename: file,
            linesCount,
            byteSize: stat.size,
          });
        }
      }
    }

    // Sort languages alphabetically by label
    languages.sort((a, b) => a.label.localeCompare(b.label));

    summaries.push({
      slug,
      packageName,
      title: slug.replaceAll('-', ' '),
      description,
      languages,
    });
  }

  // Sort poetries alphabetically by slug
  summaries.sort((a, b) => a.slug.localeCompare(b.slug));

  return summaries;
}

/**
 * Loads a poem by slug, extracts all available language variants, and generates syntax-highlighted HTML.
 *
 * @param slug The directory name of the poetry package.
 * @returns Detail object including syntax-highlighted code files, or null if not found.
 */
export function getPoetryBySlug(slug: string): PoetryDetail | null {
  const poetriesDir = getPoetriesDir();
  const poetryPath = path.join(poetriesDir, slug);

  if (!fs.existsSync(poetryPath) || !fs.statSync(poetryPath).isDirectory()) {
    return null;
  }

  const pkgPath = path.join(poetryPath, 'package.json');
  let packageName = `@latentsignals/${slug}`;
  let description = '';

  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.name) packageName = pkg.name;
      if (pkg.description) description = pkg.description;
    } catch {
      // ignore parse errors
    }
  }

  const sourceDir = getSourceDir(poetryPath);
  const languages: LanguageInfo[] = [];
  const files: Record<string, LanguageFile> = {};

  if (sourceDir) {
    const dirFiles = fs.readdirSync(sourceDir);
    for (const file of dirFiles) {
      const ext = path.extname(file);
      const mapped = EXTENSION_MAP[ext];
      if (mapped) {
        const filePath = path.join(sourceDir, file);
        const stat = fs.statSync(filePath);
        const rawCode = fs.readFileSync(filePath, 'utf8');
        const linesCount = rawCode.split('\n').length;

        let highlightedHtml: string;
        try {
          highlightedHtml = hljs.highlight(rawCode, {
            language: mapped.hljsLang,
          }).value;
        } catch {
          highlightedHtml = hljs.highlightAuto(rawCode).value;
        }

        const langInfo: LanguageFile = {
          id: mapped.id,
          label: mapped.label,
          extension: ext,
          filename: file,
          linesCount,
          byteSize: stat.size,
          rawCode,
          highlightedHtml,
        };

        languages.push(langInfo);
        files[mapped.id] = langInfo;
      }
    }
  }

  languages.sort((a, b) => a.label.localeCompare(b.label));

  const defaultLanguageId = languages.length > 0 ? languages[0].id : '';

  return {
    slug,
    packageName,
    title: slug.replaceAll('-', ' '),
    description,
    languages,
    files,
    defaultLanguageId,
  };
}
