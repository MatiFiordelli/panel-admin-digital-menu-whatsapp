// src/features/tenants/lib/timezones.ts
export interface TimezoneGroup { region: string; zones: { value: string; label: string }[] }

/** IANA time zones grouped by region (America, Europe...), for <select><optgroup>. */
export function getTimezoneGroups(extra: string[] = []): TimezoneGroup[] {
  const fn = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf;
  const all = new Set<string>(typeof fn === "function" ? fn("timeZone") : []);
  ["UTC", ...extra].forEach((z) => all.add(z)); // some browsers omit UTC; extras guarantee the defaults exist
  const groups = new Map<string, TimezoneGroup>();
  for (const z of [...all].sort()) {
    const i = z.indexOf("/");
    const region = i === -1 ? "UTC" : z.slice(0, i);
    const g = groups.get(region) ?? { region, zones: [] };
    g.zones.push({ value: z, label: i === -1 ? z : z.slice(i + 1).replace(/_/g, " ") });
    groups.set(region, g);
  }
  return [...groups.values()];
}
