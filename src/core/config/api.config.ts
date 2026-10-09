// src/core/config/api.config.ts
// Single place for env vars and endpoint strings.

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
  },
} as const;

export const STORAGE_KEYS = {
  language: "admin-language", // UI language only; never auth state
} as const;

export const QUERY_KEYS = {
  me: ["auth", "me"] as const,
};
