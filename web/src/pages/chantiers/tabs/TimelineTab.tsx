import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useCreateEtape, useDeleteEtape, useUpdateEtape } from '@/hooks/api/useChantiers';

const EtapeSchema = z.object({
  lot_id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  planned_start_at: z.string().min(1),
  planned_end_at: z.string().min(1),
  status: z.enum(['planned','in_progress','done','blocked','cancelled']),
  progress_pct: z.coerce.number().min(0).max(100),
  order_index: z.coerce.number().int().min(0),
}).refine(d => new Date(d.planned_end_at) >= new Date(d.planned_start_at), { path: ['planned_end_at'], message: 'La fin doit être ≥ au début' });

export default function TimelineTab({ chantierId, etapes = [], lots = [] }: { chantierId: number; etapes?: any[]; lots?: any[] }){
  const form = useForm<z.infer<typeof EtapeSchema>>({ resolver: zodResolver(EtapeSchema), defaultValues: { name: '', description: '', planned_start_at: '', planned_end_at: '', status: 'planned', progress_pct: 0, order_index: 0, lot_id: '' } });
  const { mutate: createEtape } = useCreateEtape();
  const { mutate: updateEtape } = useUpdateEtape();
  const { mutate: deleteEtape } = useDeleteEtape();

  const ordered = useMemo(() => (etapes || []).slice().sort((a:any,b:any)=> (a.order_index||0)-(b.order_index||0)), [etapes]);

  return (
    <div className="grid gap-4">
      <div className="border rounded p-3 grid gap-2 animate-slide-up">
        <div className="font-medium">Créer une étape</div>
        <form onSubmit={form.handleSubmit((v) => { const payload: any = { ...v }; if (!payload.lot_id) delete payload.lot_id; createEtape({ chantierId, payload }); form.reset(); })} className="grid gap-2">
          <div className="grid md:grid-cols-3 gap-2">
            <Input placeholder="Nom" {...form.register('name')} />
            <Input type="date" {...form.register('planned_start_at')} />
            <Input type="date" {...form.register('planned_end_at')} />
            <Select onValueChange={(v)=> form.setValue('status', v as any)}>
              <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>{['planned','in_progress','done','blocked','cancelled'].map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" step="0.01" placeholder="Avancement %" {...form.register('progress_pct')} />
            <Input type="number" placeholder="Ordre" {...form.register('order_index')} />
          </div>
          <Textarea placeholder="Description" {...form.register('description')} />
          <div><Button type="submit">Ajouter</Button></div>
        </form>
      </div>

      <div className="grid gap-2">
        {ordered.map((e:any, i:number) => (
          <div key={e.id} className="border rounded p-3 flex items-center justify-between animate-slide-up" style={{ animationDelay: `${i*40}ms` }}>
            <div>
              <div className="font-medium">{e.name}</div>
              <div className="text-sm text-muted-foreground">{e.status} • {e.progress_pct}% • {e.planned_start_at?.slice(0,10)} → {e.planned_end_at?.slice(0,10)}</div>
            </div>
            <div className="w-48"><Progress value={Number(e.progress_pct)} /></div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={()=> updateEtape({ id: e.id, payload: { status: e.status === 'done' ? 'planned' : 'done' } })}>Basculer</Button>
              <Button variant="destructive" onClick={()=> deleteEtape(e.id)}>Supprimer</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
