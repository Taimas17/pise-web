import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';
import type { Chantier, PaginatedResponse } from '@/services/types';

export const chantierKeys = {
  list: (filters: Record<string, unknown> = {}) => ['chantiers', 'list', filters] as const,
  detail: (id: number) => ['chantiers', 'detail', id] as const,
};

export function useChantiers(filters: Record<string, unknown> = {}){
  return useQuery<PaginatedResponse<Chantier>>({
    queryKey: chantierKeys.list(filters),
    queryFn: () => apiService.chantiers.list(filters),
  });
}

export function useChantier(id: number, params?: { include?: string }){
  return useQuery<Chantier>({
    queryKey: chantierKeys.detail(id),
    queryFn: () => apiService.chantiers.get(id, params),
    enabled: !!id,
  });
}
