import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';
import type { Report, ReportFilters, PaginatedResponse } from '@/services/types';

export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (filters: ReportFilters) => [...reportKeys.lists(), filters] as const,
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (id: number) => [...reportKeys.details(), id] as const,
};

export function useReports(
  filters: ReportFilters = {},
  options?: UseQueryOptions<PaginatedResponse<Report>>
) {
  return useQuery({
    queryKey: reportKeys.list(filters),
    queryFn: () => apiService.reports.list(filters),
    ...options,
  });
}

export function useReport(id: number, options?: UseQueryOptions<Report>) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => apiService.reports.get(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiService.reports.create as (payload: any) => Promise<Report>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Report> }) => apiService.reports.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}

export function useReviewReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { action: 'approve' | 'reject'; comment: string } }) => apiService.reports.review(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}
