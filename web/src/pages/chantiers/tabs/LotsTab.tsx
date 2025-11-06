import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateLot, useUpdateLot, useDeleteLot } from '@/hooks/api/useChantiers';

const LotSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  description: z.string().optional(),
  budget_planned: z.coerce.number().min(0),
  order_index: z.coerce.number().int().min(0),
});

export default function LotsTab({ chantierId, lots = [] }: { chantierId: number; lots?: any[] }){
  const form = useForm<z.infer<typeof LotSchema>>({ resolver: zodResolver(LotSchema), defaultValues: { title: '', description: '', budget_planned: 0, order_index: 0 } });
  const { mutate: createLot, isPending: creating } = useCreateLot();
  const { mutate: updateLot } = useUpdateLot();
  const { mutate: deleteLot } = useDeleteLot();

  return (
    <div className="grid gap-4">
      <div className="border rounded p-3 grid gap-2 animate-slide-up">
        <div className="font-medium">Créer un lot</div>
        <form onSubmit={form.handleSubmit((v) => { createLot({ chantierId, payload: v }); form.reset(); })} className="grid gap-2">
          <div className="grid md:grid-cols-3 gap-2">
            <Input placeholder="Titre" {...form.register('title')} />
            <Input placeholder="Budget prévu" type="number" step="0.01" {...form.register('budget_planned')} />
            <Input placeholder="Ordre" type="number" {...form.register('order_index')} />
          </div>
          <Textarea placeholder="Description" {...form.register('description')} />
          <div><Button type="submit" disabled={creating}>Ajouter</Button></div>
        </form>
      </div>

      <div className="grid gap-2">
        {lots.map((l) => (
          <div key={l.id} className="border rounded p-3 grid gap-2 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="font-medium">Lot #{l.id}</div>
              <Button variant="destructive" onClick={() => deleteLot(l.id)}>Supprimer</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              <Input defaultValue={l.title || ''} onBlur={(e) => updateLot({ id: l.id, payload: { title: e.target.value } })} />
              <Input defaultValue={l.budget_planned || 0} type="number" onBlur={(e) => updateLot({ id: l.id, payload: { budget_planned: Number(e.target.value) } })} />
              <Input defaultValue={l.progress_pct || 0} type="number" onBlur={(e) => updateLot({ id: l.id, payload: { progress_pct: Number(e.target.value) } })} />
              <Input defaultValue={l.order_index || 0} type="number" onBlur={(e) => updateLot({ id: l.id, payload: { order_index: Number(e.target.value) } })} />
            </div>
            <Textarea defaultValue={l.description || ''} onBlur={(e) => updateLot({ id: l.id, payload: { description: e.target.value } })} />
          </div>
        ))}
      </div>
    </div>
  );
}
