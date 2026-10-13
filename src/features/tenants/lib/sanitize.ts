// src/features/tenants/lib/sanitize.ts
// Applied while typing/pasting so a field can never hold characters it cannot accept.
export const digitsOnly = (v: string) => v.replace(/\D/g, "");
/** Digits plus the usual phone punctuation: + - ( ) . and spaces. */
export const phoneChars = (v: string) => v.replace(/[^\d+\-().\s]/g, "");
/** Lowercase, spaces become hyphens, anything else invalid is dropped ("Mi Resto!" -> "mi-resto"). */
export const slugChars = (v: string) => v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
/** Lowercase, no spaces, a pasted "https://" is removed. */
export const domainChars = (v: string) => v.toLowerCase().replace(/\s/g, "").replace(/^https?:\/\//, "");
