import { useEffect, useState } from "react";
import { api, API_URL } from "../lib/api";
import { useParams } from "react-router-dom";
import Map from "../components/Map";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { toast } from "../components/ui/sonner";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

function SlaBlock({ label, dueAt, doneAt, nowTs }:{ label:string; dueAt?: string; doneAt?: string; nowTs: number }){
  if(!dueAt) return (
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="font-medium">—</div>
    </div>
  );
  const due = new Date(dueAt).getTime();
  const done = doneAt ? new Date(doneAt).getTime() : null;
  const remainingMs = (done || nowTs) - due;
  const late = remainingMs > 0 && !done ? false : (done ? done > due : nowTs > due);
  const abs = Math.abs(remainingMs);
  const h = Math.floor(abs/3600000); const m = Math.floor((abs%3600000)/60000); const s = Math.floor((abs%60000)/1000);
  return (
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className={"font-medium "+(done? (done>due?"text-red-600":"text-emerald-600") : (nowTs>due?"text-red-600":"text-emerald-600"))}>
        {done? (done>due?"Hors délai":"À l’heure") : (nowTs>due?"Hors délai":"À l’heure")} — {nowTs>due?"+":"-"}{h.toString().padStart(2,'0')}:{m.toString().padStart(2,'0')}:{s.toString().padStart(2,'0')}
      </div>
    </div>
  );
}

function SlaLegend(){
  return (
    <div className="text-xs text-gray-600">SLA: À l’heure = délai respecté; Hors délai = délai dépassé.</div>
  );
}

function StatusBadge({ value }: { value?: string }){
  const map: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800 border-gray-200",
    pending_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
    assigned: "bg-sky-100 text-sky-800 border-sky-200",
    resolved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };
  return <Badge className={map[value || ""] || "bg-gray-100 text-gray-800 border-gray-200"}>{value || ""}</Badge>;
}

function CritBadge({ value }: { value?: string }){
  const map: Record<string, string> = {
    faible: "bg-gray-100 text-gray-800 border-gray-200",
    moyenne: "bg-orange-100 text-orange-800 border-orange-200",
    haute: "bg-red-100 text-red-800 border-red-200",
  };
  return <Badge className={map[value || ""] || "bg-gray-100 text-gray-800 border-gray-200"}>{value || ""}</Badge>;
}

export default function ReportDetail(){
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [agentId, setAgentId] = useState("");
  const [closedCategory, setClosedCategory] = useState("");
  const [closedReason, setClosedReason] = useState("");
  const [nowTs, setNowTs] = useState(Date.now());

  async function load(){ const { data } = await api.get(`/reports/${id}`); setReport(data); }
  useEffect(()=>{ load(); }, [id]);
  useEffect(()=>{ const t = setInterval(()=>setNowTs(Date.now()), 1000); return ()=>clearInterval(t); },[]);

  async function approve(){ await api.post(`/reports/${id}/review`, { action: 'approve', comment }); await load(); }
  async function reject(){ await api.post(`/reports/${id}/review`, { action: 'reject', comment }); await load(); }
  async function assign(){ if(!agentId) return; await api.post(`/reports/${id}/assign`, { agent_id: Number(agentId) }); await load(); }
  async function resolve(){ await api.patch(`/reports/${id}`, { status: 'resolved', comment, closed_category: closedCategory, closed_reason: closedReason }); await load(); }

  if (!report) return <p>Chargement…</p>;

  return (
    <div className="grid gap-4">
      <Breadcrumbs items={[{ label: 'Suivi', href: '/suivi' }, { label: `Signalement #${report.id}` }]} />

      <div className="flex items-center justify-between">
        <h2 className="text-responsive-h2">Signalement #{report.id}</h2>
        <div className="flex flex-wrap gap-2">
          {report.criticality && <CritBadge value={report.criticality} />}
          {report.status && <StatusBadge value={report.status} />}
        </div>
      </div>

      {report.lat_masked && report.lng_masked && (
        <Card className="card-hover">
          <CardHeader className="border-b">
            <CardTitle>Localisation</CardTitle>
            <CardDescription>Coordonnées approximatives pour confidentialité</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Map lat={report.lat_masked} lng={report.lng_masked} />
          </CardContent>
        </Card>
      )}

      <Card className="card-hover">
        <CardHeader className="border-b">
          <CardTitle>Informations</CardTitle>
          <CardDescription>Détails, statut et SLA</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 grid gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Statut</div>
              <div className="font-medium">{report.status}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Criticité</div>
              <div className="font-medium">{report.criticality}</div>
            </div>
            <SlaBlock label="SLA résolution" dueAt={report.sla_due_at} doneAt={report.resolved_at} nowTs={nowTs} />
            <SlaBlock label="SLA revue" dueAt={report.sla_review_due_at} doneAt={report.reviewed_at} nowTs={nowTs} />
          </div>
          <SlaLegend />
          {report.description && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Description</div>
              <div className="text-gray-800">{report.description}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="border-b">
          <CardTitle>Actions</CardTitle>
          <CardDescription>Revue, assignation et clôture</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 grid gap-3">
          <Textarea placeholder="Commentaire" value={comment} onChange={e=>setComment(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="text-sm text-gray-600 mb-1">Catégorie de clôture</div>
              <select value={closedCategory} onChange={e=>setClosedCategory(e.target.value)} className="border rounded h-9 px-2 w-full">
                <option value="">—</option>
                <option value="maintenance_corrective">Maintenance corrective</option>
                <option value="maintenance_preventive">Maintenance préventive</option>
                <option value="fausse_alerte">Fausse alerte</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-gray-600 mb-1">Motif de clôture</div>
              <Input placeholder="Saisir le motif" value={closedReason} onChange={e=>setClosedReason(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            <Button onClick={approve}>Approuver</Button>
            <Button variant="destructive" onClick={reject}>Rejeter</Button>
            <div className="flex items-center gap-2">
              <Input placeholder="ID Agent" value={agentId} onChange={e=>setAgentId(e.target.value)} className="w-28" />
              <Button variant="outline" onClick={assign}>Assigner</Button>
            </div>
            <Button variant="outline" onClick={resolve}>Marquer résolu</Button>
          </div>
        </CardContent>
      </Card>

      {report.photos?.length ? (
        <Card className="card-hover">
          <CardHeader className="border-b">
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {report.photos?.map((p:any)=>(
                <a href={`${API_URL}/storage/${p.path}`} key={p.id} target="_blank">
                  <img src={`${API_URL}/storage/${p.thumbnail_path || p.path}`} className="w-full h-32 object-cover border rounded"/>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}