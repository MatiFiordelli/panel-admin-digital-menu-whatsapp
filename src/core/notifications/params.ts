// src/core/notifications/params.ts
// Notification parameters must survive JSON (they are stored in localStorage) and be re-translatable.
// A value can be: text/number, a reference to a translation key ({ $t, then? }), or a list of those (joined with " · ").
import type { TFunction } from "i18next";

export type ParamValue = string | number | { $t: string; then?: string } | ParamValue[];
export type NotifyParams = Record<string, ParamValue>;

export function resolveParams(params: NotifyParams | undefined, t: TFunction): Record<string, string | number> {
  const one = (v: ParamValue): string | number =>
    Array.isArray(v) ? v.map(one).join(" · ") : typeof v === "object" ? `${t(v.$t)}${v.then ?? ""}` : v;
  return Object.fromEntries(Object.entries(params ?? {}).map(([k, v]) => [k, one(v)]));
}
