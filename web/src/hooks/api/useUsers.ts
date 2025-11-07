import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';
import type { User, PaginatedResponse } from '@/services/types';
import { toast } from '@/components/ui/sonner';

export const userKeys = {
  list: (filters: Record<string, unknown> = {}) => ['users', 'list', filters] as const,
};

export function useUsers(filters: Record<string, unknown> = {}){
  return useQuery<PaginatedResponse<User>>({
    queryKey: userKeys.list(filters),
    queryFn: () => apiService.users.list(filters),
  });
}

export function useUpdateUserRole(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: User['role'] }) => apiService.users.updateRole(id, role),
    onSuccess: () => { toast.success('Rôle mis à jour'); qc.invalidateQueries({ queryKey: userKeys.list({}) }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erreur lors de la mise à jour du rôle'),
  });
}
