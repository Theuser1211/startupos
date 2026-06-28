const STORAGE_KEY = "startupos-current-startup-id";

export function getStartupIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || params.get("startupId");
  } catch {
    return null;
  }
}

export function getPersistedStartupId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function persistStartupId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // localStorage may be full or unavailable
  }
}

export function clearPersistedStartupId(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage may be unavailable
  }
}

export function resolveStartupId(idFromParam: string | null): string | null {
  if (idFromParam) {
    persistStartupId(idFromParam);
    return idFromParam;
  }
  return getPersistedStartupId();
}
