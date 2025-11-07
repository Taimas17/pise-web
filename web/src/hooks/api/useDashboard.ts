import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';

export const dashboardKeys = {
  stats: (params: Record<string, unknown> = {}) => ['dashboard', 'stats', params] as const,
};

export interface DashboardStats {
  total_reports: number;
  resolved_reports: number;
  resolution_rate: number;
  avg_resolution_hours: number;
  avg_review_hours: number;
  sla_compliance_rate: number;
  review_sla_compliance_rate: number;
  monthly_current: { month: string; count: number }[];
  by_type: { infrastructure_type_id: number; count: number }[];
  by_criticality: { criticality: string; count: number }[];
  by_zone?: {
    commune?: { name: string; count: number }[];
    arrondissement?: { name: string; count: number }[];
    quartier?: { name: string; count: number }[];
  };
}

export function useDashboardStats(params: { period?: '7'|'30'|'90' } = {}){
  return useQuery<DashboardStats>({
    queryKey: dashboardKeys.stats(params),
    queryFn: () => apiService.dashboard.stats(params),
  });
}
