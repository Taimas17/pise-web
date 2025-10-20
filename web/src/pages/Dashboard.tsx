import { useEffect, useState } from "react";
import { api, API_URL } from "../lib/api";
import { Button } from "../components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard(){
  const [stats, setStats] = useState<any>(null);

  async function load(){ const { data } = await api.get('/reports/stats'); setStats(data); }
  useEffect(()=>{ load(); },[]);

  if (!stats) return <p>Chargement…</p>;

  const monthly = stats.monthly_frequency?.map((d:any)=>({ month: d.month, count: Number(d.count) })) || [];

  const exportPdf = () => { window.open(`${API_URL}/api/exports/reports.pdf`, '_blank'); };
  const exportXlsx = () => { window.open(`${API_URL}/api/exports/reports.xlsx`, '_blank'); };

  return (
    <div className="grid gap-6">
      <h2 className="text-xl font-semibold">Tableau de bord</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="# signalements" value={stats.total_reports} />
        <Kpi label="# résolus" value={stats.resolved_reports} />
        <Kpi label="Taux de résolution" value={`${stats.resolution_rate}%`} />
        <Kpi label="Délai moyen (h)" value={stats.avg_resolution_hours} />
      </div>
      <div className="border rounded p-3">
        <div className="text-sm text-gray-600 mb-2">Fréquence mensuelle</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly}>
              <XAxis dataKey="month" /><YAxis /><Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0ea5e9" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex gap-3">
        <Button onClick={exportPdf}>Export PDF</Button>
        <Button variant="outline" onClick={exportXlsx}>Export Excel</Button>
      </div>
    </div>
  );
}

function Kpi({ label, value }:{label:string; value:any}){
  return (
    <div className="border rounded p-3">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
