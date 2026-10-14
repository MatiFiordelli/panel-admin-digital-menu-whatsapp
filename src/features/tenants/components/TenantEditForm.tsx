// src/features/tenants/components/TenantEditForm.tsx
import { useEffect, useMemo, useState } from "react";
import { get, useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UI_CONFIG } from "@/core/config/ui.config";
import { ApiError } from "@/core/lib/axios";
import { parseValidationErrors } from "@/core/lib/api-errors";
import { notify } from "@/core/notifications/notify";
import type { NotifyParams } from "@/core/notifications/params";
import type { Tenant } from "@/core/types";
import { LOCALES } from "@/features/tenants/config/tenant-template";
import { useUpdateTenant } from "@/features/tenants/hooks/useUpdateTenant";
import { countryOptions, flagOf } from "@/features/tenants/lib/countries";
import { getTimezoneGroups } from "@/features/tenants/lib/timezones";
import { buildPatch, changedLabels, LANGS, tenantLanguages, toFormValues, type Lang, type TenantEditValues } from "@/features/tenants/lib/tenant-edit.mapping";
import { buildTenantEditSchema } from "@/features/tenants/schemas/tenant-edit.schema";
import { LanguageTabs } from "@/features/tenants/components/LanguageTabs";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { TagsInput } from "@/shared/components/ui/TagsInput";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import { FormField } from "@/shared/components/ui/FormField";
import { btnPrimary, btnSecondary, inputCls } from "@/shared/components/ui/form-styles";
import { UnsavedChangesDialog } from "@/shared/components/UnsavedChangesDialog";
import { useUnsavedChangesGuard } from "@/shared/hooks/useUnsavedChangesGuard";

type V = TenantEditValues;
type P = Path<V>;

/** Server field paths -> form fields, to show API validation errors inline. */
const SERVER_FIELDS: Record<string, P> = {
  "metadata.plan": "plan", "metadata.locale": "locale", "metadata.timezone": "timezone", "metadata.contactEmail": "contactEmail",
  "metadata.customDomain": "customDomain", "metadata.trialEndsAt": "trialEndsAt", "business.companyInfo.name": "name",
};
// schema.org business types (the catalog is not only for food). `servesCuisine` only applies to the food ones.
const BUSINESS_TYPES = [
  "Restaurant", "FastFoodRestaurant", "CafeOrCoffeeShop", "Bakery", "BarOrPub", "IceCreamShop", "GroceryStore", "Store", "ClothingStore",
  "ElectronicsStore", "FurnitureStore", "HardwareStore", "PetStore", "BookStore", "JewelryStore", "HealthAndBeautyBusiness", "LocalBusiness",
];
const FOOD_TYPES = ["Restaurant", "FastFoodRestaurant", "CafeOrCoffeeShop", "Bakery", "BarOrPub", "IceCreamShop"];
const splitTags = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const card = "rounded-lg border border-ink/15 bg-surface p-4 md:p-5";
const legend = "mb-3 text-sm font-semibold";
const withClear = `${inputCls} pr-9`;
const idOf = (name: string) => name.replace(/\./g, "-");

