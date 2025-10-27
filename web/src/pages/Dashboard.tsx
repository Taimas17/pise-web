import { useEffect, useMemo, useRef, useState } from "react";
import { api, API_URL } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from 'recharts';
import { useStats, Filters } from "../hooks/useStats";

export default function Dashboard(){
  const [from, setFrom] = useState<string>(()=> new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10));
  const [to, setTo] = useState<string>(()=> new Date().toISOString().slice(0,10));
  const [typeId, setTypeId] = useState<number|undefined>();
  const [zoneId, setZoneId] = useState<number|undefined>();
  const [agentId, setAgentId] = useState<number|undefined>();
  const [criticality, setCriticality] = useState<Filters["criticality"]|undefined>();
  const [status, setStatus] = useState<Filters["status"]|undefined>();
  const [interval, setInterval] = useState<Filters["interval"]>('daily');
  const [types, setTypes] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview'|'breakdown'|'trends'>('overview');
  const titleRef = useRef<HTMLHeadingElement>(null);

  const filters: Filters = { from, to, type_id: typeId, zone_id: zoneId, agent_id: agentId, criticality, status, interval };
  const { overview, breakdownType, breakdownZone, breakdownAgent, trends, slaSummary, slaBreakdownType, slaBreakdownZone, slaBreakdownAgent, agentsOptions, loading, error } = useStats(filters);

  useEffect(()=>{ titleRef.current?.focus(); }, [activeTab]);

  useEffect(()=>{ (async()=>{ try { const [t,z] = await Promise.all([api.get('/infrastructure-types'), api.get('/zones')]); setTypes(t.data||[]); setZones(z.data||[]);} catch {} })(); },[]);

  const setPreset = (days: number) => {
    const now = new Date();
    const start = new Date(now.getTime() - days*24*60*60*1000);
    setFrom(start.toISOString().slice(0,10));
    setTo(now.toISOString().slice(0,10));
  };

  const exportPdf = () => { const q = new URLSearchParams({ from, to }).toString(); window.open(`${API_URL}/api/exports/reports.pdf?${q}`, '_blank'); };
  const exportXlsx = () => { const q = new URLSearchParams({ from, to }).toString(); window.open(`${API_URL}/api/exports/reports.xlsx?${q}`, '_blank'); };

  const monthlyLegacy = useMemo(()=> (overview?.monthly_frequency?.map((d:any)=>({ month: d.month, count: Number(d.count) })) || []), [overview]);

  return (
    <div className="grid gap-6" aria-busy={loading}>
      <h2 className="text-xl font-semibold" tabIndex={-1} ref={titleRef}>Tableau de bord</h2>

      <div className="flex flex-wrap items-end gap-2">
        <div className="grid gap-1">
          <label className="text-xs text-gray-600">Du</label>
          <Input type="date" value={from} onChange={e=>setFrom(e.target.value)} aria-label="Date de début" />
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-gray-600">Au</label>
          <Input type="date" value={to} onChange={e=>setTo(e.target.value)} aria-label="Date de fin" />
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-gray-600">Type</label>
          <Select value={typeId?.toString()} onValueChange={(v)=>setTypeId(v?Number(v):undefined)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Tous" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous</SelectItem>
              {types.map((t:any)=>(<SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-gray-600">Zone</label>
          <Select value={zoneId?.toString()} onValueChange={(v)=>setZoneId(v?Number(v):undefined)}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Toutes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes</SelectItem>
              {zones.map((z:any)=>(<SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-gray-600">Agent</label>
          <Select value={agentId?.toString()} onValueChange={(v)=>setAgentId(v?Number(v):undefined)}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Tous" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous</SelectItem>
              {agentsOptions.map((a:any)=>(<SelectItem key={a.value} value={String(a.value)}>{a.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-gray-600">Criticité</label>
          <Select value={criticality} onValueChange={(v:any)=>setCriticality(v||undefined)}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Toutes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes</SelectItem>
              <SelectItem value="faible">Faible</SelectItem>
              <SelectItem value="moyenne">Moyenne</SelectItem>
              <SelectItem value="haute">Haute</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-gray-600">Statut</label>
          <Select value={status} onValueChange={(v:any)=>setStatus(v||undefined)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Tous" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="pending_review">À revoir</SelectItem>
              <SelectItem value="assigned">Assigné</SelectItem>
              <SelectItem value="resolved">Résolu</SelectItem>
              <SelectItem value="rejected">Rejeté</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-gray-600">Intervalle</label>
          <Select value={interval} onValueChange={(v:any)=>setInterval(v)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Quotidien</SelectItem>
              <SelectItem value="weekly">Hebdo</SelectItem>
              <SelectItem value="monthly">Mensuel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={()=>setPreset(7)}>7j</Button>
          <Button variant="outline" onClick={()=>setPreset(30)}>30j</Button>
          <Button variant="outline" onClick={()=>setPreset(90)}>90j</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3" role="status" aria-live="polite">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({length:8}).map((_,i)=>(<Skeleton key={i} className="h-20" />))}
          </div>
          <div className="border rounded p-3"><Skeleton className="h-64" /></div>
        </div>
      ) : error ? (
        <div className="rounded border border-red-200 bg-red-50 text-red-700 p-3" role="alert">{error}</div>
      ) : (
        <Tabs value={activeTab} onValueChange={(v)=>setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="grid gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Kpi label="# signalements" value={overview?.totals?.created ?? 0} />
              <Kpi label="# en cours" value={overview?.totals?.in_progress ?? 0} />
              <Kpi label="# résolus" value={overview?.totals?.resolved ?? 0} />
              <Kpi label="Backlog" value={overview?.totals?.backlog ?? 0} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Kpi label="SLA Revue à l'heure" value={`${slaSummary?.compliance?.review?.on_time_pct ?? 0}%`} />
              <Kpi label="SLA Assignation à l'heure" value={`${slaSummary?.compliance?.assign?.on_time_pct ?? 0}%`} />
              <Kpi label="SLA Résolution à l'heure" value={`${slaSummary?.compliance?.resolve?.on_time_pct ?? 0}%`} />
              <Kpi label="Breaches" value={(slaSummary?.compliance?.review?.breaches ?? 0) + (slaSummary?.compliance?.assign?.breaches ?? 0) + (slaSummary?.compliance?.resolve?.breaches ?? 0)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border rounded p-3">
                <div className="text-sm text-gray-600 mb-2">TTR</div>
                <div className="grid grid-cols-3 gap-3">
                  <Kpi label="Moyenne (h)" value={overview?.resolution?.avg_hours ?? 0} />
                  <Kpi label="Médiane (h)" value={overview?.resolution?.median_hours ?? 0} />
                  <Kpi label="P90 (h)" value={overview?.resolution?.p90_hours ?? 0} />
                </div>
              </div>
              <div className="border rounded p-3">
                <div className="text-sm text-gray-600 mb-2">Temps moyens</div>
                <div className="grid grid-cols-2 gap-3">
                  <Kpi label="1ère revue (h)" value={overview?.time_to_first_review_hours_avg ?? 0} />
                  <Kpi label="Assignation (h)" value={overview?.time_to_assignment_hours_avg ?? 0} />
                </div>
              </div>
              <div className="border rounded p-3">
                <div className="text-sm text-gray-600 mb-2">Backlog aging</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between"><span>{'<'}24h</span><span>{overview?.backlog_age_buckets?.lt_24h ?? 0}</span></div>
                  <div className="flex justify-between"><span>1-3j</span><span>{overview?.backlog_age_buckets?.d1_3 ?? 0}</span></div>
                  <div className="flex justify-between"><span>3-7j</span><span>{overview?.backlog_age_buckets?.d3_7 ?? 0}</span></div>
                  <div className="flex justify-between"><span>{'>'}7j</span><span>{overview?.backlog_age_buckets?.gt_7d ?? 0}</span></div>
                </div>
              </div>
            </div>
            <div className="border rounded p-3">
              <div className="text-sm text-gray-600 mb-2">Fréquence mensuelle (héritée)</div>
              {monthlyLegacy.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyLegacy}>
                      <XAxis dataKey="month" /><YAxis /><Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#0ea5e9" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500 text-sm">Aucune donnée pour la période sélectionnée</div>
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={exportPdf}>Export PDF</Button>
              <Button variant="outline" onClick={exportXlsx}>Export Excel</Button>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="grid gap-4">
            <div className="grid gap-4">
              <Section title="Par type" description="Répartition par type d'infrastructure">
                <BreakdownTable data={breakdownType} />
                <Bars data={breakdownType} />
              </Section>
              <Section title="Par zone" description="Répartition par zone">
                <BreakdownTable data={breakdownZone} />
                <Bars data={breakdownZone} />
              </Section>
              <Section title="Par agent" description="Répartition par agent">
                <BreakdownTable data={breakdownAgent} />
                <Bars data={breakdownAgent} />
              </Section>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="grid gap-4">
            <div className="border rounded p-3">
              <div className="text-sm text-gray-600 mb-2">Créés vs Résolus vs Backlog</div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends?.series || []}>
                    <XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />
                    <Line type="monotone" dataKey="created" stroke="#0ea5e9" name="Créés" />
                    <Line type="monotone" dataKey="resolved" stroke="#22c55e" name="Résolus" />
                    <Line type="monotone" dataKey="backlog" stroke="#ef4444" name="Backlog" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="border rounded p-3">
              <div className="text-sm text-gray-600 mb-2">Conformité SLA (résolution)</div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends?.sla_compliance_series || []}>
                    <XAxis dataKey="date" /><YAxis domain={[0,100]} /><Tooltip />
                    <Line type="monotone" dataKey="resolve_on_time_rate_pct" stroke="#a855f7" name="Résolution à l'heure (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function Kpi({ label, value }:{label:string; value:any}){
  return (
    <div className="border rounded p-3" role="group" aria-label={label}>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Section({ title, description, children }:{title:string; description:string; children:any}){
  return (
    <div className="border rounded p-3">
      <div className="mb-2">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

function BreakdownTable({ data }:{ data: any[] }){
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Clé</TableHead>
            <TableHead>Créés</TableHead>
            <TableHead>Résolus</TableHead>
            <TableHead>Delai moy. (h)</TableHead>
            <TableHead>SLA à l'heure (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((row:any)=> (
            <TableRow key={`${row.key.id}`}>
              <TableCell>{row.key.name}</TableCell>
              <TableCell>{row.counts.created}</TableCell>
              <TableCell>{row.counts.resolved}</TableCell>
              <TableCell>{row.resolution.avg_hours}</TableCell>
              <TableCell>{row.sla?.resolve_on_time_rate_pct ?? '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Bars({ data }:{ data:any[] }){
  const chartData = (data||[]).map((d:any)=>({ name: d.key.name, created: d.counts.created, resolved: d.counts.resolved }));
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis dataKey="name" hide={chartData.length>8} /><YAxis /><Tooltip /><Legend />
          <Bar dataKey="created" fill="#0ea5e9" name="Créés" />
          <Bar dataKey="resolved" fill="#22c55e" name="Résolus" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
