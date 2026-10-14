// src/core/lib/deep-diff.ts
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Leaves of `next` that differ from `prev`, keeping the nesting. Arrays are compared and returned whole.
 * Keys whose new value is `undefined` are skipped. Returns {} when nothing changed.
 * Used to send PATCH requests with ONLY what changed (the API deep-merges what it receives).
 */
export function deepDiff(prev: unknown, next: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!isObj(next)) return out;
  for (const [key, nv] of Object.entries(next)) {
    if (nv === undefined) continue;
    const pv = isObj(prev) ? prev[key] : undefined;
    if (isObj(nv)) {
      const sub = deepDiff(pv, nv);
      if (Object.keys(sub).length > 0) out[key] = sub;
    } else if (JSON.stringify(pv) !== JSON.stringify(nv)) {
      out[key] = nv;
    }
  }
  return out;
}

/** Dotted paths of every leaf, e.g. { a: { b: 1 } } -> ["a.b"]. */
export function leafPaths(obj: unknown, prefix = ""): string[] {
  if (!isObj(obj)) return prefix ? [prefix] : [];
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return isObj(v) ? leafPaths(v, path) : [path];
  });
}