export function TenantEditForm({ tenant }: { tenant: Tenant }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const update = useUpdateTenant();
  const [lang, setLang] = useState<Lang>("es");
  const [openSeo, setOpenSeo] = useState(false);
  const [openStructured, setOpenStructured] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ values: V; patch: Record<string, unknown>; paths: string[]; andBack: boolean } | null>(null);

  const languages = useMemo(() => tenantLanguages(tenant), [tenant]);
  const timezoneGroups = useMemo(() => getTimezoneGroups([...LOCALES.map((l) => l.timezone), tenant.metadata.timezone]), [tenant.metadata.timezone]);
  const initial = useMemo(() => toFormValues(tenant), [tenant]);
  const countries = useMemo(() => countryOptions(i18n.language), [i18n.language]);

  // Rebuilt when the language changes (translated messages) or when the saved data changes (what cannot be emptied).
  const schema = useMemo(
    () => buildTenantEditSchema(t, { hadDomain: !!initial.customDomain, hadLatitude: !!initial.structuredData.latitude, hadLongitude: !!initial.structuredData.longitude }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, initial.customDomain, initial.structuredData.latitude, initial.structuredData.longitude],
  );

  const { register, handleSubmit, watch, setValue, setError, reset, formState: { errors, isDirty } } = useForm<V>({
    resolver: zodResolver(schema),
    mode: UI_CONFIG.FORMS.VALIDATION_MODE,
    reValidateMode: "onChange",
    defaultValues: initial,
  });
  const values = watch();
  const { blocker, allowNextNavigation } = useUnsavedChangesGuard(isDirty && !update.isPending);

  // Saved data (re)loaded from the server becomes the new baseline.
  useEffect(() => { reset(initial); }, [initial, reset]);

  const err = (name: string): string | undefined => get(errors, name)?.message;
  const aria = (name: string) => ({ "aria-invalid": !!get(errors, name), "aria-describedby": `${idOf(name)}-msg` });
  const valueOf = (name: string) => String(get(values, name) ?? "");
  const clear = (name: P) => {
    setValue(name, "" as never, { shouldDirty: true, shouldValidate: true });
    document.getElementById(idOf(name))?.focus();
  };

  // Field builders: plain functions returning JSX (not components), so inputs never remount while typing.
  const text = (name: P, label: string, o: { placeholder?: string; hint?: string; type?: string; inputMode?: "text" | "decimal" | "numeric"; required?: boolean } = {}) => (
    <FormField id={idOf(name)} label={label} required={o.required} hint={o.hint} error={err(name)} clearable hasValue={valueOf(name) !== ""} onClear={() => clear(name)}>
      <input id={idOf(name)} type={o.type ?? "text"} inputMode={o.inputMode} className={withClear} placeholder={o.placeholder} autoComplete="off" aria-required={o.required || undefined} {...aria(name)} {...register(name)} />
    </FormField>
  );
  const area = (name: P, label: string, rows: number, o: { placeholder?: string; hint?: string; required?: boolean } = {}) => (
    <FormField id={idOf(name)} label={label} required={o.required} hint={o.hint} error={err(name)} clearable clearAlign="top" hasValue={valueOf(name) !== ""} onClear={() => clear(name)}>
      <textarea id={idOf(name)} rows={rows} className={withClear} placeholder={o.placeholder} aria-required={o.required || undefined} {...aria(name)} {...register(name)} />
    </FormField>
  );
  const select = (name: P, label: string, options: { value: string; label: string }[], hint?: string, required?: boolean) => {
    const cur = valueOf(name);
    const opts = cur === "" || options.some((x) => x.value === cur) ? options : [...options, { value: cur, label: cur }]; // keep an unknown stored value selectable
    return (
      <FormField id={idOf(name)} label={label} required={required} hint={hint} error={err(name)}>
        <select id={idOf(name)} className={inputCls} aria-required={required || undefined} {...aria(name)} {...register(name)}>
          {opts.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
        </select>
      </FormField>
    );
  };

  // Color field: native color picker + hex text box kept in sync (the text box is what gets validated and saved).
  const color = (name: P, label: string) => {
    const id = idOf(name);
    const v = valueOf(name);
    const valid = /^#[0-9a-fA-F]{6}$/.test(v);
    return (
      <FormField id={id} label={label} error={err(name)} clearable hasValue={v !== ""} onClear={() => clear(name)}>
        <div className="flex items-center gap-2">
          <input
            type="color" value={valid ? v.toLowerCase() : "#ffffff"} title={`${label}: ${t("tenants.edit.colorPicker")}`}
            aria-label={`${label}: ${t("tenants.edit.colorPicker")}`}
            onChange={(e) => setValue(name, e.target.value as never, { shouldDirty: true, shouldValidate: true })}
            className="h-10 w-12 shrink-0 rounded-md border border-ink/25 bg-surface p-1"
          />
          <input
            id={id} className={`${withClear} min-w-0 flex-1`} placeholder={t("tenants.placeholders.color")} autoComplete="off" spellCheck={false}
            {...aria(name)} {...register(name)}
          />
        </div>
      </FormField>
    );
  };

  // Country: a list in the interface language (typing the first letters jumps to it); the saved value is always a valid ISO code.
  const countrySelect = () => {
    const name = "structuredData.country" as P;
    const id = idOf(name);
    const cur = valueOf(name).toUpperCase();
    const known = cur === "" || countries.some((c) => c.code === cur);
    const currentName = countries.find((c) => c.code === cur)?.name ?? cur;
    return (
      <FormField id={id} label={t("tenants.fields.country")} hint={t("tenants.fields.countryHint")} error={err(name)}>
        <div className="flex items-center gap-2">
          <span aria-hidden title={currentName} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-ink/25 bg-surface text-xl">
            {cur ? flagOf(cur) : "🏳️"}
          </span>
          <select id={id} className={`${inputCls} min-w-0 flex-1`} {...aria(name)} {...register(name)}>
            <option value="">—</option>
            {!known && <option value={cur}>{cur}</option>}
            {countries.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
          </select>
        </div>
      </FormField>
    );
  };

  const errorLangs = LANGS.filter((l) => err(`appTitle.${l}`) || err(`appDescription.${l}`));
  const seoHasErrors = !!errors.seo;
  const structuredHasErrors = !!errors.structuredData;
  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" });

  /** Sets inline errors and returns the notification (key + params) with the SPECIFIC reason. */
  const explain = (e: unknown, v: V): { key: string; params?: NotifyParams } => {
    setFormError(null);
    if (!(e instanceof ApiError)) return { key: "tenants.updateError" };
    if (e.status === 0) return { key: "errors.network" };
    if (e.status === 404) return { key: "tenants.edit.notFound" };
    if (e.status === 409) {
      setError("customDomain", { message: t("tenants.errors.duplicate") });
      return { key: "tenants.errors.duplicateDomain", params: { domain: v.customDomain } };
    }
    if (e.status === 400) {
      const details: NotifyParams[string][] = [];
      const unmapped: string[] = [];
      for (const issue of parseValidationErrors(e.message)) {
        const field = SERVER_FIELDS[issue.field];
        if (field) {
          setError(field, { message: issue.message });
          details.push({ $t: `tenants.fields.${field}`, then: `: ${issue.message}` });
        } else {
          const msg = issue.field ? `${issue.field}: ${issue.message}` : issue.message;
          unmapped.push(msg); details.push(msg);
        }
      }
      if (unmapped.length) setFormError(unmapped.join(" · "));
      return { key: "tenants.errors.validation", params: { details } };
    }
    setFormError(e.message);
    return { key: "tenants.updateErrorDetail", params: { detail: e.message } };
  };

  // Submitting only validates and prepares the minimal patch; nothing is sent until the confirmation.
  const prepare = (andBack: boolean) => (v: V) => {
    const { patch, paths } = buildPatch(tenant, v);
    if (paths.length === 0) { notify.info("tenants.edit.noChanges"); return; }
    setPending({ values: v, patch, paths, andBack });
  };

  const doSave = () => {
    if (!pending) return;
    const p = pending;
    setPending(null);
    update.mutate({ id: tenant.id, patch: p.patch }, {
      onSuccess: () => {
        notify.success("tenants.updated", { name: p.values.name });
        reset(p.values);
        if (p.andBack) { allowNextNavigation(); navigate("/tenants"); }
      },
      onError: (e) => { const n = explain(e, p.values); notify.error(n.key, n.params); },
    });
  };

  const confirmBody = pending
    ? t("tenants.edit.confirmBody", { changes: changedLabels(pending.paths, t).join(", ") }) +
      (pending.paths.some((p) => p.startsWith("infra.cloudinary.cloudName")) ? `\n\n${t("tenants.edit.cloudWarning")}` : "")
    : "";

  const yesNo = [{ value: "true", label: t("tenants.fields.yes") }, { value: "false", label: t("tenants.fields.no") }];
  const localeOptions = LOCALES.map((l) => ({ value: l.id as string, label: l.label as string }));

  return (
    <>
      <p className="text-xs text-ink/70">
        {tenant.metadata.createdAt && <>{t("tenants.edit.created")}: {fmt.format(new Date(tenant.metadata.createdAt))}</>}
        {tenant.metadata.updatedAt && <> · {t("tenants.edit.updated")}: {fmt.format(new Date(tenant.metadata.updatedAt))}</>}
      </p>

      <form noValidate onSubmit={handleSubmit(prepare(false))} className="mt-3 space-y-4">
        <p className="text-xs text-ink/70">{t("common.requiredNote")}</p>
        <div className="grid gap-x-4 gap-y-2 md:grid-cols-[2fr_1fr]">
          {/* Main column */}
          <div className="space-y-4">
            <fieldset className={card}>
              <legend className="sr-only">{t("tenants.form.business")}</legend>
              <h2 className={legend}>{t("tenants.form.business")}</h2>
              {text("name", t("tenants.fields.name"), { placeholder: t("tenants.placeholders.name"), required: true })}
            </fieldset>

            <fieldset className={card}>
              <legend className="sr-only">{t("tenants.edit.publicText")}</legend>
              <h2 className={legend}>{t("tenants.edit.publicText")}</h2>
              <p className="-mt-2 mb-3 text-xs text-ink/70">{t("tenants.edit.publicTextHint")}</p>
              <LanguageTabs languages={languages} active={lang} onChange={(l) => setLang(l as Lang)} errorLangs={errorLangs} label={t("tenants.edit.publicText")} />
              <div key={lang} role="tabpanel" id="lang-panel" aria-labelledby={`lang-tab-${lang}`}>
                {text(`appTitle.${lang}`, t("tenants.fields.appTitle"), { placeholder: t("tenants.placeholders.title"), required: lang === "es" })}
                {area(`appDescription.${lang}`, t("tenants.fields.appDescription"), 3, { placeholder: t("tenants.placeholders.description"), required: lang === "es" })}
              </div>
            </fieldset>

            <details open={openSeo || seoHasErrors} onToggle={(e) => setOpenSeo((e.currentTarget as HTMLDetailsElement).open)} className={card}>
              <summary className="cursor-pointer text-sm font-semibold">{t("tenants.edit.seo")}</summary>
              <p className="mb-3 mt-2 text-xs text-ink/70">{t("tenants.edit.seoHint")}</p>
              {area("seo.keywords", t("tenants.fields.keywords"), 2, { placeholder: t("tenants.placeholders.keywords") })}
              <div className="grid gap-x-4 sm:grid-cols-2">
                {text("seo.ogImageId", t("tenants.fields.ogImageId"), { placeholder: t("tenants.placeholders.cloudId") })}
                {text("seo.appleIconId", t("tenants.fields.appleIconId"), { placeholder: t("tenants.placeholders.cloudId") })}
                {color("seo.themeColorLight", t("tenants.fields.themeColorLight"))}
                {color("seo.themeColorDark", t("tenants.fields.themeColorDark"))}
              </div>
              <h3 className="mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-ink/70">{t("tenants.edit.manifest")}</h3>
              <div className="grid gap-x-4 sm:grid-cols-2">
                {select("seo.manifest.orientation", t("tenants.fields.orientation"), ["", "any", "portrait", "landscape"].map((x) => ({ value: x, label: x || "—" })))}
                {select("seo.manifest.display", t("tenants.fields.display"), ["", "standalone", "fullscreen", "minimal-ui", "browser"].map((x) => ({ value: x, label: x || "—" })))}
                {text("seo.manifest.icon192Id", t("tenants.fields.icon192Id"), { placeholder: t("tenants.placeholders.cloudId") })}
                {text("seo.manifest.icon512Id", t("tenants.fields.icon512Id"), { placeholder: t("tenants.placeholders.cloudId") })}
                {text("seo.manifest.icon512MaskableId", t("tenants.fields.icon512MaskableId"), { placeholder: t("tenants.placeholders.cloudId") })}
                {text("seo.manifest.screenshotMobileId", t("tenants.fields.screenshotMobileId"), { placeholder: t("tenants.placeholders.cloudId") })}
                {text("seo.manifest.screenshotDesktopId", t("tenants.fields.screenshotDesktopId"), { placeholder: t("tenants.placeholders.cloudId") })}
                {color("seo.manifest.themeColor", t("tenants.fields.themeColor"))}
                {color("seo.manifest.backgroundColor", t("tenants.fields.backgroundColor"))}
              </div>
            </details>

            <details open={openStructured || structuredHasErrors} onToggle={(e) => setOpenStructured((e.currentTarget as HTMLDetailsElement).open)} className={card}>
              <summary className="cursor-pointer text-sm font-semibold">{t("tenants.edit.structured")}</summary>
              <div className="mt-3 grid gap-x-4 sm:grid-cols-2">
                {select("structuredData.type", t("tenants.fields.businessType"), BUSINESS_TYPES.map((x) => ({ value: x, label: t(`tenants.businessTypes.${x}`) })))}
                {select("structuredData.priceRange", t("tenants.fields.priceRange"), ["", "$", "$$", "$$$", "$$$$"].map((x) => ({ value: x, label: x || "—" })))}
                {text("structuredData.latitude", t("tenants.fields.latitude"), { placeholder: t("tenants.placeholders.latitude"), inputMode: "decimal" })}
                {text("structuredData.longitude", t("tenants.fields.longitude"), { placeholder: t("tenants.placeholders.longitude"), inputMode: "decimal" })}
                {text("structuredData.locality", t("tenants.fields.locality"), { placeholder: t("tenants.placeholders.locality") })}
                {text("structuredData.region", t("tenants.fields.region"), { placeholder: t("tenants.placeholders.region") })}
                {text("structuredData.postalCode", t("tenants.fields.postalCode"), { placeholder: t("tenants.placeholders.postalCode") })}
                {countrySelect()}
                {select("structuredData.acceptsReservations", t("tenants.fields.acceptsReservations"), yesNo)}
              </div>
              {FOOD_TYPES.includes(values.structuredData.type) && (
                <FormField id="structuredData-servesCuisine" label={t("tenants.fields.servesCuisine")} hint={t("tenants.fields.servesCuisineHint")} error={err("structuredData.servesCuisine")}>
                  <TagsInput
                    id="structuredData-servesCuisine" value={splitTags(values.structuredData.servesCuisine)}
                    onChange={(next) => setValue("structuredData.servesCuisine", next.join(", "), { shouldDirty: true, shouldValidate: true })}
                    placeholder={t("tenants.placeholders.cuisine")} removeLabel={t("common.remove")} label={t("tenants.fields.servesCuisine")}
                  />
                </FormField>
              )}
              {area("structuredData.openingHours", t("tenants.fields.openingHours"), 3, { hint: t("tenants.fields.openingHoursHint"), placeholder: t("tenants.placeholders.openingHours") })}
            </details>
          </div>

          {/* Secondary column */}
          <div className="space-y-4">
            <fieldset className={card}>
              <legend className="sr-only">{t("tenants.form.account")}</legend>
              <h2 className={legend}>{t("tenants.form.account")}</h2>
              <FormField id="slug" label={t("tenants.fields.slug")} hint={t("tenants.edit.slugHint")}>
                <input id="slug" value={tenant.metadata.slug} disabled readOnly className={inputCls} />
              </FormField>

              <div className="mb-1 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">{t("tenants.edit.statusLabel")}: {values.isActive ? t("tenants.active") : t("tenants.suspended")}</div>
                </div>
                <button
                  type="button" role="switch" aria-checked={values.isActive} aria-label={t("tenants.edit.statusLabel")}
                  onClick={() => setValue("isActive", !values.isActive, { shouldDirty: true })}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-text ${values.isActive ? "bg-brand" : "bg-ink/30"}`}
                >
                  <span className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform ${values.isActive ? "translate-x-5" : ""}`} />
                </button>
              </div>
              <p className="mb-2 min-h-8 text-xs leading-4 text-ink/70">{t("tenants.edit.statusHint")}</p>

              {select("plan", t("tenants.fields.plan"), (["trial", "basic", "pro", "premium"] as const).map((p) => ({ value: p, label: t(`tenants.plans.${p}`) })), undefined, true)}
              {values.plan === "trial" && (
                <FormField id="trialEndsAt" label={t("tenants.fields.trialEndsAt")} required error={err("trialEndsAt")} clearable hasValue={!!values.trialEndsAt} onClear={() => clear("trialEndsAt")} clearRight="right-9">
                  <input id="trialEndsAt" type="date" className={withClear} aria-required="true" {...aria("trialEndsAt")} {...register("trialEndsAt")} />
                </FormField>
              )}
              {text("contactEmail", t("tenants.fields.contactEmail"), { type: "email", placeholder: t("tenants.placeholders.contactEmail"), required: true })}
              {text("customDomain", t("tenants.fields.customDomain"), { hint: initial.customDomain ? t("tenants.edit.domainHint") : t("tenants.fields.customDomainHint"), placeholder: t("tenants.placeholders.customDomain"), required: !!initial.customDomain })}
            </fieldset>

            <fieldset className={card}>
              <legend className="sr-only">{t("tenants.form.region")}</legend>
              <h2 className={legend}>{t("tenants.form.region")}</h2>
              {select("locale", t("tenants.fields.locale"), localeOptions, undefined, true)}
              <FormField id="timezone" label={t("tenants.fields.timezone")} required error={err("timezone")}>
                <select id="timezone" className={inputCls} aria-required="true" {...aria("timezone")} {...register("timezone")}>
                  {timezoneGroups.map((g) => (
                    <optgroup key={g.region} label={g.region}>{g.zones.map((z) => <option key={z.value} value={z.value}>{z.label}</option>)}</optgroup>
                  ))}
                </select>
              </FormField>
            </fieldset>

            <fieldset className={card}>
              <legend className="sr-only">{t("tenants.form.images")}</legend>
              <h2 className={legend}>{t("tenants.form.images")}</h2>
              <p className="mb-3 text-xs text-ink/70">{t("tenants.fields.cloudinaryNote")}</p>
              {text("cloudName", t("tenants.fields.cloudName"), { placeholder: t("tenants.placeholders.cloudName"), required: true })}
              <div className="grid grid-cols-2 gap-x-3">
                <FormField id="defaultWidth" label={t("tenants.fields.defaultWidth")} required error={err("defaultWidth")} clearable hasValue={values.defaultWidth !== undefined && String(values.defaultWidth) !== ""} onClear={() => clear("defaultWidth")}>
                  <input
                    id="defaultWidth" type="number" inputMode="numeric" aria-required="true" min={16} max={4096} step={1} className={withClear} placeholder={t("tenants.placeholders.defaultWidth")}
                    onKeyDown={(e) => ["e", "E", "+", "-", ".", ","].includes(e.key) && e.preventDefault()}
                    {...aria("defaultWidth")} {...register("defaultWidth", { valueAsNumber: true })}
                  />
                </FormField>
                {select("defaultExtension", t("tenants.fields.defaultExtension"), ["webp", "avif", "jpg", "png"].map((x) => ({ value: x, label: x })))}
              </div>
            </fieldset>
          </div>
        </div>

        <div className="min-h-10">
          {formError && <p role="alert" className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">{formError}</p>}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Tooltip label={t("tooltips.cancel")}><button type="button" onClick={() => navigate("/tenants")} className={btnSecondary} disabled={update.isPending}>{t("tenants.form.cancel")}</button></Tooltip>
          <Tooltip label={t("tooltips.saveBack")}><button type="button" onClick={handleSubmit(prepare(true))} className={btnSecondary} disabled={update.isPending || !isDirty}>{t("tenants.edit.saveBack")}</button></Tooltip>
          <Tooltip label={t("tooltips.save")}>
            <button type="submit" className={btnPrimary} disabled={update.isPending || !isDirty}>
              {update.isPending ? t("tenants.edit.saving") : t("tenants.edit.save")}
            </button>
          </Tooltip>
        </div>
      </form>

      <ConfirmDialog
        open={pending !== null}
        title={t("tenants.edit.confirmTitle")} body={confirmBody}
        confirmLabel={t("tenants.edit.confirm")} cancelLabel={t("tenants.confirmCreate.review")}
        onCancel={() => setPending(null)} onConfirm={doSave}
      />
      <UnsavedChangesDialog blocker={blocker} />
    </>
  );
}
