import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useCreateExpense, useDeleteExpense } from '@/hooks/api/useChantiers';

const ExpenseSchema = z.object({
  lot_id: z.string().optional(),
  label: z.string().min(1),
  amount: z.coerce.number().min(0),
  incurred_at: z.string().min(1),
  note: z.string().optional(),
});

export default function BudgetTab({ chantierId, expenses = [], lots = [], summary = {} as any }: { chantierId: number; expenses?: any[]; lots?: any[]; summary?: any }){
  const form = useForm<z.infer<typeof ExpenseSchema>>({ resolver: zodResolver(ExpenseSchema), defaultValues: { label: '', amount: 0, incurred_at: '', note: '', lot_id: '' } });
  const { mutate: createExpense } = useCreateExpense();
  const { mutate: deleteExpense } = useDeleteExpense();

  const cumulative = useMemo(() => {
    const sorted = expenses.slice().sort((a:any,b:any)=> (a.incurred_at||'').localeCompare(b.incurred_at||''));
    let sum = 0; return sorted.map((e:any)=> ({ date: e.incurred_at, total: (sum += parseFloat(e.amount)) }));
  }, [expenses]);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-3 grid gap-2 animate-slide-up">
          <div className="font-medium">Ajouter une dépense</div>
          <form onSubmit={form.handleSubmit((v) => { const payload: any = { ...v }; if (!payload.lot_id) delete payload.lot_id; createExpense({ chantierId, payload }); form.reset(); })} className="grid gap-2">
            <div className="grid md:grid-cols-2 gap-2">
              <Input placeholder="Intitulé" {...form.register('label')} />
              <Input type="number" step="0.01" placeholder="Montant" {...form.register('amount')} />
              <Input type="date" {...form.register('incurred_at')} />
              <Input placeholder="Lot ID (optionnel)" {...form.register('lot_id')} />
            </div>
            <Textarea placeholder="Note (optionnel)" {...form.register('note')} />
            <div><Button type="submit">Ajouter</Button></div>
          </form>
        </div>
        <div className="border rounded p-3 grid gap-2 animate-slide-up">
          <div className="font-medium">Budgets</div>
          {summary && <div className="text-sm text-muted-foreground">Prévu: {summary.budget_planned} • Engagé: {summary.budget_committed} • Réalisé: {summary.budget_actual}</div>}
          <div className="min-h-[250px] md:min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulative}>
                <XAxis dataKey="date" hide />
                <YAxis />
                <Tooltip />
                <Area dataKey="total" stroke="#0ea5e9" fill="#0ea5e966" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        {expenses.map((e:any, i:number)=> (
          <div key={e.id} className="border rounded p-3 flex items-center justify-between animate-slide-up" style={{ animationDelay: `${i*40}ms` }}>
            <div>
              <div className="font-medium">{e.label} — {e.amount}</div>
              <div className="text-sm text-muted-foreground">{e.incurred_at} • {e.note}</div>
            </div>
            <Button variant="destructive" onClick={() => deleteExpense(e.id)}>Supprimer</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
