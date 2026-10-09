// src/core/lib/axios.ts
import axios, { AxiosError } from "axios";
import { API_BASE_URL, ENDPOINTS, QUERY_KEYS } from "@/core/config/api.config";
import { queryClient } from "@/core/lib/queryClient";
import type { ApiResponse } from "@/core/types";

/** Normalized error so UI code never touches AxiosError directly. */
export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // mandatory: session lives in an httpOnly cookie
  timeout: 15_000,
});

// Endpoints where a 401 is an expected answer, not a "session expired" event.
const AUTH_PROBES: string[] = [ENDPOINTS.auth.login, ENDPOINTS.auth.me, ENDPOINTS.auth.logout];

http.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiResponse<unknown>>) => {
    const status = err.response?.status ?? 0;
    const url = err.config?.url ?? "";
    const message = err.response?.data?.message ?? err.message;

    // Session expired mid-use: clear cached user; ProtectedRoute handles the redirect.
    if (status === 401 && !AUTH_PROBES.some((p) => url.endsWith(p))) {
      queryClient.setQueryData(QUERY_KEYS.me, null);
    }
    // 423 (account locked) is NOT redirected: the login form shows the server message as-is.
    return Promise.reject(new ApiError(status, message, err.response?.data?.error));
  },
);
