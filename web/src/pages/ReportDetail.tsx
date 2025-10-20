import { useEffect, useState } from "react";
import { api, API_URL } from "../lib/api";
import { useParams } from "react-router-dom";
import Map from "../components/Map";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

export default function ReportDetail(){
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [agentId, setAgentId] = useState("");

  async function load(){ const { data } = await api.get(`/reports/${id}`); setReport(data); }
  useEffect(()=>{ load(); }, [id]);

  async function approve(){ await api.post(`/reports/${id}/review`, { action: 'approve', comment }); await load(); }
  async function reject(){ await api.post(`/reports/${id}/review`, { action: 'reject', comment }); await load(); }
  async function assign(){ if(!agentId) return; await api.post(`/reports/${id}/assign`, { agent_id: Number(agentId) }); await load(); }
  async function resolve(){ await api.patch(`/reports/${id}`, { status: 'resolved', comment }); await load(); }

  if (!report) return <p>Chargement…</p>;

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
          <Button onClick={approve}>Approuver</Button>
          <Button variant="destructive" onClick={reject}>Rejeter</Button>
          <div className="flex items-center gap-2">
            <Input placeholder="ID Agent" value={agentId} onChange={e=>setAgentId(e.target.value)} className="w-28" />
            <Button variant="outline" onClick={assign}>Assigner</Button>
          </div>
          <Button variant="outline" onClick={resolve}>Marquer résolu</Button>
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
