// src/core/lib/api-errors.ts
// The API sends validation failures as a JSON array of "field: message" strings inside `message`.
export interface FieldIssue { field: string; message: string }

/** Parses `["metadata.slug: Required", ...]` (or a plain string) into field issues. Never throws. */
export function parseValidationErrors(message: string): FieldIssue[] {
  try {
    const parsed: unknown = JSON.parse(message);
    if (Array.isArray(parsed)) {
      return parsed.map((entry) => {
        const text = String(entry);
        const i = text.indexOf(": ");
        return i === -1 ? { field: "", message: text } : { field: text.slice(0, i), message: text.slice(i + 2) };
      });
    }
  } catch {
    /* not JSON: fall through */
  }
  return [{ field: "", message }];
}
