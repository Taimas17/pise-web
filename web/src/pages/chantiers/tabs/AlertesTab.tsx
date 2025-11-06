import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

export default function AlertesTab({ chantierId, reports = [], onChanged }: { chantierId: number; reports?: any[]; onChanged: () => void }){
  const [reportId, setReportId] = useState('');
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2 animate-slide-up">
        <Input placeholder="ID alerte" value={reportId} onChange={(e)=> setReportId(e.target.value)} className="w-40" />
        <Button onClick={async ()=> { if(!reportId) return; await api.post(`/chantiers/${chantierId}/reports`, { report_id: Number(reportId) }); toast('Liée'); onChanged(); setReportId(''); }}>Lier</Button>
      </div>
      <div className="grid gap-2">
        {reports.map((r:any)=> (
          <div key={r.id} className="border rounded p-3 flex items-center justify-between animate-slide-up">
            <div>
              <div className="font-medium">Alerte #{r.id} — {r.title}</div>
              <div className="text-sm text-muted-foreground">{r.status} • {r.criticality}</div>
            </div>
            <div className="flex items-center gap-2">
              <a className="text-sky-600" href={`/suivi/${r.id}`}>Ouvrir</a>
              <Button variant="destructive" onClick={async ()=> { if(!confirm('Délier ?')) return; await api.delete(`/chantiers/${chantierId}/reports/${r.id}`); toast('Déliée'); onChanged(); }}>Délier</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
