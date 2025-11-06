import { lazy, Suspense, useMemo, useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import StatsGrid from '@/components/stats/StatsGrid';
import StatCard from '@/components/stats/StatCard';
import ChartCard from '@/components/stats/ChartCard';
import LoadingState from '@/components/layouts/LoadingState';
import { useDashboardStats } from '@/hooks/api/useDashboard';
import { useReports } from '@/hooks/api/useReports';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Download } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

const DensityMap = lazy(() => import('@/components/maps/DensityMap'));

export default function Dashboard(){
  const [period, setPeriod] = useState<'7'|'30'|'90'>('30');
  const { data: stats, isLoading } = useDashboardStats({ period });

  const from = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - Number(period) + 1); return d.toISOString().slice(0,10); }, [period]);
  const { data: reports } = useReports({ from }, { enabled: !!from });

  const kpis = useMemo(() => [
    { title: 'Signalements', value: stats?.total_reports ?? 0 },
    { title: 'Résolus', value: stats?.resolved_reports ?? 0, color: 'green' as const },
    { title: 'Taux de résolution', value: `${stats?.resolution_rate ?? 0}%`, color: 'blue' as const },
    { title: 'Délai résol. moyen (h)', value: stats?.avg_resolution_hours ?? 0, color: 'amber' as const },
  ], [stats]);

  const typeData = useMemo(() => (stats?.by_type || []).map(d => ({ name: String(d.infrastructure_type_id), count: Number(d.count) })), [stats]);
  const critData = useMemo(() => (stats?.by_criticality || []).map(d => ({ name: d.criticality, count: Number(d.count) })), [stats]);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Tableau de bord"
        actions={[
          <ToggleGroup key="period" type="single" value={period} onValueChange={(v:any)=> v && setPeriod(v)} variant="outline">
            <ToggleGroupItem value="7">7 j</ToggleGroupItem>
            <ToggleGroupItem value="30">30 j</ToggleGroupItem>
            <ToggleGroupItem value="90">90 j</ToggleGroupItem>
          </ToggleGroup>,
          <Button key="export" variant="outline"><Download className="mr-2 h-4 w-4"/>Exporter</Button>,
        ]}
      />

      <StatsGrid stats={kpis as any} columns={4} loading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Fréquence mensuelle">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={(stats?.monthly_current||[]).map(d => ({ month: d.month, count: Number(d.count) }))}>
              <XAxis dataKey="month" /><YAxis /><Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0ea5e9" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Par criticité">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={critData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Par type d'infrastructure">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData}>
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Carte de densité">
          <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded" /> }>
            <div className="h-64">
              <DensityMap reports={reports?.data || []} />
            </div>
          </Suspense>
        </ChartCard>
      </div>
    </div>
  );
}
