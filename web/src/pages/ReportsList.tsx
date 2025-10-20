import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export default function ReportsList(){
  const [reports, setReports] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [filters, setFilters] = useState({ status: '', type_id: '', criticality: '' });

  async function load(){
    const { data } = await api.get('/reports', { params: Object.fromEntries(Object.entries(filters).filter(([_,v])=>v)) });
    setReports(data.data || data);
  }
  useEffect(()=>{ (async()=>{ try{ const {data} = await api.get('/infrastructure-types'); setTypes(data); }catch{} })(); },[]);
  useEffect(()=>{ load(); }, [filters]);

  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">Suivi des signalements</h2>
      <div className="flex flex-wrap gap-2 items-center">
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
