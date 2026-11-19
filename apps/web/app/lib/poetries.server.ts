/**
 * poetries.server.ts
 * ==================
 *
 * Server-side helpers to read and syntax-highlight code poems.
 *
 * - Content: every poem is an npm package (`@latentsignals/{slug}`) installed as a
 *   dependency of this app. Sources and READMEs are read from `node_modules` and
 *   embedded into the server bundle at build time via `import.meta.glob`.
 * - Ordering: the list of published poems and their publication dates are fetched
 *   from the npm registry for the `latentsignals` organization (newest first).
 */

import path from 'node:path';

import hljs from 'highlight.js';
import { marked } from 'marked';

import { getOrgPublications } from './npm.server';

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
  version: string;
  title: string;
  description: string;
  languages: LanguageInfo[];
  /** ISO timestamp of the first npm publication, when known. */
  publishedAt?: string;
}

export interface PoetryDetail extends PoetrySummary {
  files: Record<string, LanguageFile>;
  defaultLanguageId: string;
  readme?: string;
  readmeHtml?: string;
}

const NPM_SCOPE = '@latentsignals';

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
  '.sh': { id: 'bash', label: 'Bash', hljsLang: 'bash' },
  '.ts': { id: 'typescript', label: 'TypeScript', hljsLang: 'typescript' },
};

// Vite compile-time bundle: embeds installed poetry packages from node_modules.
const BUNDLED_PACKAGES = import.meta.glob<Record<string, unknown>>(
  '/node_modules/@latentsignals/*/package.json',
  {
    eager: true,
    import: 'default',
  }
);

const BUNDLED_FILES = import.meta.glob<string>(
  [
    '/node_modules/@latentsignals/*/*.{go,mjs,js,py,rs,sh,ts}',
    '/node_modules/@latentsignals/*/README.md',
    '!/node_modules/@latentsignals/*/*.d.ts',
  ],
  {
    eager: true,
    query: '?raw',
    import: 'default',
  }
);

const PATH_PATTERN = /@latentsignals\/([^/]+)\/([^/]+)$/;

interface PackageJsonData {
  name?: string;
  version?: string;
  description?: string;
}

/**
 * Extracts a poetic description from file docstrings or comments.
 *
 * @param rawCode Source code of the poem.
 * @returns Extracted description string, or empty string if not found.
 */
function extractDescription(rawCode: string): string {
  const fileMatch = rawCode.match(/@file\s+([^\n\r*]+)/);
  if (fileMatch) return fileMatch[1].trim();

  const pyDocMatch = rawCode.match(/^"""[\s\S]*?\n\n([^\n]+)/);
  if (pyDocMatch) return pyDocMatch[1].trim();

  const goPkgMatch = rawCode.match(/^\/\/\s*Package\s+\w+\s+(.*)/m);
  if (goPkgMatch) return goPkgMatch[1].trim();

  return '';
}

/**
 * Builds an empty detail record for a slug.
 *
 * @param slug Poetry slug (package name without scope).
 * @returns Empty PoetryDetail.
 */
function createDetail(slug: string): PoetryDetail {
  return {
    slug,
    packageName: `${NPM_SCOPE}/${slug}`,
    version: '',
    title: slug.replaceAll('-', ' '),
    description: '',
    languages: [],
    files: {},
    defaultLanguageId: '',
  };
}

/**
 * Compiles the bundled poetry packages into in-memory PoetryDetail records.
 *
 * @returns Map of poetry slug to PoetryDetail.
 */
function buildBundledPoetries(): Record<string, PoetryDetail> {
  const result: Record<string, PoetryDetail> = {};

  for (const [filePath, pkgObj] of Object.entries(BUNDLED_PACKAGES)) {
    const match = filePath.match(PATH_PATTERN);
    if (!match) continue;
    const slug = match[1];
    const pkg = pkgObj as PackageJsonData;

    const detail = createDetail(slug);
    if (pkg.name) detail.packageName = pkg.name;
    detail.version = pkg.version ?? '';
    detail.description = pkg.description ?? '';
    result[slug] = detail;
  }

  for (const [filePath, rawCode] of Object.entries(BUNDLED_FILES)) {
    const match = filePath.match(PATH_PATTERN);
    if (!match) continue;
    const [, slug, filename] = match;
    const detail = (result[slug] ??= createDetail(slug));

    if (filename.toLowerCase() === 'readme.md') {
      detail.readme = rawCode;
      detail.readmeHtml = marked.parse(rawCode) as string;
      continue;
    }

    const ext = path.extname(filename);
    const mapped = EXTENSION_MAP[ext];
    if (!mapped) continue;

    if (!detail.description) {
      detail.description = extractDescription(rawCode);
    }

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
      linesCount: rawCode.split('\n').length,
      byteSize: new TextEncoder().encode(rawCode).length,
      rawCode,
      highlightedHtml,
    };

    detail.files[mapped.id] = langInfo;
    detail.languages.push(langInfo);
  }

  for (const detail of Object.values(result)) {
    detail.languages.sort((a, b) => a.label.localeCompare(b.label));
    detail.defaultLanguageId =
      detail.languages.length > 0 ? detail.languages[0].id : '';
  }

  return result;
}

let bundledCache: Record<string, PoetryDetail> | null = null;

/**
 * Returns the bundled poetries, compiling them once per server instance.
 *
 * @returns Map of poetry slug to PoetryDetail.
 */
function getBundledPoetries(): Record<string, PoetryDetail> {
  bundledCache ??= buildBundledPoetries();
  return bundledCache;
}

/**
 * Strips heavy fields from a detail record.
 *
 * @param detail Full poetry detail.
 * @param publishedAt Publication timestamp from the registry.
 * @returns Lightweight summary.
 */
function toSummary(detail: PoetryDetail, publishedAt?: string): PoetrySummary {
  return {
    slug: detail.slug,
    packageName: detail.packageName,
    version: detail.version,
    title: detail.title,
    description: detail.description,
    languages: detail.languages.map(
      ({ id, label, extension, filename, linesCount, byteSize }) => ({
        id,
        label,
        extension,
        filename,
        linesCount,
        byteSize,
      })
    ),
    publishedAt,
  };
}

/**
 * Lists the poems published on npm under the `latentsignals` organization,
 * newest publication first. Only packages installed in this app (and therefore
 * bundled) are returned, since their content is read from `node_modules`.
 *
 * Falls back to every bundled poem in alphabetical order when the registry
 * cannot be reached.
 *
 * @returns Sorted array of poetry summaries.
 */
export async function getAllPoetries(): Promise<PoetrySummary[]> {
  const bundled = getBundledPoetries();
  const publications = await getOrgPublications();

  if (!publications) {
    return Object.values(bundled)
      .map((detail) => toSummary(detail))
      .toSorted((a, b) => a.slug.localeCompare(b.slug));
  }

  const summaries: PoetrySummary[] = [];
  for (const { name, publishedAt } of publications) {
    const slug = name.slice(NPM_SCOPE.length + 1);
    const detail = bundled[slug];
    if (detail) summaries.push(toSummary(detail, publishedAt));
  }
  return summaries;
}

/**
 * Loads a poem by slug with all language variants and highlighted HTML.
 *
 * @param slug The poetry package name without scope.
 * @returns Detail object, or null if the package is not installed.
 */
export async function getPoetryBySlug(
  slug: string
): Promise<PoetryDetail | null> {
  const detail = getBundledPoetries()[slug];
  if (!detail) return null;

  const publications = await getOrgPublications();
  const publishedAt = publications?.find(
    (p) => p.name === detail.packageName
  )?.publishedAt;

  return { ...detail, publishedAt };
}
