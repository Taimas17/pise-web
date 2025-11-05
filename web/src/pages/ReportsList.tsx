import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export default function ReportsList(){
  const [reports, setReports] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [filters, setFilters] = useState({ status: '', type_id: '', criticality: '', q: '', from: '', to: '', commune_id: '', arrondissement_id: '', quartier_id: '' });
const [communes, setCommunes] = useState<any[]>([]);
const [arrondissements, setArrondissements] = useState<any[]>([]);
const [quartiers, setQuartiers] = useState<any[]>([]);

  async function load(){
    const params = Object.fromEntries(Object.entries(filters).filter(([_,v])=>v));
    const { data } = await api.get('/reports', { params });
    setReports(data.data || data);
  }
  useEffect(()=>{ (async()=>{ try{ const {data} = await api.get('/infrastructure-types'); setTypes(data); const { data: com } = await api.get('/zones', { params: { level: 'commune' } }); setCommunes(com); }catch{ void 0 } })(); },[]);
useEffect(()=>{ (async()=>{ if(filters.commune_id){ const { data } = await api.get('/zones', { params: { level: 'arrondissement', parent_id: filters.commune_id } }); setArrondissements(data); setQuartiers([]); } else { setArrondissements([]); setQuartiers([]);} })(); }, [filters.commune_id]);
useEffect(()=>{ (async()=>{ if(filters.arrondissement_id){ const { data } = await api.get('/zones', { params: { level: 'quartier', parent_id: filters.arrondissement_id } }); setQuartiers(data); } else { setQuartiers([]);} })(); }, [filters.arrondissement_id]);
  useEffect(()=>{ load(); }, [filters]);

  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">Suivi des signalements</h2>
      <div className="flex flex-wrap gap-2 items-center">
        <Input placeholder="Recherche" value={filters.q} onChange={e=>setFilters(f=>({ ...f, q: e.target.value }))} className="w-64" />
        <Select value={filters.status} onValueChange={v=>setFilters(f=>({ ...f, status: v }))}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Statut"/></SelectTrigger>
          <SelectContent>
            {['draft','pending_review','assigned','resolved','rejected'].map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.type_id} onValueChange={v=>setFilters(f=>({ ...f, type_id: v }))}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Type"/></SelectTrigger>
          <SelectContent>
            {types.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.criticality} onValueChange={v=>setFilters(f=>({ ...f, criticality: v }))}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Criticité"/></SelectTrigger>
          <SelectContent>
            {['faible','moyenne','haute'].map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={filters.from} onChange={e=>setFilters(f=>({ ...f, from: e.target.value }))} />
        <Input type="date" value={filters.to} onChange={e=>setFilters(f=>({ ...f, to: e.target.value }))} />
        <Select value={filters.commune_id} onValueChange={v=>setFilters(f=>({ ...f, commune_id: v, arrondissement_id: '', quartier_id: '' }))}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Commune"/></SelectTrigger>
          <SelectContent>{communes.map(z => <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filters.arrondissement_id} onValueChange={v=>setFilters(f=>({ ...f, arrondissement_id: v, quartier_id: '' }))}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Arrondissement"/></SelectTrigger>
          <SelectContent>{arrondissements.map(z => <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filters.quartier_id} onValueChange={v=>setFilters(f=>({ ...f, quartier_id: v }))}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Quartier"/></SelectTrigger>
          <SelectContent>{quartiers.map(z => <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="outline" onClick={()=>window.open(`/api/exports/reports.geojson?${new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([_,v])=>v))).toString()}`,'_blank')}>Exporter GeoJSON</Button>
      </div>
      <div className="grid gap-2">
        {reports.map((r:any)=> (
          <Link to={`/suivi/${r.id}`} key={r.id} className="border rounded p-3 hover:bg-gray-50">
            <div className="flex justify-between">
              <div className="font-medium">#{r.id} — {r.title || r.type?.name}</div>
              <div className="text-sm text-gray-600">{r.status}</div>
            </div>
            <div className="text-sm text-gray-600">{r.description?.slice(0,100)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
