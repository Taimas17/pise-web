import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';
import type { Zone } from '@/services/types';
import { toast } from '@/components/ui/sonner';

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

export function useCreateZone(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Zone>) => apiService.zones.create(payload),
    onSuccess: () => { toast.success('Zone créée'); qc.invalidateQueries({ queryKey: zoneKeys.all }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erreur lors de la création de la zone'),
  });
}
export function useUpdateZone(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Zone> }) => apiService.zones.update(id, payload),
    onSuccess: () => { toast.success('Zone mise à jour'); qc.invalidateQueries({ queryKey: zoneKeys.all }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erreur lors de la mise à jour de la zone'),
  });
}
export function useDeleteZone(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiService.zones.delete(id),
    onSuccess: () => { toast.success('Zone supprimée'); qc.invalidateQueries({ queryKey: zoneKeys.all }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erreur lors de la suppression de la zone'),
  });
}
export function useImportZones(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => apiService.zones.import(payload),
    onSuccess: () => { toast.success('Zones importées'); qc.invalidateQueries({ queryKey: zoneKeys.all }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erreur lors de l\'import des zones'),
  });
}
