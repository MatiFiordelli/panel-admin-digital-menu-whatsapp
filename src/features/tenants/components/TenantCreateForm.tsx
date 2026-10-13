// src/features/tenants/components/TenantCreateForm.tsx
import { useMemo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/core/lib/axios";
import { parseValidationErrors } from "@/core/lib/api-errors";
import { UI_CONFIG } from "@/core/config/ui.config";
import { notify } from "@/core/notifications/notify";
import type { NotifyParams } from "@/core/notifications/params";
import { buildTenantConfig, buildTenantContent, LOCALES } from "@/features/tenants/config/tenant-template";
import { SanitizedInput } from "@/features/tenants/components/SanitizedInput";
import { digitsOnly, domainChars, phoneChars, slugChars } from "@/features/tenants/lib/sanitize";
import { getTimezoneGroups } from "@/features/tenants/lib/timezones";
import { buildTenantCreateSchema, type TenantCreateValues } from "@/features/tenants/schemas/tenant-create.schema";
import { useCreateTenant } from "@/features/tenants/hooks/useCreateTenant";
import type { CreateTenantPayload } from "@/features/tenants/services/tenants.service";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import { FormField } from "@/shared/components/ui/FormField";
import { UnsavedChangesDialog } from "@/shared/components/UnsavedChangesDialog";
import { btnPrimary, btnSecondary, inputCls } from "@/shared/components/ui/form-styles";
import { useUnsavedChangesGuard } from "@/shared/hooks/useUnsavedChangesGuard";

/** Server field paths -> form field names, to show API validation errors inline. */
const SERVER_FIELDS: Record<string, keyof TenantCreateValues> = {
  "metadata.slug": "slug", "metadata.plan": "plan", "metadata.locale": "locale", "metadata.timezone": "timezone",
  "metadata.contactEmail": "contactEmail", "metadata.customDomain": "customDomain", "metadata.trialEndsAt": "trialEndsAt",
};

const card = "rounded-lg border border-ink/15 bg-surface p-4 md:p-5";
const legend = "mb-3 text-sm font-semibold";
const clearable = `${inputCls} pr-9`; // room for the "X"

export function TenantCreateForm() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const create = useCreateTenant();
  const [pending, setPending] = useState<TenantCreateValues | null>(null); // values awaiting the "create?" confirmation
  const [formError, setFormError] = useState<string | null>(null);
  const timezoneGroups = useMemo(() => getTimezoneGroups(LOCALES.map((l) => l.timezone)), []);

  // Rebuilt when the language changes so validation messages stay translated.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const schema = useMemo(() => buildTenantCreateSchema(t), [i18n.language]);

  const { register, control, handleSubmit, watch, setValue, setError, formState: { errors, isDirty, dirtyFields } } =
    useForm<TenantCreateValues>({
      resolver: zodResolver(schema),
      mode: UI_CONFIG.FORMS.VALIDATION_MODE, // errors react while typing (see ui.config.ts)
      reValidateMode: "onChange",
      defaultValues: {
        name: "", address: "", phone: "", whatsappNumber: "",
        slug: "", plan: "basic", trialEndsAt: "", contactEmail: "", customDomain: "",
        locale: "es-AR", timezone: "America/Argentina/Buenos_Aires",
        cloudName: "dcc3vag3g", defaultWidth: 512, defaultExtension: "webp",
      },
    });

  const values = watch();
  const { plan, locale } = values;
  const { blocker, allowNextNavigation } = useUnsavedChangesGuard(isDirty && !create.isPending);

  // The timezone follows the region until the user picks one themselves.
  useEffect(() => {
    if (dirtyFields.timezone) return;
    const tz = LOCALES.find((l) => l.id === locale)?.timezone;
    if (tz) setValue("timezone", tz, { shouldDirty: false });
  }, [locale, dirtyFields.timezone, setValue]);

  const clear = (name: keyof TenantCreateValues) => {
    setValue(name, "" as never, { shouldDirty: true, shouldValidate: true });
    document.getElementById(name)?.focus();
  };
  const REQUIRED = new Set<keyof TenantCreateValues>(["name", "address", "phone", "whatsappNumber", "slug", "plan", "contactEmail", "locale", "timezone", "cloudName", "defaultWidth", "defaultExtension"]);
  const f = (name: keyof TenantCreateValues) => ({
    "aria-invalid": !!errors[name], "aria-describedby": `${name}-msg`,
    "aria-required": REQUIRED.has(name) || (name === "trialEndsAt" && plan === "trial") || undefined,
  });
  const c = (name: keyof TenantCreateValues) => ({ clearable: true, hasValue: !!values[name], onClear: () => clear(name) });

  const buildPayload = (v: TenantCreateValues): CreateTenantPayload => ({
    metadata: {
      slug: v.slug, plan: v.plan, locale: v.locale, timezone: v.timezone, contactEmail: v.contactEmail,
      isActive: true, version: "1.0.0",
      ...buildTenantContent(v.name),
      ...(v.customDomain ? { customDomain: v.customDomain } : {}),
      ...(v.plan === "trial" && v.trialEndsAt ? { trialEndsAt: new Date(`${v.trialEndsAt}T23:59:59`).toISOString() } : {}),
    },
    ...buildTenantConfig(v),
  });

  /** Sets inline errors and returns the notification (translation key + params) with the SPECIFIC reason. */
  const explain = (e: unknown, v: TenantCreateValues): { key: string; params?: NotifyParams } => {
    setFormError(null);
    if (!(e instanceof ApiError)) return { key: "tenants.createError" };
    if (e.status === 0) return { key: "errors.network" };

    if (e.status === 409) {
      // The API may say which field collided (field/code); otherwise it is inferred from the message.
      const byApi = e.field === "customDomain" || e.code === "DUPLICATE_CUSTOM_DOMAIN" ? "customDomain"
        : e.field === "slug" || e.code === "DUPLICATE_SLUG" ? "slug" : null;
      const field = byApi ?? (/domain/i.test(e.message) ? "customDomain" : /slug/i.test(e.message) || !v.customDomain ? "slug" : null);
      const dup = t("tenants.errors.duplicate");
      if (field === "slug") { setError("slug", { message: dup }); return { key: "tenants.errors.duplicateSlug", params: { slug: v.slug } }; }
      if (field === "customDomain") { setError("customDomain", { message: dup }); return { key: "tenants.errors.duplicateDomain", params: { domain: v.customDomain } }; }
      setError("slug", { message: dup }); setError("customDomain", { message: dup });
      return { key: "tenants.errors.duplicateEither", params: { slug: v.slug, domain: v.customDomain } };
    }

    if (e.status === 400) {
      const details: NotifyParams[string][] = [];
      const unmapped: string[] = [];
      for (const issue of parseValidationErrors(e.message)) {
        const field = SERVER_FIELDS[issue.field];
        if (field) {
          setError(field, { message: issue.message });
          details.push({ $t: `tenants.fields.${field}`, then: `: ${issue.message}` }); // label is re-translated later
        } else {
          const text = issue.field ? `${issue.field}: ${issue.message}` : issue.message;
          unmapped.push(text); details.push(text);
        }
      }
      if (unmapped.length) setFormError(unmapped.join(" · "));
      return { key: "tenants.errors.validation", params: { details } };
    }

    setFormError(e.message);
    return { key: "tenants.createErrorDetail", params: { detail: e.message } };
  };

  const confirmCreate = () => {
    if (!pending) return;
    const v = pending;
    setPending(null);
    create.mutate(buildPayload(v), {
      onSuccess: () => {
        notify.success("tenants.created", { name: v.name });
        allowNextNavigation();
        navigate("/tenants");
      },
      onError: (e) => { const n = explain(e, v); notify.error(n.key, n.params); },
    });
  };

  return (
    <>
      {/* Submitting (button or Enter) only validates; nothing is sent until the confirmation. */}
      <form noValidate onSubmit={handleSubmit((v) => setPending(v))} className="space-y-4">
        <p className="text-xs text-ink/70">{t("common.requiredNote")}</p>
        <div className="grid gap-x-4 gap-y-2 md:grid-cols-[2fr_1fr]">
          {/* Main column: the business */}
          <div className="space-y-4">
            <fieldset className={card}>
              <legend className="sr-only">{t("tenants.form.business")}</legend>
              <h2 className={legend}>{t("tenants.form.business")}</h2>
              <div className="grid gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormField id="name" required label={t("tenants.fields.name")} error={errors.name?.message} {...c("name")}>
                    <input id="name" className={clearable} placeholder={t("tenants.placeholders.name")} autoComplete="off" {...f("name")} {...register("name")} />
                  </FormField>
                </div>
                <div className="sm:col-span-2">
                  <FormField id="address" required label={t("tenants.fields.address")} error={errors.address?.message} {...c("address")}>
                    <input id="address" className={clearable} placeholder={t("tenants.placeholders.address")} autoComplete="off" {...f("address")} {...register("address")} />
                  </FormField>
                </div>
                <FormField id="phone" required label={t("tenants.fields.phone")} hint={t("tenants.fields.phoneHint")} error={errors.phone?.message} {...c("phone")}>
                  <SanitizedInput control={control} name="phone" sanitize={phoneChars} id="phone" type="tel" inputMode="tel" className={clearable} placeholder={t("tenants.placeholders.phone")} autoComplete="off" {...f("phone")} />
                </FormField>
                <FormField id="whatsappNumber" required label={t("tenants.fields.whatsapp")} hint={t("tenants.fields.whatsappHint")} error={errors.whatsappNumber?.message} {...c("whatsappNumber")}>
                  <SanitizedInput control={control} name="whatsappNumber" sanitize={digitsOnly} id="whatsappNumber" inputMode="numeric" pattern="[0-9]*" className={clearable} placeholder={t("tenants.placeholders.whatsapp")} autoComplete="off" {...f("whatsappNumber")} />
                </FormField>
              </div>
            </fieldset>

            <fieldset className={card}>
              <legend className="sr-only">{t("tenants.form.region")}</legend>
              <h2 className={legend}>{t("tenants.form.region")}</h2>
              <div className="grid gap-x-4 sm:grid-cols-2">
                <FormField id="locale" required label={t("tenants.fields.locale")} error={errors.locale?.message}>
                  <select id="locale" className={inputCls} {...f("locale")} {...register("locale")}>
                    {LOCALES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                </FormField>
                <FormField id="timezone" required label={t("tenants.fields.timezone")} error={errors.timezone?.message}>
                  <select id="timezone" className={inputCls} {...f("timezone")} {...register("timezone")}>
                    {timezoneGroups.map((g) => (
                      <optgroup key={g.region} label={g.region}>
                        {g.zones.map((z) => <option key={z.value} value={z.value}>{z.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </FormField>
              </div>
            </fieldset>
          </div>

          {/* Secondary column: account + images */}
          <div className="space-y-4">
            <fieldset className={card}>
              <legend className="sr-only">{t("tenants.form.account")}</legend>
              <h2 className={legend}>{t("tenants.form.account")}</h2>
              <FormField id="slug" required label={t("tenants.fields.slug")} hint={t("tenants.fields.slugHint")} error={errors.slug?.message} {...c("slug")}>
                <SanitizedInput control={control} name="slug" sanitize={slugChars} id="slug" className={clearable} placeholder={t("tenants.placeholders.slug")} autoComplete="off" autoCapitalize="none" spellCheck={false} {...f("slug")} />
              </FormField>
              <FormField id="plan" required label={t("tenants.fields.plan")} error={errors.plan?.message}>
                <select id="plan" className={inputCls} {...f("plan")} {...register("plan")}>
                  {(["trial", "basic", "pro", "premium"] as const).map((p) => <option key={p} value={p}>{t(`tenants.plans.${p}`)}</option>)}
                </select>
              </FormField>
              {plan === "trial" && (
                <FormField id="trialEndsAt" required label={t("tenants.fields.trialEndsAt")} error={errors.trialEndsAt?.message} {...c("trialEndsAt")} clearRight="right-9">
                  <input id="trialEndsAt" type="date" className={clearable} {...f("trialEndsAt")} {...register("trialEndsAt")} />
                </FormField>
              )}
              <FormField id="contactEmail" required label={t("tenants.fields.contactEmail")} error={errors.contactEmail?.message} {...c("contactEmail")}>
                <input id="contactEmail" type="email" className={clearable} placeholder={t("tenants.placeholders.contactEmail")} autoComplete="off" {...f("contactEmail")} {...register("contactEmail")} />
              </FormField>
              <FormField id="customDomain" label={t("tenants.fields.customDomain")} hint={t("tenants.fields.customDomainHint")} error={errors.customDomain?.message} {...c("customDomain")}>
                <SanitizedInput control={control} name="customDomain" sanitize={domainChars} id="customDomain" inputMode="url" className={clearable} placeholder={t("tenants.placeholders.customDomain")} autoComplete="off" autoCapitalize="none" spellCheck={false} {...f("customDomain")} />
              </FormField>
            </fieldset>

            <fieldset className={card}>
              <legend className="sr-only">{t("tenants.form.images")}</legend>
              <h2 className={legend}>{t("tenants.form.images")}</h2>
              <p className="mb-3 text-xs text-ink/70">{t("tenants.fields.cloudinaryNote")}</p>
              <FormField id="cloudName" required label={t("tenants.fields.cloudName")} error={errors.cloudName?.message} {...c("cloudName")}>
                <input id="cloudName" className={clearable} placeholder={t("tenants.placeholders.cloudName")} autoComplete="off" {...f("cloudName")} {...register("cloudName")} />
              </FormField>
              <div className="grid grid-cols-2 gap-x-3">
                <FormField id="defaultWidth" required label={t("tenants.fields.defaultWidth")} error={errors.defaultWidth?.message} {...c("defaultWidth")}>
                  <input id="defaultWidth" type="number" inputMode="numeric" min={16} max={4096} step={1} onKeyDown={(e) => ["e", "E", "+", "-", ".", ","].includes(e.key) && e.preventDefault()} className={clearable} placeholder={t("tenants.placeholders.defaultWidth")} {...f("defaultWidth")} {...register("defaultWidth", { valueAsNumber: true })} />
                </FormField>
                <FormField id="defaultExtension" required label={t("tenants.fields.defaultExtension")} error={errors.defaultExtension?.message}>
                  <select id="defaultExtension" className={inputCls} {...f("defaultExtension")} {...register("defaultExtension")}>
                    {["webp", "avif", "jpg", "png"].map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </FormField>
              </div>
            </fieldset>
          </div>
        </div>

        <div className="min-h-10">
          {formError && <p role="alert" className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">{formError}</p>}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {/* Leaving with unsaved changes is handled by the navigation guard, so Cancel just navigates. */}
          <Tooltip label={t("tooltips.cancel")}><button type="button" onClick={() => navigate("/tenants")} className={btnSecondary} disabled={create.isPending}>{t("tenants.form.cancel")}</button></Tooltip>
          <Tooltip label={t("tooltips.create")}>
            <button type="submit" className={btnPrimary} disabled={create.isPending}>
              {create.isPending ? t("tenants.form.submitting") : t("tenants.form.submit")}
            </button>
          </Tooltip>
        </div>
      </form>

      <ConfirmDialog
        open={pending !== null}
        title={t("tenants.confirmCreate.title")}
        body={t("tenants.confirmCreate.body", { name: pending?.name ?? "", slug: pending?.slug ?? "" })}
        confirmLabel={t("tenants.confirmCreate.confirm")} cancelLabel={t("tenants.confirmCreate.review")}
        onCancel={() => setPending(null)} onConfirm={confirmCreate}
      />
      <UnsavedChangesDialog blocker={blocker} />
    </>
  );
}
