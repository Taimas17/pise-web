import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Map from '@/components/Map';
import { useUpdateChantier } from '@/hooks/api/useChantiers';

export default function InfosTab({ chantier, types = [] as any[] }: { chantier: any; types?: any[] }){
  const [form, setForm] = useState({ title: chantier.title||'', description: chantier.description||'', status: chantier.status||'planned', infrastructure_type_id: String(chantier.infrastructure_type_id||''), budget_planned: String(chantier.budget_planned||''), budget_committed: String(chantier.budget_committed||''), manager_user_id: String(chantier.manager_user_id||'') });
  const { mutate: updateChantier, isPending } = useUpdateChantier();
  const point = useMemo(() => { const geo = chantier.geometry as any; if (geo && geo.type === 'Point') return { lat: geo.coordinates[1], lng: geo.coordinates[0] }; return null; }, [chantier.geometry]);

  return (
    <div className="grid gap-4">
      <div className="grid md:grid-cols-2 gap-4 animate-slide-up">
        <div className="grid gap-2">
          <Input placeholder="Titre" value={form.title} onChange={e=>setForm(f=>({...f, title: e.target.value}))} />
          <Textarea placeholder="Description" value={form.description} onChange={e=>setForm(f=>({...f, description: e.target.value}))} />
          <Select value={form.status} onValueChange={v=>setForm(f=>({...f, status: v}))}>
            <SelectTrigger><SelectValue placeholder="Statut"/></SelectTrigger>
            <SelectContent>{['planned','in_progress','on_hold','completed','cancelled'].map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.infrastructure_type_id} onValueChange={v=>setForm(f=>({...f, infrastructure_type_id: v}))}>
            <SelectTrigger><SelectValue placeholder="Type"/></SelectTrigger>
            <SelectContent>{types.map((t:any)=> <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Budget prévu" value={form.budget_planned} onChange={e=>setForm(f=>({...f, budget_planned: e.target.value}))} />
            <Input placeholder="Budget engagé" value={form.budget_committed} onChange={e=>setForm(f=>({...f, budget_committed: e.target.value}))} />
          </div>
          <Input placeholder="Manager ID" value={form.manager_user_id} onChange={e=>setForm(f=>({...f, manager_user_id: e.target.value}))} />
          <div>
            <Button onClick={() => updateChantier({ id: chantier.id, payload: form as any })} disabled={isPending} className="transition-transform active:scale-95">Enregistrer</Button>
          </div>
        </div>
        <div>
          {point ? <Map lat={point.lat} lng={point.lng} /> : <div className="text-sm text-muted-foreground">Pas de géométrie fournie</div>}
        </div>
      </div>
    </div>
  );
}
