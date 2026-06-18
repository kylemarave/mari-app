/** Accept only same-origin relative paths (blocks open redirects). */
export function sanitizeReturnUrl(
  url: string | null | undefined,
  fallback = '/dashboard',
): string {
  if (!url) return fallback;
  const trimmed = url.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback;
  if (trimmed.includes('://') || trimmed.includes('\\')) return fallback;
  return trimmed;
}
