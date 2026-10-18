/**
 * poetries.server.ts
 * ==================
 *
 * Server-side helpers to locate, read, and syntax-highlight code poems from the monorepo.
 * Supports both compile-time Vite bundling (for serverless/Vercel/edge environments)
 * and runtime filesystem traversal (for local dev and standard containers).
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

// Vite compile-time bundle: embeds poetry packages and raw source files into the bundle
const BUNDLED_PACKAGES = import.meta.glob<Record<string, unknown>>(
  '../../../../poetries/*/package.json',
  {
    eager: true,
    import: 'default',
  }
);

const BUNDLED_FILES = import.meta.glob<string>(
  ['../../../../poetries/*/lib/*', '../../../../poetries/*/src/*'],
  {
    eager: true,
    query: '?raw',
    import: 'default',
  }
);

interface PackageJsonData {
  name?: string;
  description?: string;
}

/**
 * Extracts and compiles bundled poetry files into in-memory PoetryDetail records.
 *
 * @returns Map of poetry slug to PoetryDetail.
 */
function getBundledPoetries(): Record<string, PoetryDetail> {
  const result: Record<string, PoetryDetail> = {};

  for (const [filePath, pkgObj] of Object.entries(BUNDLED_PACKAGES)) {
    const match = filePath.match(/poetries\/([^/]+)\/package\.json$/);
    if (!match) continue;
    const slug = match[1];
    const pkg = pkgObj as PackageJsonData;

    const packageName = pkg.name || `@latentsignals/${slug}`;
    const description = pkg.description || '';

    result[slug] = {
      slug,
      packageName,
      title: slug.replaceAll('-', ' '),
      description,
      languages: [],
      files: {},
      defaultLanguageId: '',
    };
  }

  for (const [filePath, rawCode] of Object.entries(BUNDLED_FILES)) {
    const match = filePath.match(/poetries\/([^/]+)\/(?:lib|src)\/([^/]+)$/);
    if (!match) continue;
    const slug = match[1];
    const filename = match[2];

    if (!result[slug]) {
      result[slug] = {
        slug,
        packageName: `@latentsignals/${slug}`,
        title: slug.replaceAll('-', ' '),
        description: '',
        languages: [],
        files: {},
        defaultLanguageId: '',
      };
    }

    const ext = path.extname(filename);
    const mapped = EXTENSION_MAP[ext];
    if (mapped) {
      const linesCount = rawCode.split('\n').length;
      const byteSize = new TextEncoder().encode(rawCode).length;

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
        filename,
        linesCount,
        byteSize,
        rawCode,
        highlightedHtml,
      };

      result[slug].files[mapped.id] = langInfo;
      result[slug].languages.push(langInfo);
    }
  }

  for (const detail of Object.values(result)) {
    detail.languages.sort((a, b) => a.label.localeCompare(b.label));
    detail.defaultLanguageId =
      detail.languages.length > 0 ? detail.languages[0].id : '';
  }

  return result;
}

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
  // 1. Try bundled poetries first (instant in-memory resolution for Vercel/serverless/production)
  const bundled = getBundledPoetries();
  if (Object.keys(bundled).length > 0) {
    const summaries: PoetrySummary[] = Object.values(bundled).map((p) => ({
      slug: p.slug,
      packageName: p.packageName,
      title: p.title,
      description: p.description,
      languages: p.languages,
    }));
    summaries.sort((a, b) => a.slug.localeCompare(b.slug));
    return summaries;
  }

  // 2. Fallback to runtime filesystem traversal (local development/custom mounts)
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

    languages.sort((a, b) => a.label.localeCompare(b.label));

    summaries.push({
      slug,
      packageName,
      title: slug.replaceAll('-', ' '),
      description,
      languages,
    });
  }

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
  // 1. Try bundled poetries first (instant in-memory resolution for Vercel/serverless/production)
  const bundled = getBundledPoetries();
  if (Object.keys(bundled).length > 0) {
    return bundled[slug] ?? null;
  }

  // 2. Fallback to runtime filesystem traversal (local development/custom mounts)
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
