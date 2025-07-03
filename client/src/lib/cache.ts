// utils/cache.ts
export function getCached<T>(key: string, maxAgeMs: number): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts < maxAgeMs) return data;
  } catch {}
  return null;
}

export function setCached<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
}
