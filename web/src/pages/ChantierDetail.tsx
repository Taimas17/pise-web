import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import Map from "../components/Map";
import { toast } from "../components/ui/sonner";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Progress } from "../components/ui/progress";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";

export default function ChantierDetail(){
  const { id } = useParams();
  const [chantier, setChantier] = useState<any | null>(null);
  const [types, setTypes] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  async function load(){
    const { data } = await api.get(`/chantiers/${id}`, { params: { include: 'lots,etapes,expenses,attachments,reports' } });
    setChantier(data);
  }

  useEffect(()=>{ (async()=>{ try{ const {data} = await api.get('/infrastructure-types'); setTypes(data); }catch{} })(); },[]);
  useEffect(()=>{ load(); }, [id, refreshKey]);

  if (!chantier) return <div>Chargement…</div>;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Chantier #{chantier.id} — {chantier.title}</h2>
        <div className="text-sm text-gray-600">Statut: {chantier.status} • Avancement: {chantier.progress_pct}%</div>
      </div>
      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="lots">Lots</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="alertes">Alertes</TabsTrigger>
          <TabsTrigger value="infos">Infos</TabsTrigger>
        </TabsList>
        <TabsContent value="lots"><LotsTab chantier={chantier} onChanged={()=>setRefreshKey(x=>x+1)} /></TabsContent>
        <TabsContent value="timeline"><TimelineTab chantier={chantier} onChanged={()=>setRefreshKey(x=>x+1)} /></TabsContent>
        <TabsContent value="budget"><BudgetTab chantier={chantier} onChanged={()=>setRefreshKey(x=>x+1)} /></TabsContent>
        <TabsContent value="documents"><DocumentsTab chantier={chantier} onChanged={()=>setRefreshKey(x=>x+1)} /></TabsContent>
        <TabsContent value="alertes"><AlertesTab chantier={chantier} onChanged={()=>setRefreshKey(x=>x+1)} /></TabsContent>
        <TabsContent value="infos"><InfosTab chantier={chantier} types={types} onChanged={()=>setRefreshKey(x=>x+1)} /></TabsContent>
      </Tabs>
    </div>
  );
}

