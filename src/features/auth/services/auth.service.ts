// src/features/auth/services/auth.service.ts
import { http, ApiError } from "@/core/lib/axios";
import { ENDPOINTS } from "@/core/config/api.config";
import type { ApiResponse, SessionUser, User } from "@/core/types";

export interface LoginInput { email: string; password: string }

export const authService = {
  /** POST /auth/login -> data.user (minimal shape). The JWT is only ever in the cookie. */
  async login(input: LoginInput): Promise<SessionUser> {
    const { data } = await http.post<ApiResponse<{ user: SessionUser }>>(ENDPOINTS.auth.login, input);
    if (!data.data?.user) throw new ApiError(500, "Malformed login response");
    return data.data.user;
  },

  /** GET /auth/me -> data (full User, NOT data.user). Returns null when there is no session (401). */
  async me(): Promise<User | null> {
    try {
      const { data } = await http.get<ApiResponse<User>>(ENDPOINTS.auth.me);
      return data.data ?? null;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null;
      throw e;
    }
  },

  async logout(): Promise<void> {
    await http.post(ENDPOINTS.auth.logout);
  },
};
