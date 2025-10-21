import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../components/ui/pagination";
import { Skeleton } from "../components/ui/skeleton";

export default function ReportsList(){
  const [reports, setReports] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [filters, setFilters] = useState({ status: '', type_id: '', criticality: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  async function load(){
    setLoading(true); setError(null);
    try {
      const params = Object.fromEntries(Object.entries({ ...filters, page }).filter(([_,v])=>v));
      const { data } = await api.get('/reports', { params });
      if (data?.data) {
        setReports(data.data);
        setLastPage(data?.meta?.last_page || null);
      } else {
        setReports(data);
        setLastPage(null);
      }
      titleRef.current?.focus();
    } catch (e: any) {
      setError('Erreur de chargement');
    } finally { setLoading(false); }
  }
  useEffect(()=>{ (async()=>{ try{ const {data} = await api.get('/infrastructure-types'); setTypes(data); }catch{} })(); },[]);
  useEffect(()=>{ load(); }, [filters, page]);

  return (
    <div className="grid gap-4" aria-busy={loading}>
      <h2 className="text-xl font-semibold" tabIndex={-1} ref={titleRef}>Suivi des signalements</h2>
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={filters.status} onValueChange={v=>{ setPage(1); setFilters(f=>({ ...f, status: v })) }}>
          <SelectTrigger className="w-48" aria-label="Filtrer par statut"><SelectValue placeholder="Statut"/></SelectTrigger>
          <SelectContent>
            {['draft','pending_review','assigned','resolved','rejected'].map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.type_id} onValueChange={v=>{ setPage(1); setFilters(f=>({ ...f, type_id: v })) }}>
          <SelectTrigger className="w-56" aria-label="Filtrer par type"><SelectValue placeholder="Type"/></SelectTrigger>
          <SelectContent>
            {types.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.criticality} onValueChange={v=>{ setPage(1); setFilters(f=>({ ...f, criticality: v })) }}>
          <SelectTrigger className="w-48" aria-label="Filtrer par criticité"><SelectValue placeholder="Criticité"/></SelectTrigger>
          <SelectContent>
            {['faible','moyenne','haute'].map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={filters.from} onChange={e=>{ setPage(1); setFilters(f=>({ ...f, from: e.target.value })) }} className="w-44" aria-label="Date de début" />
        <Input type="date" value={filters.to} onChange={e=>{ setPage(1); setFilters(f=>({ ...f, to: e.target.value })) }} className="w-44" aria-label="Date de fin" />
      </div>

      {loading && (
        <div role="status" aria-live="polite" className="grid gap-2">
          {Array.from({length:6}).map((_,i)=>(
            <div key={i} className="border rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-52" />
                <div className="flex gap-2"><Skeleton className="h-5 w-16" /><Skeleton className="h-5 w-16" /></div>
              </div>
              <Skeleton className="h-3 w-72" />
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}

      {!loading && !error && (
        <div className="grid gap-2">
          {reports.length === 0 && <div className="text-sm text-gray-600">Aucun résultat</div>}
          {reports.map((r:any)=> (
            <Link to={`/suivi/${r.id}`} key={r.id} className="border rounded p-3 hover:bg-gray-50" aria-label={`Ouvrir le signalement #${r.id}`}>
              <div className="flex items-center justify-between">
                <div className="font-medium">#{r.id} — {r.title || r.type?.name}</div>
                <div className="flex gap-2">
                  <Badge variant={r.status === 'rejected' ? 'destructive' : r.status === 'resolved' ? 'secondary' : 'outline'} aria-label={`Statut ${r.status}`}>{r.status}</Badge>
                  {r.criticality && <Badge variant={r.criticality === 'haute' ? 'destructive' : r.criticality === 'moyenne' ? 'default' : 'secondary'} aria-label={`Criticité ${r.criticality}`}>{r.criticality}</Badge>}
                </div>
              </div>
              <div className="text-sm text-gray-600">{r.description?.slice(0,140)}</div>
            </Link>
          ))}
        </div>
      )}

      {lastPage && lastPage > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious aria-label="Page précédente" href="#" onClick={(e)=>{ e.preventDefault(); setPage(p=>Math.max(1, p-1)); }} />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink aria-label={`Page ${page}`} href="#" isActive>{page}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext aria-label="Page suivante" href="#" onClick={(e)=>{ e.preventDefault(); setPage(p=> lastPage ? Math.min(lastPage, p+1) : p+1); }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
