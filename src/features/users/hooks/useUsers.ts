// src/features/users/hooks/useUsers.ts
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersService, type UpdateUserPayload } from "@/features/users/services/users.service";

export function useTenantUsers(slug: string, page: number, limit: number) {
  return useQuery({
    queryKey: ["users", slug, page, limit],
    queryFn: () => usersService.list(slug, page, limit),
    placeholderData: keepPreviousData,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: usersService.create, onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }) });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateUserPayload }) => usersService.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
