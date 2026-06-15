const HEX_PATTERN = /^#([0-9A-Fa-f]{6})$/;

export function validateHex(color: string): boolean {
  return HEX_PATTERN.test(color.trim());
}

export function normalizeHex(color: string): string {
  const trimmed = color.trim();
  if (!validateHex(trimmed)) return '';
  return trimmed.toLowerCase();
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function mix(a: number, b: number, weight: number): number {
  return Math.round(a * (1 - weight) + b * weight);
}

function toHex(n: number): string {
  return Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
}

export function lighten(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  return `#${toHex(mix(r, 255, amount))}${toHex(mix(g, 255, amount))}${toHex(mix(b, 255, amount))}`;
}

export function darken(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  return `#${toHex(mix(r, 0, amount))}${toHex(mix(g, 0, amount))}${toHex(mix(b, 0, amount))}`;
}

export interface CourseColorStyles {
  cardBg: string;
  bar: string;
  text: string;
  iconBg: string;
}

export function hexToStyles(hex: string): CourseColorStyles {
  const base = normalizeHex(hex) || '#534ab7';
  return {
    cardBg: lighten(base, 0.88),
    bar: base,
    text: darken(base, 0.35),
    iconBg: lighten(base, 0.75),
  };
}

export function courseFolderStyleVars(hex: string): Record<string, string> {
  const styles = hexToStyles(hex);
  return {
    '--course-bar': styles.bar,
    '--course-card-bg': styles.cardBg,
    '--course-text': styles.text,
    '--course-icon-bg': styles.iconBg,
  };
}
