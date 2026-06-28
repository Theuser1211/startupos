export function validateApiResponse<T>(
  data: T | null | undefined,
  name: string
): data is T {
  if (data === null || data === undefined) {
    console.warn(`[API Validation] ${name} is null or undefined`);
    return false;
  }
  return true;
}

export function safeAccess<T, R>(
  data: T | null | undefined,
  accessor: (data: T) => R | null | undefined,
  fallback: R
): R {
  if (data === null || data === undefined) return fallback;
  try {
    const result = accessor(data);
    return result ?? fallback;
  } catch {
    return fallback;
  }
}

export function safeString(
  value: string | null | undefined,
  fallback = ""
): string {
  return value ?? fallback;
}

export function safeNumber(
  value: number | null | undefined,
  fallback = 0
): number {
  return typeof value === "number" ? value : fallback;
}

export function safeArray<T>(
  value: T[] | null | undefined,
  fallback: T[] = []
): T[] {
  return Array.isArray(value) ? value : fallback;
}
