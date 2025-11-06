import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export function useUpdateChantier(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Chantier> }) => apiService.chantiers.update(id, payload),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: chantierKeys.detail(v.id) });
      qc.invalidateQueries({ queryKey: chantierKeys.list({}) });
    },
  });
}

export function useCreateLot(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ chantierId, payload }: { chantierId: number; payload: any }) => apiService.chantiers.lots.create(chantierId, payload),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: chantierKeys.detail(v.chantierId) }),
  });
}
export function useUpdateLot(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => apiService.chantiers.lots.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: chantierKeys.list({}) }),
  });
}
export function useDeleteLot(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiService.chantiers.lots.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: chantierKeys.list({}) }),
  });
}

export function useCreateEtape(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ chantierId, payload }: { chantierId: number; payload: any }) => apiService.chantiers.etapes.create(chantierId, payload),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: chantierKeys.detail(v.chantierId) }),
  });
}
export function useUpdateEtape(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => apiService.chantiers.etapes.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: chantierKeys.list({}) }),
  });
}
export function useDeleteEtape(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiService.chantiers.etapes.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: chantierKeys.list({}) }),
  });
}

export function useCreateExpense(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ chantierId, payload }: { chantierId: number; payload: any }) => apiService.chantiers.expenses.create(chantierId, payload),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: chantierKeys.detail(v.chantierId) }),
  });
}
export function useUpdateExpense(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => apiService.chantiers.expenses.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: chantierKeys.list({}) }),
  });
}
export function useDeleteExpense(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiService.chantiers.expenses.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: chantierKeys.list({}) }),
  });
}

export function useAttachDocument(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ chantierId, payload }: { chantierId: number; payload: FormData }) => apiService.chantiers.attachments.create(chantierId, payload),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: chantierKeys.detail(v.chantierId) }),
  });
}
export function useDeleteAttachment(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiService.chantiers.attachments.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: chantierKeys.list({}) }),
  });
}
