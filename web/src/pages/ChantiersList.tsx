import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export default function ChantiersList(){
  const [rows, setRows] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [filters, setFilters] = useState({ status: '', infrastructure_type_id: '', q: '', from: '', to: '', zone_commune_id: '', zone_arrondissement_id: '', zone_quartier_id: '', zone_id: '', manager_user_id: '', sort: '-created_at' });
  const [communes, setCommunes] = useState<any[]>([]);
  const [arrondissements, setArrondissements] = useState<any[]>([]);
  const [quartiers, setQuartiers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any | null>(null);

  async function load(){
    const params = Object.fromEntries(Object.entries({
      status: filters.status,
      infrastructure_type_id: filters.infrastructure_type_id,
      q: filters.q,
      from: filters.from,
      to: filters.to,
      zone_id: filters.zone_id,
      manager_user_id: filters.manager_user_id,
      sort: filters.sort,
    }).filter(([_,v])=>v));
    const { data } = await api.get('/chantiers', { params });
    setRows(data.data || data);
  }

  useEffect(()=>{ (async()=>{ try{ const {data} = await api.get('/infrastructure-types'); setTypes(data); const { data: com } = await api.get('/zones', { params: { level: 'commune' } }); setCommunes(com); }catch{ void 0 } })(); },[]);
  useEffect(()=>{ (async()=>{ if(filters.zone_commune_id){ const { data } = await api.get('/zones', { params: { level: 'arrondissement', parent_id: filters.zone_commune_id } }); setArrondissements(data); setQuartiers([]); } else { setArrondissements([]); setQuartiers([]);} })(); }, [filters.zone_commune_id]);
  useEffect(()=>{ (async()=>{ if(filters.zone_arrondissement_id){ const { data } = await api.get('/zones', { params: { level: 'quartier', parent_id: filters.zone_arrondissement_id } }); setQuartiers(data); } else { setQuartiers([]);} })(); }, [filters.zone_arrondissement_id]);
  useEffect(()=>{ load(); })
  useEffect(()=>{ (async()=>{ try{ const params = Object.fromEntries(Object.entries(filters).filter(([k,v])=>['infrastructure_type_id','status','from','to','zone_id','manager_user_id'].includes(k) && v)); const { data } = await api.get('/chantiers/metrics', { params }); setMetrics(data); }catch{ void 0 } })(); }, [filters]);

  useEffect(()=>{
    if (filters.zone_quartier_id) setFilters(f=>({ ...f, zone_id: f.zone_quartier_id }));
    else if (filters.zone_arrondissement_id) setFilters(f=>({ ...f, zone_id: f.zone_arrondissement_id }));
    else if (filters.zone_commune_id) setFilters(f=>({ ...f, zone_id: f.zone_commune_id }));
    else setFilters(f=>({ ...f, zone_id: '' }));
  }, [filters.zone_commune_id, filters.zone_arrondissement_id, filters.zone_quartier_id]);

  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">Chantiers</h2>
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <Kpi label="Total" value={metrics.total_chantiers} />
          <Kpi label="En cours" value={metrics.in_progress} />
          <Kpi label="Terminés" value={metrics.completed} />
          <Kpi label="Avancement moyen" value={`${metrics.average_progress_pct}%`} />
          <Kpi label="Exécution budget" value={`${Math.round(metrics.budget_execution_rate*100)}%`} />
          <Kpi label="À l'heure" value={`${Math.round(metrics.on_time_rate*100)}%`} />
        </div>
      )}
      <div className="flex flex-wrap gap-2 items-center">
        <Input placeholder="Recherche" value={filters.q} onChange={e=>setFilters(f=>({ ...f, q: e.target.value }))} className="w-64" />
        <Select value={filters.status} onValueChange={v=>setFilters(f=>({ ...f, status: v }))}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Statut"/></SelectTrigger>
          <SelectContent>
            {['planned','in_progress','on_hold','completed','cancelled'].map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.infrastructure_type_id} onValueChange={v=>setFilters(f=>({ ...f, infrastructure_type_id: v }))}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Type"/></SelectTrigger>
          <SelectContent>
            {types.map((t:any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={filters.from} onChange={e=>setFilters(f=>({ ...f, from: e.target.value }))} />
        <Input type="date" value={filters.to} onChange={e=>setFilters(f=>({ ...f, to: e.target.value }))} />
        <Select value={filters.zone_commune_id} onValueChange={v=>setFilters(f=>({ ...f, zone_commune_id: v, zone_arrondissement_id: '', zone_quartier_id: '' }))}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Commune"/></SelectTrigger>
          <SelectContent>{communes.map((z:any) => <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filters.zone_arrondissement_id} onValueChange={v=>setFilters(f=>({ ...f, zone_arrondissement_id: v, zone_quartier_id: '' }))}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Arrondissement"/></SelectTrigger>
          <SelectContent>{arrondissements.map((z:any) => <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filters.zone_quartier_id} onValueChange={v=>setFilters(f=>({ ...f, zone_quartier_id: v }))}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Quartier"/></SelectTrigger>
          <SelectContent>{quartiers.map((z:any) => <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>)}</SelectContent>
        </Select>
        <Input placeholder="Manager ID" value={filters.manager_user_id} onChange={e=>setFilters(f=>({ ...f, manager_user_id: e.target.value }))} className="w-36" />
        <Select value={filters.sort} onValueChange={v=>setFilters(f=>({ ...f, sort: v }))}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Tri"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="-created_at">Plus récents</SelectItem>
            <SelectItem value="planned_end_at">Fin prévue</SelectItem>
            <SelectItem value="progress_pct">Avancement</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={()=>window.open(`/api/exports/chantiers.pdf?${new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([k,v])=>['infrastructure_type_id','status','from','to','zone_id','manager_user_id'].includes(k) && v))).toString()}`,'_blank')}>Exporter PDF</Button>
        <Button variant="outline" onClick={()=>window.open(`/api/exports/chantiers.xlsx?${new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([k,v])=>['infrastructure_type_id','status','from','to','zone_id','manager_user_id'].includes(k) && v))).toString()}`,'_blank')}>Exporter Excel</Button>
      </div>
      <div className="grid gap-2">
        {rows.map((c:any)=> (
          <Link to={`/chantiers/${c.id}`} key={c.id} className="border rounded p-3 hover:bg-gray-50">
            <div className="flex justify-between">
              <div className="font-medium">#{c.id} — {c.title}</div>
              <div className="text-sm text-gray-600">{c.status} • {c.progress_pct}%</div>
            </div>
            <div className="text-sm text-gray-600">{c.description?.slice(0,120)}</div>
          </Link>
        ))}
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
