import type { Coordinates, MaskedCoordinates, GeoJsonGeometry } from './geo';

export type UserRole = 'admin' | 'moderator' | 'agent' | 'citizen';
export type ReportCriticality = 'faible' | 'moyenne' | 'haute';
export type ReportStatus = 'draft' | 'pending_review' | 'assigned' | 'resolved' | 'rejected';
export type ChantierStatus = 'planned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

export interface Zone {
  id: number;
  name: string;
  type: 'commune' | 'arrondissement' | 'quartier';
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface InfrastructureType {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportPhoto {
  id: number;
  report_id: number;
  path: string;
  thumbnail_path: string | null;
  created_at: string;
}

export interface Assignment {
  id: number;
  report_id: number;
  assigned_to_user_id: number;
  assigned_by_user_id: number;
  assigned_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface StatusHistory {
  id: number;
  report_id: number;
  from_status: ReportStatus;
  to_status: ReportStatus;
  comment: string | null;
  user_id: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: number;
  infrastructure_type_id: number;
  zone_id: number | null;
  criticality: ReportCriticality;
  status: ReportStatus;
  title: string | null;
  description: string | null;
  lat_masked: number;
  lng_masked: number;
  public_location: boolean;
  submitted_at: string | null;
  reviewed_at: string | null;
  assigned_at: string | null;
  resolved_at: string | null;
  reported_by_user_id: number | null;
  created_at: string;
  updated_at: string;
  
  // Relations chargées avec `with()`
  type?: InfrastructureType;
  zone?: Zone;
  photos?: ReportPhoto[];
  statusHistories?: StatusHistory[];
  assignments?: Assignment[];
  reporter?: User;
}

export interface Lot {
  id: number;
  chantier_id: number;
  title: string;
  description: string | null;
  budget_planned: number;
  budget_actual: number;
  progress_pct: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Etape {
  id: number;
  chantier_id: number;
  lot_id: number | null;
  name: string;
  description: string | null;
  planned_start_at: string | null;
  planned_end_at: string | null;
  actual_start_at: string | null;
  actual_end_at: string | null;
  status: ChantierStatus;
  progress_pct: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  chantier_id: number;
  lot_id: number | null;
  label: string;
  amount: number;
  incurred_at: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: number;
  attachable_type: string;
  attachable_id: number;
  path: string;
  type: string | null;
  category: string | null;
  size_kb: number;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface Chantier {
  id: number;
  title: string;
  description: string | null;
  infrastructure_type_id: number;
  zone_id: number;
  status: ChantierStatus;
  planned_start_at: string;
  planned_end_at: string;
  actual_start_at: string | null;
  actual_end_at: string | null;
  progress_pct: number;
  budget_planned: number;
  budget_committed: number;
  budget_actual: number;
  manager_user_id: number | null;
  external_ref: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations
  type?: InfrastructureType;
  zone?: Zone;
  manager?: User;
  lots?: Lot[];
  etapes?: Etape[];
  expenses?: Expense[];
  attachments?: Attachment[];
  reports?: Report[];
}

export interface DashboardStats {
  total_reports: number;
  resolved_reports: number;
  resolution_rate: number;
  avg_resolution_hours: number | null;
  total_chantiers: number;
  active_chantiers: number;
  total_budget: number;
  spent_budget: number;
  reports_by_status: Record<Report['status'], number>;
  reports_by_criticality: Record<Report['criticality'], number>;
  recent_reports: Report[];
}

// Types pour réponses paginées
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

// Types pour les formulaires
export interface ReportCreatePayload {
  infrastructure_type_id: string | number;
  zone_id?: number;
  criticality: ReportCriticality;
  title?: string;
  description?: string;
  lat: number;
  lng: number;
  public_location: boolean;
  citizen_email?: string;
  citizen_phone?: string;
  photos?: File[];
}
