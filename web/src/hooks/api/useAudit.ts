import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';

export const auditKeys = {
  list: (filters: Record<string, unknown> = {}) => ['audit', 'list', filters] as const,
};

export function useAuditLogs(filters: Record<string, unknown> = {}){
  return useQuery({
    queryKey: auditKeys.list(filters),
    queryFn: () => apiService.audit.logs(filters),
  });
}
