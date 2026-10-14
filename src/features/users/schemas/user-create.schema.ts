// src/features/users/schemas/user-create.schema.ts
import { z } from "zod";
import type { TFunction } from "i18next";

/** The API requires a password of at least 8 characters; 72 is bcrypt's limit (longer passwords are silently truncated). */
export function buildUserCreateSchema(t: TFunction) {
  return z
    .object({
      email: z.string().trim().email(t("access.errors.email")),
      password: z.string().min(8, t("access.errors.password")).max(72, t("access.errors.password")),
      confirmPassword: z.string(),
    })
    .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: t("access.errors.mismatch") });
}
export type UserCreateValues = z.infer<ReturnType<typeof buildUserCreateSchema>>;
