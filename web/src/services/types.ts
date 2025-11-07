export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'agent' | 'citizen' | 'moderator';
  created_at: string;
  updated_at: string;
}

export interface InfrastructureType {
  id: number;
  name: string;
  slug?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface Zone {
  id: number;
  name: string;
  parent_id?: number | null;
  level: 'commune' | 'arrondissement' | 'quartier' | 'secteur' | string;
  children?: Zone[];
  created_at?: string;
  updated_at?: string;
}

export interface ReportPhoto {
  id: number;
  url: string;
  thumbnail_url?: string;
  created_at: string;
}

export interface Assignment {
  id: number;
  user_id: number;
  assigned_at: string;
  due_at?: string;
  completed_at?: string;
  assignee?: User;
}

export interface StatusHistory {
  id: number;
  status: ReportStatus;
  comment?: string;
  user_id?: number;
  created_at: string;
  user?: User;
}

export type ReportCriticality = 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus = 'pending' | 'approved' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';

export interface Report {
  id: number;
  infrastructure_type_id: number;
  infrastructure_type?: InfrastructureType;
  zone_id?: number;
  zone?: Zone;
  criticality: ReportCriticality;
  status: ReportStatus;
  description: string;
  location: { lat: number; lng: number };
  masked_location?: { lat: number; lng: number };
  contact_email?: string;
  contact_phone?: string;
  sla_due_at?: string;
  resolved_at?: string;
  photos?: ReportPhoto[];
  assignments?: Assignment[];
  status_histories?: StatusHistory[];
  created_at: string;
  updated_at: string;
}

export interface Chantier {
  id: number;
  name: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'paused' | 'completed' | 'cancelled' | string;
  start_date?: string;
  end_date?: string;
  progress?: number;
  budget_total?: number;
  lots?: Lot[];
  etapes?: Etape[];
  expenses?: Expense[];
  attachments?: Attachment[];
  reports?: Report[];
  created_at: string;
  updated_at: string;
}

export interface Lot { id: number; name: string; description?: string; created_at?: string; updated_at?: string; }
export interface Etape { id: number; name: string; date: string; description?: string; created_at?: string; updated_at?: string; }
export interface Expense { id: number; label: string; amount: number; date: string; created_at?: string; updated_at?: string; }
export interface Attachment { id: number; name: string; url: string; created_at?: string; updated_at?: string; }

export type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type ReportFilters = Partial<{
  q: string;
  status: ReportStatus;
  criticality: ReportCriticality;
  infrastructure_type_id: number;
  zone_id: number;
  page: number;
  from: string;
  to: string;
}>;
