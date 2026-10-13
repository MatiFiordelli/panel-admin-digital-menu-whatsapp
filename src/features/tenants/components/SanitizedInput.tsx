// src/features/tenants/components/SanitizedInput.tsx
// A text input bound to the form that cleans what is typed or pasted (see lib/sanitize.ts).
import type { InputHTMLAttributes } from "react";
import { useController, type Control } from "react-hook-form";
import type { TenantCreateValues } from "@/features/tenants/schemas/tenant-create.schema";

type Name = "phone" | "whatsappNumber" | "slug" | "customDomain";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "value" | "onChange"> {
  control: Control<TenantCreateValues>;
  name: Name;
  sanitize: (value: string) => string;
}

export function SanitizedInput({ control, name, sanitize, ...rest }: Props) {
  const { field } = useController({ control, name });
  return (
    <input
      {...rest}
      name={field.name} ref={field.ref} onBlur={field.onBlur}
      value={field.value ?? ""}
      onChange={(e) => field.onChange(sanitize(e.target.value))}
    />
  );
}
