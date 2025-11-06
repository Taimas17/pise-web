import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';
import type { InfrastructureType } from '@/services/types';

export const infraTypeKeys = {
  list: ['infraTypes', 'list'] as const,
};

export function useInfraTypes(){
  return useQuery<InfrastructureType[]>({
    queryKey: infraTypeKeys.list,
    queryFn: () => apiService.infraTypes.list(),
    staleTime: 1000 * 60 * 10,
  });
}
