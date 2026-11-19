/**
 * npm.server.ts
 * =============
 *
 * Fetches the packages of the `latentsignals` npm organization and their
 * first publication dates from the public npm registry, with an in-memory cache.
 */

const REGISTRY_URL = 'https://registry.npmjs.org';
const NPM_ORG = 'latentsignals';
const CACHE_TTL_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 5000;

export interface NpmPublication {
  name: string;
  /** ISO timestamp of the first publication, when known. */
  publishedAt?: string;
}

interface Packument {
  time?: { created?: string };
}

let cache: { value: NpmPublication[]; expiresAt: number } | null = null;
let inflight: Promise<NpmPublication[] | null> | null = null;

/**
 * Performs a JSON GET request against the npm registry.
 *
 * @param url Registry URL.
 * @returns Parsed JSON body.
 */
async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`npm registry ${res.status} for ${url}`);
  }
  return (await res.json()) as T;
}

/**
 * Fetches organization packages and sorts them by first publication, newest first.
 *
 * @returns Sorted publications.
 */
async function fetchOrgPublications(): Promise<NpmPublication[]> {
  const packages = await getJson<Record<string, string>>(
    `${REGISTRY_URL}/-/org/${NPM_ORG}/package`
  );

  const publications = await Promise.all(
    Object.keys(packages).map(async (name): Promise<NpmPublication> => {
      try {
        const doc = await getJson<Packument>(
          `${REGISTRY_URL}/${name.replace('/', '%2f')}`
        );
        return { name, publishedAt: doc.time?.created };
      } catch {
        return { name };
      }
    })
  );

  return publications.toSorted((a, b) => {
    if (a.publishedAt && b.publishedAt) {
      return b.publishedAt.localeCompare(a.publishedAt);
    }
    if (a.publishedAt) return -1;
    if (b.publishedAt) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Returns the organization publications, newest first.
 * Serves a cached value for {@link CACHE_TTL_MS}; on registry failure it serves
 * the last known value, or null when nothing was ever fetched.
 *
 * @returns Sorted publications, or null if the registry is unreachable.
 */
export async function getOrgPublications(): Promise<NpmPublication[] | null> {
  if (cache && cache.expiresAt > Date.now()) return cache.value;

  inflight ??= fetchOrgPublications()
    .then((value) => {
      cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
      return value;
    })
    .catch((error: unknown) => {
      console.warn('[npm] failed to fetch organization packages:', error);
      return cache?.value ?? null;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}
