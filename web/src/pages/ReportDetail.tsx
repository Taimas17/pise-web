import { useEffect, useState } from "react";
import { api, API_URL } from "../lib/api";
import { useParams } from "react-router-dom";
import Map from "../components/Map";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { toast } from "../components/ui/sonner";

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
      <h2 className="text-xl font-semibold">Signalement #{report.id}</h2>
      {report.lat_masked && report.lng_masked && <Map lat={report.lat_masked} lng={report.lng_masked} />}
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
      <div>
        <div className="text-sm text-gray-600">Description</div>
        <div>{report.description}</div>
      </div>
      <div className="grid gap-2">
        <Textarea placeholder="Commentaire" value={comment} onChange={e=>setComment(e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
        <div className="flex flex-wrap gap-2 mt-2">
          <Button onClick={approve}>Approuver</Button>
          <Button variant="destructive" onClick={reject}>Rejeter</Button>
          <div className="flex items-center gap-2">
            <Input placeholder="ID Agent" value={agentId} onChange={e=>setAgentId(e.target.value)} className="w-28" />
            <Button variant="outline" onClick={assign}>Assigner</Button>
          </div>
          <Button variant="outline" onClick={resolve}>Marquer résolu</Button>
        </div>
        <div className="mt-4 grid gap-2">
          <div className="font-medium">Chantiers</div>
          <div className="flex items-center gap-2">
            <Input placeholder="ID chantier" id="chantier_id" className="w-32" />
            <Button variant="outline" onClick={async()=>{
              const el = document.getElementById('chantier_id') as HTMLInputElement | null;
              const cid = el?.value; if(!cid) return;
              await api.post(`/chantiers/${cid}/reports`, { report_id: Number(id) });
              toast('Alerte liée au chantier');
            }}>Lier à un chantier</Button>
            <Button onClick={async()=>{
              const payload:any = {
                title: report.title || `${report.type?.name || 'Chantier'} #${report.id}`,
                description: report.description,
                infrastructure_type_id: report.infrastructure_type_id,
                zone_id: report.zone_id,
                status: 'planned',
                planned_start_at: new Date().toISOString().slice(0,10)+' 00:00:00',
                planned_end_at: new Date(Date.now()+30*24*3600*1000).toISOString().slice(0,10)+' 00:00:00',
                budget_planned: 0,
              };
              const { data } = await api.post('/chantiers', payload);
              await api.post(`/chantiers/${data.id}/reports`, { report_id: Number(id) });
              toast('Chantier créé et lié');
            }}>Créer un chantier à partir de l’alerte</Button>
          </div>
        </div>
      </div>
      <div>
        <div className="font-medium mb-2">Photos</div>
        <div className="flex gap-2 flex-wrap">
          {report.photos?.map((p:any)=>(<a href={`${API_URL}/storage/${p.path}`} key={p.id} target="_blank">
            <img src={`${API_URL}/storage/${p.thumbnail_path || p.path}`} className="w-32 h-32 object-cover border"/>
          </a>))}
        </div>
      </div>
    </div>
  );
}
