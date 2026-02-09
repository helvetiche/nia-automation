export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, 1000);
}

export function sanitizeNumber(input: unknown, min = 0, max = 1000000): number {
  const num = Number(input);
  if (isNaN(num)) return min;
  return Math.max(min, Math.min(max, num));
}

export function sanitizeBoolean(input: unknown): boolean {
  return Boolean(input);
}

export function sanitizeArray<T>(input: unknown, maxLength = 100): T[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, maxLength) as T[];
}

export function validateRequired(
  fields: Record<string, unknown>,
): { valid: true } | { valid: false; missing: string[] } {
  const missing = Object.entries(fields)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  return { valid: true };
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,128}$/.test(id);
}