function TimelineTab({ chantier, onChanged }:{ chantier:any; onChanged: ()=>void }){
  const EtapeSchema = z.object({
    lot_id: z.string().optional().transform(v=> v? v : ''),
    name: z.string().min(1, "Le nom est obligatoire"),
    description: z.string().optional(),
    planned_start_at: z.string().min(1, "Date de début requise"),
    planned_end_at: z.string().min(1, "Date de fin requise"),
    status: z.enum(["planned","in_progress","done","blocked","cancelled"], { errorMap: ()=>({ message: "Statut invalide" }) }),
    progress_pct: z.coerce.number().min(0, "Min 0").max(100, "Max 100"),
    order_index: z.coerce.number().int("Doit être un entier").min(0, "Min 0"),
  }).refine(d => new Date(d.planned_end_at) >= new Date(d.planned_start_at), { path:["planned_end_at"], message: "La fin doit être ≥ au début" });
  const form = useForm<z.infer<typeof EtapeSchema>>({
    resolver: zodResolver(EtapeSchema),
    defaultValues: { name: '', description: '', planned_start_at: '', planned_end_at: '', status: 'planned', progress_pct: 0, order_index: 0, lot_id: '' }
  });
  const etapes = useMemo(()=> (chantier.etapes || []).slice().sort((a:any,b:any)=>a.order_index-b.order_index), [chantier]);
  const lots = chantier.lots || [];
  return (
    <div className="grid gap-4">
      <div className="border rounded p-3 grid gap-2">
        <div className="font-medium">Créer une étape</div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(async (values)=>{
            try{
              const payload:any = { ...values };
              if (!payload.lot_id) delete payload.lot_id;
              await api.post(`/chantiers/${chantier.id}/etapes`, payload);
              toast("Étape ajoutée"); onChanged(); form.reset();
            }catch{ toast("Erreur"); }
          })} className="grid gap-2">
            <div className="grid md:grid-cols-3 gap-2">
              <FormField control={form.control} name="name" render={({ field })=> (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl><Input placeholder="Nom" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="planned_start_at" render={({ field })=> (
                <FormItem>
                  <FormLabel>Début prévu</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="planned_end_at" render={({ field })=> (
                <FormItem>
                  <FormLabel>Fin prévue</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field })=> (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Statut"/></SelectTrigger>
                      <SelectContent>{['planned','in_progress','done','blocked','cancelled'].map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="progress_pct" render={({ field })=> (
                <FormItem>
                  <FormLabel>Avancement %</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="order_index" render={({ field })=> (
                <FormItem>
                  <FormLabel>Ordre</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field })=> (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Description" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="lot_id" render={({ field })=> (
              <FormItem>
                <FormLabel>Lot (optionnel)</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Aucun"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun</SelectItem>
                      {lots.map((l:any)=> <SelectItem key={l.id} value={String(l.id)}>{l.title || `Lot #${l.id}`}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div><Button type="submit">Ajouter</Button></div>
          </form>
        </Form>
      </div>
      <div className="grid gap-2">
        {etapes.map((e:any)=> (
          <div key={e.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{e.name}</div>
              <div className="text-sm text-gray-600">{e.status} • {e.progress_pct}% • {e.planned_start_at?.slice(0,10)} → {e.planned_end_at?.slice(0,10)}</div>
            </div>
            <div className="w-48"><Progress value={Number(e.progress_pct)} /></div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={async()=>{ await api.patch(`/etapes/${e.id}`, { status: e.status === 'done' ? 'planned' : 'done' }); toast('Mise à jour'); onChanged(); }}>Basculer</Button>
              <Button variant="destructive" onClick={async()=>{ if(!confirm('Supprimer ?')) return; await api.delete(`/etapes/${e.id}`); toast('Supprimé'); onChanged(); }}>Supprimer</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LotsTab({ chantier, onChanged }:{ chantier:any; onChanged: ()=>void }){
  const LotSchema = z.object({
    title: z.string().min(1, "Le titre est obligatoire"),
    description: z.string().optional(),
    budget_planned: z.coerce.number({ invalid_type_error: "Doit être un nombre" }).min(0, "Doit être ≥ 0"),
    order_index: z.coerce.number({ invalid_type_error: "Doit être un entier" }).int("Doit être un entier").min(0, "Doit être ≥ 0"),
  });
  const form = useForm<z.infer<typeof LotSchema>>({
    resolver: zodResolver(LotSchema),
    defaultValues: { title: "", description: "", budget_planned: 0, order_index: 0 }
  });

  const [rows, setRows] = useState<any[]>([]);
  useEffect(()=>{
    const sorted = (chantier.lots || []).slice().sort((a:any,b:any)=> (a.order_index ?? 0) - (b.order_index ?? 0));
    setRows(sorted.map((l:any)=> ({ ...l, title: l.title || '', description: l.description || '', budget_planned: String(l.budget_planned ?? ''), budget_actual: String(l.budget_actual ?? ''), progress_pct: String(l.progress_pct ?? '0'), order_index: String(l.order_index ?? '0') })));
  }, [chantier.lots]);
  return (
    <div className="grid gap-4">
      <div className="border rounded p-3 grid gap-2">
        <div className="font-medium">Créer un lot</div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(async (values)=>{
            try{
              await api.post(`/chantiers/${chantier.id}/lots`, values);
              toast('Lot créé'); form.reset(); onChanged();
            }catch{ toast('Erreur'); }
          })} className="grid gap-2">
            <div className="grid md:grid-cols-3 gap-2">
              <FormField control={form.control} name="title" render={({ field })=> (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl><Input placeholder="Titre" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="budget_planned" render={({ field })=> (
                <FormItem>
                  <FormLabel>Budget prévu</FormLabel>
                  <FormControl><Input placeholder="0" type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="order_index" render={({ field })=> (
                <FormItem>
                  <FormLabel>Ordre</FormLabel>
                  <FormControl><Input placeholder="0" type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field })=> (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Description" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div><Button type="submit">Ajouter</Button></div>
          </form>
        </Form>
      </div>
      <div className="grid gap-2">
        {rows.map((l:any)=> (
          <div key={l.id} className="border rounded p-3 grid gap-2">
            <div className="flex justify-between items-center">
              <div className="font-medium">Lot #{l.id}</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={()=>{ const v = String(Math.max(0, (parseInt(l.order_index||'0')||0) - 1)); setRows(rs=> rs.map(r=> r.id===l.id? { ...r, order_index: v }: r)); }}>&uarr;</Button>
                <Button variant="outline" onClick={()=>{ const v = String((parseInt(l.order_index||'0')||0) + 1); setRows(rs=> rs.map(r=> r.id===l.id? { ...r, order_index: v }: r)); }}>&darr;</Button>
                <Button variant="destructive" onClick={async()=>{ if(!confirm('Supprimer ce lot ?')) return; await api.delete(`/lots/${l.id}`); toast('Supprimé'); onChanged(); }}>Supprimer</Button>
              </div>
            </div>
            <div className="grid md:grid-cols-5 gap-2">
              <Input placeholder="Titre" value={l.title} onChange={e=>setRows(rs=> rs.map(r=> r.id===l.id? { ...r, title: e.target.value }: r))} />
              <Input placeholder="Budget prévu" value={l.budget_planned} onChange={e=>setRows(rs=> rs.map(r=> r.id===l.id? { ...r, budget_planned: e.target.value }: r))} />
              <Input placeholder="Budget réalisé" value={l.budget_actual} onChange={e=>setRows(rs=> rs.map(r=> r.id===l.id? { ...r, budget_actual: e.target.value }: r))} />
              <Input placeholder="Avancement %" value={l.progress_pct} onChange={e=>setRows(rs=> rs.map(r=> r.id===l.id? { ...r, progress_pct: e.target.value }: r))} />
              <Input placeholder="Ordre" value={l.order_index} onChange={e=>setRows(rs=> rs.map(r=> r.id===l.id? { ...r, order_index: e.target.value }: r))} />
            </div>
            <Textarea placeholder="Description" value={l.description} onChange={e=>setRows(rs=> rs.map(r=> r.id===l.id? { ...r, description: e.target.value }: r))} />
            <div className="text-right">
              <Button onClick={async()=>{
                try{
                  const payload:any = {
                    title: l.title,
                    description: l.description || null,
                    budget_planned: l.budget_planned!==''? Number(l.budget_planned): undefined,
                    budget_actual: l.budget_actual!==''? Number(l.budget_actual): undefined,
                    progress_pct: l.progress_pct!==''? Number(l.progress_pct): undefined,
                    order_index: l.order_index!==''? Number(l.order_index): undefined,
                  };
                  await api.patch(`/lots/${l.id}`, payload);
                  toast('Enregistré'); onChanged();
                }catch{ toast('Erreur'); }
              }}>Enregistrer</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetTab({ chantier, onChanged }:{ chantier:any; onChanged: ()=>void }){
  const ExpenseSchema = z.object({
    lot_id: z.string().optional().transform(v=> v? v : ''),
    label: z.string().min(1, "L’intitulé est obligatoire"),
    amount: z.coerce.number({ invalid_type_error: "Doit être un nombre" }).min(0, "Doit être ≥ 0"),
    incurred_at: z.string().min(1, "La date est requise"),
    note: z.string().optional(),
  });
  const form = useForm<z.infer<typeof ExpenseSchema>>({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: { label: '', amount: 0, incurred_at: '', note: '', lot_id: '' }
  });
  const expenses = chantier.expenses || [];
  const lots = chantier.lots || [];
  const cumulative = useMemo(()=>{
    const sorted = expenses.slice().sort((a:any,b:any)=> (a.incurred_at||'').localeCompare(b.incurred_at||''));
    let sum = 0; return sorted.map((e:any)=> ({ date: e.incurred_at, total: (sum += parseFloat(e.amount)) }));
  }, [expenses]);
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="border rounded p-3 grid gap-2">
          <div className="font-medium">Ajouter une dépense</div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(async (values)=>{
              try{
                const payload:any = { ...values };
                if (!payload.lot_id) delete payload.lot_id;
                await api.post(`/chantiers/${chantier.id}/expenses`, payload);
                toast('Dépense ajoutée'); onChanged(); form.reset();
              }catch{ toast('Erreur'); }
            })} className="grid gap-2">
              <div className="grid md:grid-cols-2 gap-2">
                <FormField control={form.control} name="label" render={({ field })=> (
                  <FormItem>
                    <FormLabel>Intitulé</FormLabel>
                    <FormControl><Input placeholder="Intitulé" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="amount" render={({ field })=> (
                  <FormItem>
                    <FormLabel>Montant</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="incurred_at" render={({ field })=> (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lot_id" render={({ field })=> (
                  <FormItem>
                    <FormLabel>Lot (optionnel)</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Aucun"/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Aucun</SelectItem>
                          {lots.map((l:any)=> <SelectItem key={l.id} value={String(l.id)}>{l.title || `Lot #${l.id}`}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="note" render={({ field })=> (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl><Textarea placeholder="Note" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div><Button type="submit">Ajouter</Button></div>
            </form>
          </Form>
        </div>
        <div className="border rounded p-3 grid gap-2">
          <div className="font-medium">Budgets</div>
          <div className="text-sm text-gray-600">Prévu: {chantier.budget_planned} • Engagé: {chantier.budget_committed} • Réalisé: {chantier.budget_actual}</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulative}>
                <XAxis dataKey="date" hide/>
                <YAxis/>
                <Tooltip/>
                <Area dataKey="total" stroke="#0ea5e9" fill="#0ea5e966" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="grid gap-2">
        {expenses.map((e:any)=> (
          <div key={e.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{e.label} — {e.amount}</div>
              <div className="text-sm text-gray-600">{e.incurred_at} • {e.note}</div>
            </div>
            <Button variant="destructive" onClick={async()=>{ if(!confirm('Supprimer ?')) return; await api.delete(`/expenses/${e.id}`); toast('Supprimé'); onChanged(); }}>Supprimer</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentsTab({ chantier, onChanged }:{ chantier:any; onChanged: ()=>void }){
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <input type="file" onChange={e=>setFile(e.target.files?.[0] || null)} />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Catégorie"/></SelectTrigger>
          <SelectContent>{['contrat','OS','PV_reception','photo','autre'].map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Button onClick={async()=>{
          if(!file) return;
          const data = new FormData();
          data.append('file', file);
          if (category) data.append('category', category);
          await api.post(`/chantiers/${chantier.id}/attachments`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
          toast('Fichier envoyé'); onChanged(); setFile(null); setCategory("");
        }}>Uploader</Button>
      </div>
      <div className="grid gap-2">
        {(chantier.attachments||[]).map((a:any)=> (
          <div key={a.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{a.type} — {a.category || 'n/a'}</div>
              <div className="text-sm text-gray-600">{a.path}</div>
            </div>
            <div className="flex gap-2">
              <a href={`/storage/${a.path}`} target="_blank" className="text-sky-600">Voir</a>
              <Button variant="destructive" onClick={async()=>{ if(!confirm('Supprimer ?')) return; await api.delete(`/attachments/${a.id}`); toast('Supprimé'); onChanged(); }}>Supprimer</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertesTab({ chantier, onChanged }:{ chantier:any; onChanged: ()=>void }){
  const [reportId, setReportId] = useState("");
  const reports = chantier.reports || [];
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <Input placeholder="ID alerte" value={reportId} onChange={e=>setReportId(e.target.value)} className="w-40" />
        <Button onClick={async()=>{ if(!reportId) return; await api.post(`/chantiers/${chantier.id}/reports`, { report_id: Number(reportId) }); toast('Liée'); onChanged(); setReportId(""); }}>Lier</Button>
      </div>
      <div className="grid gap-2">
        {reports.map((r:any)=> (
          <div key={r.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">Alerte #{r.id} — {r.title}</div>
              <div className="text-sm text-gray-600">{r.status} • {r.criticality}</div>
            </div>
            <div className="flex items-center gap-2">
              <a className="text-sky-600" href={`/suivi/${r.id}`}>Ouvrir</a>
              <Button variant="destructive" onClick={async()=>{ if(!confirm('Délier ?')) return; await api.delete(`/chantiers/${chantier.id}/reports/${r.id}`); toast('Déliée'); onChanged(); }}>Délier</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfosTab({ chantier, types, onChanged }:{ chantier:any; types:any[]; onChanged: ()=>void }){
  const [form, setForm] = useState({ title: chantier.title||'', description: chantier.description||'', status: chantier.status||'planned', infrastructure_type_id: String(chantier.infrastructure_type_id||''), budget_planned: String(chantier.budget_planned||''), budget_committed: String(chantier.budget_committed||''), manager_user_id: String(chantier.manager_user_id||'') });
  const geo = chantier.geometry as any;
  const point = useMemo(()=>{
    if (geo && geo.type === 'Point') return { lat: geo.coordinates[1], lng: geo.coordinates[0] };
    return null;
  }, [geo]);
  return (
    <div className="grid gap-4">
      <div className="grid md:grid-cols-2 gap-4">
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
            <Button onClick={async()=>{ await api.patch(`/chantiers/${chantier.id}`, form); toast('Enregistré'); onChanged(); }}>Enregistrer</Button>
          </div>
        </div>
        <div>
          {point ? <Map lat={point.lat} lng={point.lng} /> : <div className="text-sm text-gray-600">Pas de géométrie fournie</div>}
        </div>
      </div>
    </div>
  );
}
