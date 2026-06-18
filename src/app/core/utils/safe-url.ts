const ALLOWED_SCHEMES = ['http:', 'https:'];

/** Normalize bookmark URLs and reject dangerous schemes (e.g. javascript:). */
export function safeHttpUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withScheme);
    if (!ALLOWED_SCHEMES.includes(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

/** Display/open href for bookmark links. */
export function bookmarkHref(raw: string): string {
  return safeHttpUrl(raw) ?? '#';
}
