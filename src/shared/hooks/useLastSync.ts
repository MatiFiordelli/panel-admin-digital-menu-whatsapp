// src/shared/hooks/useLastSync.ts
import { useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";

/** Timestamp (ms) of the most recent successful fetch of any data query (the session query is ignored). 0 = none yet. */
export function useLastSync(): number {
  const qc = useQueryClient();
  return useSyncExternalStore(
    (cb) => qc.getQueryCache().subscribe(cb),
    () =>
      qc.getQueryCache().getAll().reduce(
        (max, q) => (q.queryKey[0] !== "auth" && q.state.dataUpdatedAt > max ? q.state.dataUpdatedAt : max),
        0,
      ),
  );
}
