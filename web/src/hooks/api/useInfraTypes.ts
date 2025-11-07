import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';
import type { InfrastructureType } from '@/services/types';
import { toast } from '@/components/ui/sonner';

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

export function useCreateInfraType(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<InfrastructureType>) => apiService.infraTypes.create(payload),
    onSuccess: () => { toast.success('Type créé'); qc.invalidateQueries({ queryKey: infraTypeKeys.list }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erreur lors de la création du type'),
  });
}

export function useUpdateInfraType(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<InfrastructureType> }) => apiService.infraTypes.update(id, payload),
    onSuccess: () => { toast.success('Type mis à jour'); qc.invalidateQueries({ queryKey: infraTypeKeys.list }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erreur lors de la mise à jour du type'),
  });
}

export function useDeleteInfraType(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiService.infraTypes.delete(id),
    onSuccess: () => { toast.success('Type supprimé'); qc.invalidateQueries({ queryKey: infraTypeKeys.list }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erreur lors de la suppression du type'),
  });
}
