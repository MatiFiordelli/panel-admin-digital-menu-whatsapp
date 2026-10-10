// src/core/lib/axios.ts
import axios, { AxiosError } from "axios";
import { API_BASE_URL, ENDPOINTS, QUERY_KEYS } from "@/core/config/api.config";
import { queryClient } from "@/core/lib/queryClient";
import { useUiStore } from "@/core/store/ui-store";
import { markReachable, markUnreachable } from "@/core/connectivity/connectivity-store";
import type { ApiResponse, User } from "@/core/types";

/** Normalized error so UI code never touches AxiosError directly. */
export class ApiError extends Error {
  public status: number;
  public code?: string;

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

// x-tenant-id is sent ONLY by a SuperAdmin who has entered a tenant. A TenantAdmin never sends it
// (the backend resolves their tenant from the JWT). The slug always comes from the real tenant list.
http.interceptors.request.use((config) => {
  const me = queryClient.getQueryData<User | null>(QUERY_KEYS.me);
  const slug = useUiStore.getState().activeTenantSlug;
  if (me?.role === "SuperAdmin" && slug) config.headers.set("x-tenant-id", slug);
  return config;
});

// Endpoints where a 401 is an expected answer, not a "session expired" event.
const AUTH_PROBES: string[] = [ENDPOINTS.auth.login, ENDPOINTS.auth.me, ENDPOINTS.auth.logout];

http.interceptors.response.use(
  (res) => {
    markReachable();
    return res;
  },
  (err: AxiosError<ApiResponse<unknown>>) => {
    // Connectivity: a real answer (<500) means reachable; a network error with no response means it is not.
    // 5xx is left to the probe: a dev/edge proxy answers 500/502 when the upstream is unreachable.
    if (err.response && err.response.status < 500) markReachable();
    else if (err.code === "ERR_NETWORK") markUnreachable();

    const status = err.response?.status ?? 0;
    const url = err.config?.url ?? "";
    const message = err.response?.data?.message ?? err.message;

    // Session expired mid-use: clear cached user; ProtectedRoute handles the redirect.
    if (status === 401 && !AUTH_PROBES.some((p) => url.endsWith(p))) {
      queryClient.setQueryData(QUERY_KEYS.me, null);
    }
    // 423 (account locked) is NOT redirected: the login form shows the server message as-is.
    return Promise.reject(new ApiError(status, message, err.response?.data?.code));
  },
);
