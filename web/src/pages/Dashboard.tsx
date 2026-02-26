import { lazy, Suspense, useMemo, useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import StatsGrid from '@/components/stats/StatsGrid';
import ChartCard from '@/components/stats/ChartCard';
import { useDashboardStats } from '@/hooks/api/useDashboard';
import { useReports } from '@/hooks/api/useReports';
import { useInfraTypes } from '@/hooks/api/useInfraTypes';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Download, Map as MapIcon } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { apiService } from '@/services/api.service';
import { downloadBlob } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const InfraMap = lazy(() => import('@/components/maps/InfraMap'));

export default function Dashboard(){
  const [period, setPeriod] = useState<'7'|'30'|'90'>('30');
  const { data: stats, isLoading } = useDashboardStats({ period });
  const { data: infraTypes = [] } = useInfraTypes();

  const from = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - Number(period) + 1);
    return d.toISOString().slice(0, 10);
  }, [period]);

  const { data: reports } = useReports({ from }, { enabled: !!from });

  const kpis = useMemo(() => [
    { title: 'Signalements',             value: stats?.total_reports       ?? 0                    },
    { title: 'Résolus',                  value: stats?.resolved_reports     ?? 0, color: 'green' as const },
    { title: 'Taux de résolution',       value: `${stats?.resolution_rate  ?? 0}%`, color: 'blue' as const },
    { title: 'Délai résol. moyen (h)',   value: stats?.avg_resolution_hours ?? 0, color: 'amber' as const },
  ], [stats]);

  const typeData = useMemo(() =>
    (stats?.by_type || []).map(d => ({
      name:  infraTypes.find(t => t.id === d.infrastructure_type_id)?.name ?? `#${d.infrastructure_type_id}`,
      count: Number(d.count),
    })),
  [stats, infraTypes]);

  const critData = useMemo(() =>
    (stats?.by_criticality || []).map(d => ({
      name:  d.criticality,
      count: Number(d.count),
    })),
  [stats]);

  const suffix = () => {
    const ts = new Date();
    return `${ts.toISOString().slice(0,10)}-${String(ts.getHours()).padStart(2,'0')}${String(ts.getMinutes()).padStart(2,'0')}`;
  };

  return (
    <div className="grid gap-6 animate-fade-in">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <PageHeader
        title="Tableau de bord"
        actions={[
          <ToggleGroup
            key="period"
            type="single"
            value={period}
            onValueChange={(v: '7'|'30'|'90') => v && setPeriod(v)}
            variant="outline"
          >
            <ToggleGroupItem value="7">7 j</ToggleGroupItem>
            <ToggleGroupItem value="30">30 j</ToggleGroupItem>
            <ToggleGroupItem value="90">90 j</ToggleGroupItem>
          </ToggleGroup>,

          <DropdownMenu key="export">
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="transition-transform active:scale-95">
                <Download className="mr-2 h-4 w-4" />Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={async () => { const blob = await apiService.exports.pdf({ from }); downloadBlob(`reports-${suffix()}.pdf`, blob); }}>PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={async () => { const blob = await apiService.exports.excel({ from }); downloadBlob(`reports-${suffix()}.xlsx`, blob); }}>Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={async () => { const blob = await apiService.exports.geojson({ from }); downloadBlob(`reports-${suffix()}.geojson`, blob); }}>GeoJSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>,
        ]}
      />

      {/* ── KPI cards ────────────────────────────────────────────────── */}
      <StatsGrid stats={kpis as any} columns={4} loading={isLoading} />

      {/* ── Carte infrastructure — pleine largeur ────────────────────── */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapIcon className="size-4 text-sky-600" />
            Carte des infrastructures — Commune de Nikki
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <Suspense fallback={
            <div className="h-[500px] bg-muted animate-pulse rounded-lg flex items-center justify-center text-muted-foreground text-sm">
              Chargement de la carte…
            </div>
          }>
            <InfraMap
              reports={reports?.data ?? []}
              infraTypes={infraTypes}
              height="500px"
              showFilters
            />
          </Suspense>
        </CardContent>
      </Card>

      {/* ── Graphiques ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <ChartCard title="Fréquence mensuelle">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={(stats?.monthly_current || []).map(d => ({ month: d.month, count: Number(d.count) }))}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Par criticité">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={critData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Par type d'infrastructure">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={40} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
}
