import { useEffect, useState } from "react";
import { api, API_URL } from "../lib/api";
import { Button } from "../components/ui/button";
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Download, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";

export default function Dashboard(){
  const [stats, setStats] = useState<any>(null);
  const [period, setPeriod] = useState<'7'|'30'|'90'>('30');
  const [reports, setReports] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);

  async function load(){ const { data } = await api.get('/reports/stats', { params: { } }); setStats(data); }
  async function loadReports(){ const from = new Date(); from.setDate(from.getDate() - Number(period) + 1); const { data } = await api.get('/reports', { params: { from: from.toISOString().slice(0,10) } }); setReports(data.data || data); }
  useEffect(()=>{ load(); },[]);
  useEffect(()=>{ (async()=>{ try{ const { data } = await api.get('/infrastructure-types'); setTypes(data); } catch {} })(); },[]);
  useEffect(()=>{ loadReports(); }, [period]);

  const isMobile = useIsMobile();

  if (!stats) return <p>Chargement…</p>;

  const typeMap = Object.fromEntries((types||[]).map((t:any)=>[t.id, t.name]));
  const typeData = (stats.by_type||[]).map((d:any)=>({ name: typeMap[d.infrastructure_type_id] || `Type ${d.infrastructure_type_id}`, count: Number(d.count) }));
  const critData = (stats.by_criticality||[]).map((d:any)=>({ name: d.criticality, count: Number(d.count) }));
  const zoneCommune = (stats.by_zone?.commune||[]).map((z:any)=>({ name: z.name, count: Number(z.count) }));
  const zoneArr = (stats.by_zone?.arrondissement||[]).map((z:any)=>({ name: z.name, count: Number(z.count) }));
  const zoneQuart = (stats.by_zone?.quartier||[]).map((z:any)=>({ name: z.name, count: Number(z.count) }));

  const exportPdf = () => { window.open(`${API_URL}/api/exports/reports.pdf`, '_blank'); };
  const exportExcel = () => { window.open(`${API_URL}/api/exports/reports.xlsx`, '_blank'); };
  const exportGeojson = () => { window.open(`${API_URL}/api/exports/reports.geojson`, '_blank'); };
  
  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-responsive-h2">Tableau de bord</h2>
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={period} onValueChange={(v:any)=> v && setPeriod(v)} variant="outline">
            <ToggleGroupItem value="7">7 j</ToggleGroupItem>
            <ToggleGroupItem value="30">30 j</ToggleGroupItem>
            <ToggleGroupItem value="90">90 j</ToggleGroupItem>
          </ToggleGroup>

          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="touch-target"><Download className="mr-2 size-4"/>Exporter</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportPdf}>PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={exportExcel}>Excel</DropdownMenuItem>
                <DropdownMenuItem onClick={exportGeojson}>GeoJSON</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button onClick={exportPdf}><Download className="mr-2 size-4"/>PDF</Button>
              <Button variant="outline" onClick={exportExcel}>Excel</Button>
              <Button variant="outline" onClick={exportGeojson}>GeoJSON</Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Kpi icon={<TrendingUp className="size-5 text-sky-600"/>} label="# signalements" value={stats.total_reports} tint="bg-sky-50" />
        <Kpi icon={<CheckCircle className="size-5 text-green-600"/>} label="# résolus" value={stats.resolved_reports} tint="bg-green-50" />
        <Kpi icon={<TrendingUp className="size-5 text-emerald-600"/>} label="Taux de résolution" value={`${stats.resolution_rate}%`} tint="bg-emerald-50" />
        <Kpi icon={<Clock className="size-5 text-amber-600"/>} label="Délai résol. moyen (h)" value={stats.avg_resolution_hours} tint="bg-amber-50" />
        <Kpi icon={<Clock className="size-5 text-indigo-600"/>} label="Délai revue moyen (h)" value={stats.avg_review_hours} tint="bg-indigo-50" />
        <Kpi icon={<CheckCircle className="size-5 text-teal-700"/>} label="Conformité SLA résol." value={`${stats.sla_compliance_rate}%`} tint="bg-teal-50" />
        <Kpi icon={<CheckCircle className="size-5 text-blue-700"/>} label="Conformité SLA revue" value={`${stats.review_sla_compliance_rate}%`} tint="bg-blue-50" />
      </div>

      <div className="border rounded p-3">
        <div className="text-sm text-gray-600 mb-2">Fréquence mensuelle</div>
        <div className="min-h-[250px] md:min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={(stats.monthly_current||[]).map((d:any)=>({ month: d.month, count: Number(d.count) }))}>
              <XAxis dataKey="month" /><YAxis /><Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0ea5e9" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="border rounded p-3">
          <div className="text-sm text-gray-600 mb-2">Par type</div>
          <div className="min-h-[250px] md:min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <XAxis dataKey="name" hide/>
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="border rounded p-3">
          <div className="text-sm text-gray-600 mb-2">Par criticité</div>
          <div className="min-h-[250px] md:min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={critData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="border rounded p-3">
        <div className="text-sm text-gray-600 mb-2">Par zone</div>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <div className="text-sm text-gray-600 mb-1">Communes</div>
            <div className="min-h-[250px] md:min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneCommune.slice(0,10)}>
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Arrondissements</div>
            <div className="min-h-[250px] md:min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneArr.slice(0,10)}>
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Quartiers</div>
            <div className="min-h-[250px] md:min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneQuart.slice(0,10)}>
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded p-3">
        <div className="text-sm text-gray-600 mb-2">Carte de densité (par criticité)</div>
        <div className="h-[250px] md:h-[350px]">
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

function Kpi({ label, value, icon, tint }:{label:string; value:any; icon?: React.ReactNode; tint?: string}){
  return (
    <div className={`border rounded p-3 ${tint || ''}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}