import { AxiosError } from 'axios';
import { api, sanctumCsrf } from '@/lib/api';
import type {
  User,
  Report,
  ReportFilters,
  PaginatedResponse,
  Chantier,
  InfrastructureType,
  Zone,
} from './types';

async function sleep(ms: number) { return new Promise((res) => setTimeout(res, ms)); }

async function withRetry<T>(fn: () => Promise<T>, { retries = 1, baseDelay = 300 }: { retries?: number; baseDelay?: number } = {}) {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err) {
      const e = err as AxiosError;
      const status = e.response?.status;
      const retryable = !status || (status >= 500 && status < 600);
      if (!retryable || attempt >= retries) throw err;
      attempt++;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
}

function buildQuery(params?: Record<string, unknown>) {
  if (!params) return '';
  const esc = encodeURIComponent;
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${esc(k)}=${esc(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

export const apiService = {
  auth: {
    me: () => withRetry(() => api.get<User>('/auth/me').then(r => r.data)),
    login: async (payload: { email: string; password: string }) => {
      await sanctumCsrf();
      return api.post<User>('/auth/login', payload).then(r => r.data);
    },
    register: async (payload: { name: string; email: string; password: string; phone?: string }) => {
      await sanctumCsrf();
      return api.post<User>('/auth/register', payload).then(r => r.data);
    },
    logout: () => api.post('/auth/logout').then(r => r.data),
  },
  reports: {
    list: (filters: ReportFilters = {}) => withRetry(() => api.get<PaginatedResponse<Report>>(`/reports${buildQuery(filters)}`).then(r => r.data)),
    get: (id: number) => withRetry(() => api.get<Report>(`/reports/${id}`).then(r => r.data)),
    create: async (payload: FormData | Partial<Report>) => {
      await sanctumCsrf();
      return api.post<Report>('/reports', payload).then(r => r.data);
    },
    update: async (id: number, payload: Partial<Report>) => {
      await sanctumCsrf();
      return api.put<Report>(`/reports/${id}`, payload).then(r => r.data);
    },
    review: async (id: number, payload: { action: 'approve' | 'reject'; comment: string }) => {
      await sanctumCsrf();
      return api.post<Report>(`/reports/${id}/review`, payload).then(r => r.data);
    },
    assign: async (id: number, payload: { user_id: number; due_at?: string }) => {
      await sanctumCsrf();
      return api.post<Report>(`/reports/${id}/assign`, payload).then(r => r.data);
    },
  },
  chantiers: {
    list: (params: Record<string, unknown> = {}) => withRetry(() => api.get<PaginatedResponse<Chantier>>(`/chantiers${buildQuery(params)}`).then(r => r.data)),
    get: (id: number, params?: { include?: string }) => withRetry(() => api.get<Chantier>(`/chantiers/${id}${buildQuery(params as any)}`).then(r => r.data)),
    create: async (payload: Partial<Chantier>) => { await sanctumCsrf(); return api.post<Chantier>('/chantiers', payload).then(r => r.data); },
    update: async (id: number, payload: Partial<Chantier>) => { await sanctumCsrf(); return api.put<Chantier>(`/chantiers/${id}`, payload).then(r => r.data); },
    delete: async (id: number) => { await sanctumCsrf(); return api.delete(`/chantiers/${id}`).then(r => r.data); },
    lots: {
      create: async (chantierId: number, payload: any) => { await sanctumCsrf(); return api.post(`/chantiers/${chantierId}/lots`, payload).then(r => r.data); },
      update: async (id: number, payload: any) => { await sanctumCsrf(); return api.put(`/lots/${id}`, payload).then(r => r.data); },
      delete: async (id: number) => { await sanctumCsrf(); return api.delete(`/lots/${id}`).then(r => r.data); },
    },
    etapes: {
      create: async (chantierId: number, payload: any) => { await sanctumCsrf(); return api.post(`/chantiers/${chantierId}/etapes`, payload).then(r => r.data); },
      update: async (id: number, payload: any) => { await sanctumCsrf(); return api.put(`/etapes/${id}`, payload).then(r => r.data); },
      delete: async (id: number) => { await sanctumCsrf(); return api.delete(`/etapes/${id}`).then(r => r.data); },
    },
    expenses: {
      create: async (chantierId: number, payload: any) => { await sanctumCsrf(); return api.post(`/chantiers/${chantierId}/expenses`, payload).then(r => r.data); },
      update: async (id: number, payload: any) => { await sanctumCsrf(); return api.put(`/expenses/${id}`, payload).then(r => r.data); },
      delete: async (id: number) => { await sanctumCsrf(); return api.delete(`/expenses/${id}`).then(r => r.data); },
    },
    attachments: {
      create: async (chantierId: number, payload: FormData) => { await sanctumCsrf(); return api.post(`/chantiers/${chantierId}/attachments`, payload).then(r => r.data); },
      delete: async (id: number) => { await sanctumCsrf(); return api.delete(`/attachments/${id}`).then(r => r.data); },
    }
  },
  infraTypes: {
    list: () => withRetry(() => api.get<InfrastructureType[]>('/infrastructure-types').then(r => r.data)),
    create: async (payload: Partial<InfrastructureType>) => { await sanctumCsrf(); return api.post<InfrastructureType>('/infrastructure-types', payload).then(r => r.data); },
    update: async (id: number, payload: Partial<InfrastructureType>) => { await sanctumCsrf(); return api.put<InfrastructureType>(`/infrastructure-types/${id}`, payload).then(r => r.data); },
    delete: async (id: number) => { await sanctumCsrf(); return api.delete(`/infrastructure-types/${id}`).then(r => r.data); },
  },
  zones: {
    list: (params: { parent_id?: number } = {}) => withRetry(() => api.get<Zone[]>(`/zones${buildQuery(params)}`).then(r => r.data)),
    create: async (payload: Partial<Zone>) => { await sanctumCsrf(); return api.post<Zone>('/zones', payload).then(r => r.data); },
    update: async (id: number, payload: Partial<Zone>) => { await sanctumCsrf(); return api.put<Zone>(`/zones/${id}`, payload).then(r => r.data); },
    delete: async (id: number) => { await sanctumCsrf(); return api.delete(`/zones/${id}`).then(r => r.data); },
    import: async (payload: FormData) => { await sanctumCsrf(); return api.post(`/zones/import`, payload).then(r => r.data); },
  },
  users: {
    list: (params: Record<string, unknown> = {}) => withRetry(() => api.get<PaginatedResponse<User>>(`/users${buildQuery(params)}`).then(r => r.data)),
    updateRole: async (id: number, role: User['role']) => { await sanctumCsrf(); return api.put<User>(`/users/${id}/role`, { role }).then(r => r.data); },
  },
  dashboard: {
    stats: (params: Record<string, unknown> = {}) => withRetry(() => api.get<any>(`/dashboard/stats${buildQuery(params)}`).then(r => r.data)),
  },
  exports: {
    pdf: (params: Record<string, unknown> = {}) => api.get<Blob>(`/exports/pdf${buildQuery(params)}`, { responseType: 'blob' }).then(r => r.data),
    excel: (params: Record<string, unknown> = {}) => api.get<Blob>(`/exports/excel${buildQuery(params)}`, { responseType: 'blob' }).then(r => r.data),
    geojson: (params: Record<string, unknown> = {}) => api.get<Blob>(`/exports/geojson${buildQuery(params)}`, { responseType: 'blob' }).then(r => r.data),
  },
  audit: {
    logs: (params: Record<string, unknown> = {}) => withRetry(() => api.get<PaginatedResponse<any>>(`/audit${buildQuery(params)}`).then(r => r.data)),
  }
};
