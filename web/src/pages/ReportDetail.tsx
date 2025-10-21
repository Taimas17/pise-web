import { useEffect, useRef, useState } from "react";
import { api, API_URL } from "../lib/api";
import { useParams } from "react-router-dom";
import Map from "../components/Map";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { toast } from "../components/ui/sonner";
import { useAuth } from "../hooks/useAuth";
import { Skeleton } from "../components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";

export default function ReportDetail(){
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [agentId, setAgentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [openResolve, setOpenResolve] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  async function load(){ setLoading(true); try { const { data } = await api.get(`/reports/${id}`); setReport(data); titleRef.current?.focus(); } finally { setLoading(false); } }
  useEffect(()=>{ load(); }, [id]);

  async function approve(){ try { await api.post(`/reports/${id}/review`, { action: 'approve', comment }); toast('Signalement approuvé'); await load(); } catch { toast('Erreur'); } }
  async function confirmReject(){ if (!comment) { toast('Commentaire obligatoire'); return; } try { await api.post(`/reports/${id}/review`, { action: 'reject', comment }); toast('Signalement rejeté'); setOpenReject(false); await load(); } catch { toast('Erreur'); } }
  async function assign(){ if(!agentId) { toast('ID agent requis'); return; } try { await api.post(`/reports/${id}/assign`, { agent_id: Number(agentId) }); toast('Assigné'); await load(); } catch { toast('Erreur'); } }
  async function confirmResolve(){ try { await api.patch(`/reports/${id}`, { status: 'resolved', comment }); toast('Marqué résolu'); setOpenResolve(false); await load(); } catch { toast('Erreur'); } }

  if (loading || !report) return (
    <div className="grid gap-4" aria-busy>
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-72 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <Skeleton className="h-24" />
    </div>
  );

  const histories = report.statusHistories || report.status_histories || [];
  const assignments = report.assignments || [];
  const role = user?.role;

  const perms = report.permissions || report.can || {};
  const apiCanReview = (perms.review ?? report.can_review) as boolean | undefined;
  const apiCanAssign = (perms.assign ?? report.can_assign) as boolean | undefined;
  const apiCanResolve = (perms.resolve ?? report.can_resolve) as boolean | undefined;

  const roleCanReview = role === 'moderator' || role === 'admin';
  const roleCanAssign = role === 'moderator' || role === 'admin';
  const roleCanResolve = role === 'agent' || role === 'moderator' || role === 'admin';

  const status = report.status as string;
  const fallbackCanReview = status === 'pending_review';
  const fallbackCanAssign = status !== 'resolved' && status !== 'rejected';
  const fallbackCanResolve = status === 'assigned';

  const canReview = roleCanReview && (apiCanReview ?? fallbackCanReview);
  const canAssign = roleCanAssign && (apiCanAssign ?? fallbackCanAssign);
  const canResolve = roleCanResolve && (apiCanResolve ?? fallbackCanResolve);

  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold" tabIndex={-1} ref={titleRef}>Signalement #{report.id}</h2>
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
        <Textarea placeholder="Commentaire" aria-label="Commentaire" value={comment} onChange={e=>setComment(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {roleCanReview && (
            <Button onClick={approve} aria-label="Approuver le signalement" disabled={!canReview} title={!canReview ? `Action indisponible pour le statut ${status}` : undefined}>Approuver</Button>
          )}
          {roleCanReview && (
            <AlertDialog open={openReject} onOpenChange={(o)=> canReview ? setOpenReject(o) : undefined}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" aria-label="Rejeter le signalement" disabled={!canReview} title={!canReview ? `Action indisponible pour le statut ${status}` : undefined}>Rejeter</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer le rejet</AlertDialogTitle>
                  <AlertDialogDescription>
                    Le rejet nécessite un commentaire. Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Textarea placeholder="Commentaire obligatoire" value={comment} onChange={e=>setComment(e.target.value)} aria-label="Commentaire de rejet" />
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmReject}>Confirmer</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {roleCanAssign && (
            <div className="flex items-center gap-2">
              <Input placeholder="ID Agent" aria-label="Identifiant agent" value={agentId} onChange={e=>setAgentId(e.target.value)} className="w-28" disabled={!canAssign} />
              <Button variant="outline" onClick={assign} aria-label="Assigner un agent" disabled={!canAssign} title={!canAssign ? `Action indisponible pour le statut ${status}` : undefined}>Assigner</Button>
            </div>
          )}
          {roleCanResolve && (
            <AlertDialog open={openResolve} onOpenChange={(o)=> canResolve ? setOpenResolve(o) : undefined}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" aria-label="Marquer comme résolu" disabled={!canResolve} title={!canResolve ? `Action indisponible pour le statut ${status}` : undefined}>Marquer résolu</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la résolution</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action marquera le signalement comme résolu.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmResolve}>Confirmer</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div>
        <div className="font-medium mb-2">Historique de statut</div>
        <div className="text-sm grid gap-1">
          {histories.length ? histories.map((h:any, idx:number)=> (
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
          {report.photos?.map((p:any, index:number)=>(
            <a href={`${API_URL}/storage/${p.path}`} key={p.id ?? index} target="_blank">
              <img 
                src={`${API_URL}/storage/${p.thumbnail_path || p.path}`} 
                className="w-32 h-32 object-cover border"
                onError={(e)=>{ (e.currentTarget as HTMLImageElement).style.display='none'; }}
                alt={`Photo ${index+1} du signalement #${report.id}`}
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
