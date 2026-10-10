// src/shared/hooks/useOnlineStatus.ts
import { useConnectivity } from "@/core/connectivity/connectivity-store";

/** True when the API is reachable (see connectivity-store.ts for how that is decided). */
export function useOnlineStatus(): boolean {
  return useConnectivity((s) => s.online);
}
