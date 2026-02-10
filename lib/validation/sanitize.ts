export function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/[<>]/g, "").slice(0, maxLength);
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

export function sanitizeFileName(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .replace(/[^a-zA-Z0-9._\-\s]/g, "")
    .slice(0, 255);
}

export function sanitizeFolderId(input: unknown): string | null {
  if (typeof input !== "string") return null;
  if (!isValidId(input)) return null;
  return input;
}

export function sanitizeQueryParam(
  input: string | null,
  defaultValue = "",
): string {
  if (!input) return defaultValue;
  return sanitizeString(input, 500);
}

export function validateFileUpload(file: File): {
  valid: boolean;
  error?: string;
} {
  const maxSize = 50 * 1024 * 1024;

  if (!file.name.endsWith(".pdf")) {
    return { valid: false, error: "only PDF files allowed" };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "file too large (max 50MB)" };
  }

  if (file.size === 0) {
    return { valid: false, error: "file is empty" };
  }

  return { valid: true };
}

export function sanitizeJson<T>(input: unknown): T | null {
  try {
    if (typeof input === "string") {
      return JSON.parse(input) as T;
    }
    return input as T;
  } catch {
    return null;
  }
}
