import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/layouts/PageHeader';
import FilterPanel, { FilterDescriptor } from '@/components/filters/FilterPanel';
import DataList from '@/components/lists/DataList';
import { ChantierCard } from '@/components/chantiers/ChantierCard';
import { useChantiers } from '@/hooks/api/useChantiers';
import { useInfraTypes } from '@/hooks/api/useInfraTypes';
import StatsGrid from '@/components/stats/StatsGrid';
import type { Chantier } from '@/services/types';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/lib/api';
import axios from 'axios';
import { downloadBlob } from '@/lib/utils';

const statusOptions = [
  { label: 'Planifié', value: 'planned' },
  { label: 'En cours', value: 'in_progress' },
  { label: 'En pause', value: 'paused' },
  { label: 'Terminé', value: 'completed' },
  { label: 'Annulé', value: 'cancelled' },
];

export default function ChantiersList(){
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, sort: '-created_at' });
  const { data: types } = useInfraTypes();

  const filterDefs: FilterDescriptor[] = useMemo(() => ([
    { type: 'search', name: 'q', label: 'Rechercher' },
    { type: 'select', name: 'status', label: 'Statut', options: statusOptions },
    { type: 'select', name: 'infrastructure_type_id', label: 'Type', options: (types||[]).map(t => ({ label: t.name, value: t.id })) },
    { type: 'date-range', name: 'dates', label: 'Période' },
    { type: 'cascade', name: 'zone_id', label: 'Zone' },
  ]), [types]);

  const effectiveFilters = useMemo(() => {
    const ef: Record<string, any> = { ...filters };
    const dates: any = (filters as any).dates;
    if (dates?.from) ef.from = new Date(dates.from).toISOString().slice(0,10);
    if (dates?.to) ef.to = new Date(dates.to).toISOString().slice(0,10);
    return ef;
  }, [filters]);

  const { data, isLoading } = useChantiers(effectiveFilters);

  const pageData = (data?.data || []) as Chantier[];

  const kpis = useMemo(() => {
    const total = data?.total ?? pageData.length;
    const inProgress = pageData.filter(c => c.status === 'in_progress').length;
    const completed = pageData.filter(c => c.status === 'completed').length;
    const avgProgress = pageData.length ? Math.round(pageData.reduce((s, c) => s + (c.progress || 0), 0) / pageData.length) : 0;
    const budgetSum = pageData.reduce((s, c) => s + (c.budget_total || 0), 0);
    return [
      { title: 'Total', value: total },
      { title: 'En cours', value: inProgress, color: 'blue' as const },
      { title: 'Terminés', value: completed, color: 'green' as const },
      { title: 'Avancement moyen', value: `${avgProgress}%`, color: 'amber' as const },
      { title: 'Budget total', value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(budgetSum), color: 'purple' as const },
      { title: 'Page', value: `${data?.current_page || 1}/${data?.last_page || 1}` },
    ];
  }, [data, pageData]);

  return (
    <div className="grid gap-4 animate-fade-in">
      <PageHeader title="Chantiers" actions={[
        <Button key="pdf" variant="outline" className="transition-transform active:scale-95" onClick={async ()=>{
          const params = new URLSearchParams(Object.fromEntries(Object.entries(effectiveFilters).filter(([k,v]) => ['infrastructure_type_id','status','from','to','zone_id','manager_user_id'].includes(k) && v as any)) as any).toString();
          const { data } = await axios.get(`${API_URL}/api/exports/chantiers.pdf?${params}`, { responseType: 'blob' });
          const ts = new Date(); const suffix = `${ts.toISOString().slice(0,10)}-${String(ts.getHours()).padStart(2,'0')}${String(ts.getMinutes()).padStart(2,'0')}`;
          downloadBlob(`chantiers-${suffix}.pdf`, data);
        }}>PDF</Button>,
        <Button key="xlsx" variant="outline" className="transition-transform active:scale-95" onClick={async ()=>{
          const params = new URLSearchParams(Object.fromEntries(Object.entries(effectiveFilters).filter(([k,v]) => ['infrastructure_type_id','status','from','to','zone_id','manager_user_id'].includes(k) && v as any)) as any).toString();
          const { data } = await axios.get(`${API_URL}/api/exports/chantiers.xlsx?${params}`, { responseType: 'blob' });
          const ts = new Date(); const suffix = `${ts.toISOString().slice(0,10)}-${String(ts.getHours()).padStart(2,'0')}${String(ts.getMinutes()).padStart(2,'0')}`;
          downloadBlob(`chantiers-${suffix}.xlsx`, data);
        }}>Excel</Button>
      ]} />

      <StatsGrid stats={kpis as any} columns={6} loading={isLoading} />

      <FilterPanel
        filters={filterDefs}
        values={filters}
        onChange={(name, value) => setFilters((f) => ({ ...f, [name]: value, page: 1 }))}
        onReset={() => setFilters({ page: 1, sort: '-created_at' })}
      />

      <div key={data?.current_page}>
        <DataList
          data={pageData}
          renderItem={(c) => (
            <ChantierCard chantier={c} onClick={() => navigate(`/chantiers/${(c as any).id}`)} />
          )}
          loading={isLoading}
          pagination={{ current: data?.current_page, total: data?.last_page, onChange: (page) => setFilters((f) => ({ ...f, page })) }}
        />
      </div>
    </div>
  );
}
