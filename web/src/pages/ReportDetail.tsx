import { useEffect, useState } from "react";
import { api, API_URL } from "../lib/api";
import { useParams } from "react-router-dom";
import Map from "../components/Map";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { toast } from "../components/ui/sonner";
import { useAuth } from "../hooks/useAuth";

export default function ReportDetail(){
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [agentId, setAgentId] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(){ setLoading(true); try { const { data } = await api.get(`/reports/${id}`); setReport(data); } finally { setLoading(false); } }
  useEffect(()=>{ load(); }, [id]);

  async function approve(){ try { await api.post(`/reports/${id}/review`, { action: 'approve', comment }); toast('Signalement approuvé'); await load(); } catch { toast('Erreur'); } }
  async function reject(){ if (!comment) { toast('Commentaire obligatoire'); return; } if(!confirm('Confirmer le rejet ?')) return; try { await api.post(`/reports/${id}/review`, { action: 'reject', comment }); toast('Signalement rejeté'); await load(); } catch { toast('Erreur'); } }
  async function assign(){ if(!agentId) { toast('ID agent requis'); return; } try { await api.post(`/reports/${id}/assign`, { agent_id: Number(agentId) }); toast('Assigné'); await load(); } catch { toast('Erreur'); } }
  async function resolve(){ if(!confirm('Marquer comme résolu ?')) return; try { await api.patch(`/reports/${id}`, { status: 'resolved', comment }); toast('Marqué résolu'); await load(); } catch { toast('Erreur'); } }

  if (!report || loading) return <p>Chargement…</p>;

  const histories = report.statusHistories || report.status_histories || [];
  const assignments = report.assignments || [];
  const role = user?.role;

  const canReview = role === 'moderator' || role === 'admin';
  const canAssign = role === 'moderator' || role === 'admin';
  const canResolve = role === 'agent' || role === 'moderator' || role === 'admin';

  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">Signalement #{report.id}</h2>
      {report.lat_masked && report.lng_masked && <Map lat={report.lat_masked} lng={report.lng_masked} />}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-600">Statut</div>
          <div className="font-medium">{report.status}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Criticité</div>
          <div className="font-medium">{report.criticality}</div>
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-600">Description</div>
        <div>{report.description}</div>
      </div>

      <div className="grid gap-2">
        <Textarea placeholder="Commentaire" value={comment} onChange={e=>setComment(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {canReview && <Button onClick={approve}>Approuver</Button>}
          {canReview && <Button variant="destructive" onClick={reject}>Rejeter</Button>}
          {canAssign && (
            <div className="flex items-center gap-2">
              <Input placeholder="ID Agent" value={agentId} onChange={e=>setAgentId(e.target.value)} className="w-28" />
              <Button variant="outline" onClick={assign}>Assigner</Button>
            </div>
          )}
          {canResolve && <Button variant="outline" onClick={resolve}>Marquer résolu</Button>}
        </div>
      </div>

      <div>
        <div className="font-medium mb-2">Historique de statut</div>
        <div className="text-sm grid gap-1">
          {histories.length ? histories.map((h:any)=> (
            <div key={h.id || `${h.from}_${h.to}_${h.date}` } className="flex items-center justify-between border rounded p-2">
              <div>
                <div className="font-medium">{h.from_status || h.from} → {h.to_status || h.to}</div>
                {h.comment && <div className="text-gray-600">{h.comment}</div>}
              </div>
              <div className="text-gray-500">{new Date(h.created_at || h.date).toLocaleString()}</div>
            </div>
          )) : <div className="text-gray-600">Aucun historique</div>}
        </div>
      </div>

      <div>
        <div className="font-medium mb-2">Affectations</div>
        <div className="text-sm grid gap-1">
          {assignments.length ? assignments.map((a:any)=> (
            <div key={a.id || `${a.agent_id}_${a.created_at}` } className="flex items-center justify-between border rounded p-2">
              <div>Agent #{a.agent_id}</div>
              <div className="text-gray-500">{new Date(a.created_at || a.date).toLocaleString()}</div>
            </div>
          )) : <div className="text-gray-600">Aucune affectation</div>}
        </div>
      </div>

      <div>
        <div className="font-medium mb-2">Photos</div>
        <div className="flex gap-2 flex-wrap">
          {report.photos?.map((p:any)=>(
            <a href={`${API_URL}/storage/${p.path}`} key={p.id} target="_blank">
              <img 
                src={`${API_URL}/storage/${p.thumbnail_path || p.path}`} 
                className="w-32 h-32 object-cover border"
                onError={(e)=>{ (e.currentTarget as HTMLImageElement).style.display='none'; }}
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
