const KEY = "smtp.recent_archetypes";
const MAX = 3;

export function readRecentArchetypes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function pushRecentArchetype(slug: string) {
  if (typeof window === "undefined" || !slug) return;
  try {
    const current = readRecentArchetypes().filter((s) => s !== slug);
    const next = [slug, ...current].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}
