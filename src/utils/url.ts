/**
 * URL and base-path helpers for GitHub Pages subpath deployment.
 *
 * Always route internal page links and `public/` asset references through
 * `withBase()` so paths resolve properly under Astro's configured `base`
 * (e.g. `/visionlab-ai-learning-hub`).
 */

const HTTP_PROTOCOL_RE = /^https?:\/\//i;

/**
 * Normalizes Astro's `import.meta.env.BASE_URL` so it always begins with `/`
 * and ends without a trailing slash (or returns `""` when hosted at root).
 */
export function getNormalizedBase(): string {
  const rawBase = import.meta.env.BASE_URL ?? '/';
  const trimmed = rawBase.replace(/\/+$/, '');
  if (trimmed === '' || trimmed === '/') {
    return '';
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/**
 * Prefixes an internal path with the configured Astro base path.
 * External HTTP(S) URLs, hash-only links, and `mailto:` links are returned as-is.
 */
export function withBase(path: string): string {
  if (
    HTTP_PROTOCOL_RE.test(path) ||
    path.startsWith('#') ||
    path.startsWith('mailto:')
  ) {
    return path;
  }

  const base = getNormalizedBase();
  const cleanPath = path.replace(/^\/+/, '');

  if (cleanPath === '') {
    return base === '' ? '/' : `${base}/`;
  }

  return `${base}/${cleanPath}`;
}
