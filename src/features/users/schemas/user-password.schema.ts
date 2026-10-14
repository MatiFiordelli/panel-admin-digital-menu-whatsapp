// src/features/users/schemas/user-password.schema.ts
import { z } from "zod";
import type { TFunction } from "i18next";

/** Same rules as creating a user: 8 to 72 characters (72 is bcrypt's limit) and the repeat box must match. */
export function buildPasswordResetSchema(t: TFunction) {
  return z
    .object({
      password: z.string().min(8, t("access.errors.password")).max(72, t("access.errors.password")),
      confirmPassword: z.string(),
    })
    .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: t("access.errors.mismatch") });
}
export type PasswordResetValues = z.infer<ReturnType<typeof buildPasswordResetSchema>>;
