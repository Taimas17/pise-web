import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/layouts/PageHeader';
import FilterPanel, { FilterDescriptor } from '@/components/filters/FilterPanel';
import DataList from '@/components/lists/DataList';
import { ReportCard } from '@/components/reports/ReportCard';
import { useReports } from '@/hooks/api/useReports';
import { useInfraTypes } from '@/hooks/api/useInfraTypes';
import type { ReportFilters } from '@/services/types';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/api.service';

const statusOptions = [
  { label: 'En attente', value: 'pending' },
  { label: 'Approuvé', value: 'approved' },
  { label: 'Assigné', value: 'assigned' },
  { label: 'En cours', value: 'in_progress' },
  { label: 'Résolu', value: 'resolved' },
  { label: 'Rejeté', value: 'rejected' },
];

const criticalityOptions = [
  { label: 'Faible', value: 'low' },
  { label: 'Moyenne', value: 'medium' },
  { label: 'Haute', value: 'high' },
  { label: 'Critique', value: 'critical' },
];

export default function ReportsList(){
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ReportFilters>({ page: 1 });
  const { data: types } = useInfraTypes();

  const filterDefs: FilterDescriptor[] = useMemo(() => ([
    { type: 'search', name: 'q', label: 'Rechercher' },
    { type: 'select', name: 'status', label: 'Statut', options: statusOptions },
    { type: 'select', name: 'criticality', label: 'Criticité', options: criticalityOptions },
    { type: 'select', name: 'infrastructure_type_id', label: 'Type', options: (types||[]).map(t => ({ label: t.name, value: t.id })) },
    { type: 'date-range', name: 'dates', label: 'Période' },
    { type: 'cascade', name: 'zone_id', label: 'Zone' },
  ]), [types]);

  const effectiveFilters: ReportFilters = useMemo(() => {
    const ef: ReportFilters = { ...filters };
    const dates: any = (filters as any).dates;
    if (dates?.from) ef.from = new Date(dates.from).toISOString().slice(0,10);
    if (dates?.to) ef.to = new Date(dates.to).toISOString().slice(0,10);
    return ef;
  }, [filters]);

  const { data, isLoading, error } = useReports(effectiveFilters, { keepPreviousData: true });

  async function exportGeoJSON(){
    const blob = await apiService.exports.geojson(effectiveFilters as any);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reports.geojson';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Suivi des signalements"
        actions={[
          <Button key="export" variant="outline" onClick={exportGeoJSON}>Export GeoJSON</Button>
        ]}
      />

      <FilterPanel
        filters={filterDefs}
        values={filters as any}
        onChange={(name, value) => setFilters((f) => ({ ...f, [name]: value, page: 1 }))}
        onReset={() => setFilters({ page: 1 })}
      />

      <DataList
        data={data?.data}
        renderItem={(report) => (
          <ReportCard
            report={report}
            onClick={() => navigate(`/suivi/${(report as any).id}`)}
          />
        )}
        loading={isLoading}
        error={error}
        pagination={{ current: data?.current_page, total: data?.last_page, onChange: (page) => setFilters((f) => ({ ...f, page })) }}
      />
    </div>
  );
}
