import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';
import type { Zone } from '@/services/types';

export const zoneKeys = {
  all: ['zones'] as const,
  list: (parent_id?: number) => [...zoneKeys.all, { parent_id }] as const,
};

export function useZones(parent_id?: number) {
  return useQuery<Zone[]>({
    queryKey: zoneKeys.list(parent_id),
    queryFn: () => apiService.zones.list({ parent_id }),
  });
}
