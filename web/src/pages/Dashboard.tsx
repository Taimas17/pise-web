import { useEffect, useMemo, useRef, useState } from "react";
import { api, API_URL } from "../lib/api";
import { Button } from "../components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";

export default function Dashboard(){
  const [stats, setStats] = useState<any>(null);
  const [from, setFrom] = useState<string>(()=> new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10));
  const [to, setTo] = useState<string>(()=> new Date().toISOString().slice(0,10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  async function load(){
    setLoading(true); setError(null);
    try { const { data } = await api.get('/reports/stats', { params: { from, to } }); setStats(data); titleRef.current?.focus(); }
    catch { setError('Erreur de chargement des statistiques'); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, [from, to]);

  const monthly = useMemo(()=> (stats?.monthly_frequency?.map((d:any)=>({ month: d.month, count: Number(d.count) })) || []), [stats]);

  const setPreset = (days: number) => {
    const now = new Date();
    const start = new Date(now.getTime() - days*24*60*60*1000);
    setFrom(start.toISOString().slice(0,10));
    setTo(now.toISOString().slice(0,10));
  };

  const exportPdf = () => { const q = new URLSearchParams({ from, to }).toString(); window.open(`${API_URL}/api/exports/reports.pdf?${q}`, '_blank'); };
  const exportXlsx = () => { const q = new URLSearchParams({ from, to }).toString(); window.open(`${API_URL}/api/exports/reports.xlsx?${q}`, '_blank'); };

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
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={()=>setPreset(7)}>7j</Button>
          <Button variant="outline" onClick={()=>setPreset(30)}>30j</Button>
          <Button variant="outline" onClick={()=>setPreset(90)}>90j</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3" role="status" aria-live="polite">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({length:4}).map((_,i)=>(<Skeleton key={i} className="h-20" />))}
          </div>
          <div className="border rounded p-3">
            <div className="text-sm text-gray-600 mb-2">Fréquence mensuelle</div>
            <Skeleton className="h-64" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded border border-red-200 bg-red-50 text-red-700 p-3" role="alert">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi label="# signalements" value={stats?.total_reports ?? 0} />
            <Kpi label="# résolus" value={stats?.resolved_reports ?? 0} />
            <Kpi label="Taux de résolution" value={`${stats?.resolution_rate ?? 0}%`} />
            <Kpi label="Délai moyen (h)" value={stats?.avg_resolution_hours ?? 0} />
          </div>
          <div className="border rounded p-3">
            <div className="text-sm text-gray-600 mb-2">Fréquence mensuelle</div>
            {monthly.length ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthly}>
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
        </>
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
