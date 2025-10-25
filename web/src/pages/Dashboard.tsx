import { useEffect, useState } from "react";
import { api, API_URL } from "../lib/api";
import { Button } from "../components/ui/button";
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard(){
  const [stats, setStats] = useState<any>(null);
const [period, setPeriod] = useState<'7'|'30'|'90'>('30');
const [reports, setReports] = useState<any[]>([]);

  async function load(){ const { data } = await api.get('/reports/stats', { params: { } }); setStats(data); }
async function loadReports(){ const from = new Date(); from.setDate(from.getDate() - Number(period) + 1); const { data } = await api.get('/reports', { params: { from: from.toISOString().slice(0,10) } }); setReports(data.data || data); }
  useEffect(()=>{ load(); },[]);
useEffect(()=>{ loadReports(); }, [period]);

  if (!stats) return <p>Chargement…</p>;

  const monthly = stats.monthly_frequency?.map((d:any)=>({ month: d.month, count: Number(d.count) })) || [];

  const exportPdf = () => { window.open(`${API_URL}/api/exports/reports.pdf`, '_blank'); };

const exportGeojson = () => { window.open(`${API_URL}/api/exports/reports.geojson`, '_blank'); };
  

  return (
    <div className="grid gap-6">
      <h2 className="text-xl font-semibold">Tableau de bord</h2>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Kpi label="# signalements" value={stats.total_reports} />
        <Kpi label="# résolus" value={stats.resolved_reports} />
        <Kpi label="Taux de résolution" value={`${stats.resolution_rate}%`} />
        <Kpi label="Délai résol. moyen (h)" value={stats.avg_resolution_hours} />
        <Kpi label="Délai revue moyen (h)" value={stats.avg_review_hours} />
        <Kpi label="Conformité SLA résol." value={`${stats.sla_compliance_rate}%`} />
      </div>
      <div className="border rounded p-3">
        <div className="text-sm text-gray-600 mb-2">Fréquence mensuelle</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={(stats.monthly_current||[]).map((d:any)=>({ month: d.month, count: Number(d.count) }))}>
              <XAxis dataKey="month" /><YAxis /><Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0ea5e9" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex gap-3 items-center">
        <div className="flex items-center gap-1">
          <Button variant={period==='7'?'default':'outline'} onClick={()=>setPeriod('7')}>7 j</Button>
          <Button variant={period==='30'?'default':'outline'} onClick={()=>setPeriod('30')}>30 j</Button>
          <Button variant={period==='90'?'default':'outline'} onClick={()=>setPeriod('90')}>90 j</Button>
        </div>
        <Button onClick={exportPdf}>Export PDF</Button>
        <Button variant="outline" onClick={()=>window.open(`${API_URL}/api/exports/reports.xlsx`, '_blank')}>Export Excel</Button>
        <Button variant="outline" onClick={exportGeojson}>Exporter GeoJSON</Button>
      </div>

      <div className="border rounded p-3">
        <div className="text-sm text-gray-600 mb-2">Carte de densité (par criticité)</div>
        <div style={{height: 320}}>
          <MapContainer center={[14.6937, -17.4441]} zoom={12} style={{height: '100%', width: '100%'}}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
            {reports.filter((r:any)=>r.lat_masked && r.lng_masked).map((r:any)=>{
              const color = r.criticality==='haute'?'#ef4444': r.criticality==='moyenne'?'#f59e0b':'#10b981';
              const radius = r.criticality==='haute'?16: r.criticality==='moyenne'?10:6;
              return <CircleMarker key={r.id} center={[r.lat_masked, r.lng_masked]} pathOptions={{color, fillColor: color, fillOpacity: 0.35}} radius={radius} />
            })}
          </MapContainer>
        </div>
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
