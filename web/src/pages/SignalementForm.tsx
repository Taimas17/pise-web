import { useEffect, useState } from "react";
import { api } from "../lib/api";
import Map from "../components/Map";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "../components/ui/sonner";
import { set, get } from 'idb-keyval';

export default function SignalementForm(){
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [types, setTypes] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ infrastructure_type_id: '', criticality: 'moyenne', description: '', public_location: false, citizen_email: '', citizen_phone: '' });

  useEffect(()=>{ (async()=>{
    try { const { data } = await api.get('/infrastructure-types'); setTypes(data); } catch {}
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); }, ()=>{}, { enableHighAccuracy: true });
    }
  })(); },[]);

  async function onSubmit(){
    if (lat == null || lng == null) { toast('Localisation non disponible'); return; }
    setSending(true);
    const data = new FormData();
    data.append('infrastructure_type_id', form.infrastructure_type_id);
    data.append('criticality', form.criticality);
    if (form.description) data.append('description', form.description);
    data.append('lat', String(lat));
    data.append('lng', String(lng));
    data.append('public_location', String(form.public_location));
    if (form.citizen_email) data.append('citizen_email', form.citizen_email);
    if (form.citizen_phone) data.append('citizen_phone', form.citizen_phone);
    files.forEach(f => data.append('photos[]', f));

    try {
      const { data: created } = await api.post('/reports', data, { headers: { 'Content-Type': 'multipart/form-data' }});
      toast('Signalement envoyé');
      setFiles([]); setForm({ ...form, description: '' });
    } catch (e){
      const queue = await get('queuedReports') as any[] || [];
      queue.push({ payload: Object.fromEntries(data as any), time: Date.now() });
      await set('queuedReports', queue);
      toast('Hors-ligne: signalement mis en file pour envoi ultérieur');
    } finally { setSending(false); }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>){
    const f = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...f].slice(0, 5));
  }

  useEffect(()=>{
    const iv = setInterval(async ()=>{
      const queue = await get('queuedReports') as any[] || [];
      if (!queue.length) return;
      for (const item of queue) {
        try {
          const fd = new FormData();
          for (const [k,v] of Object.entries(item.payload)) fd.append(k, v as any);
          await api.post('/reports', fd);
        } catch { return; }
      }
      await set('queuedReports', []);
      toast('Envoi des signalements en file terminé');
    }, 10000);
    return ()=> clearInterval(iv);
  },[]);

  if (lat == null || lng == null) return <p>Chargement de la géolocalisation…</p>;

  return (
    <div className="grid gap-4 max-w-2xl">
      <h2 className="text-xl font-semibold">Créer un signalement</h2>
      <label className="grid gap-2">
        <span>Type d’infrastructure</span>
        <Select value={form.infrastructure_type_id} onValueChange={(v)=>setForm(f=>({ ...f, infrastructure_type_id: v }))}>
          <SelectTrigger><SelectValue placeholder="Choisir…"/></SelectTrigger>
          <SelectContent>
            {types.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>
      <label className="grid gap-2">
        <span>Criticité</span>
        <select className="border rounded p-2" value={form.criticality} onChange={e=>setForm(f=>({ ...f, criticality: e.target.value }))}>
          <option value="faible">Faible</option>
          <option value="moyenne">Moyenne</option>
          <option value="haute">Haute</option>
        </select>
      </label>
      <label className="grid gap-2">
        <span>Description</span>
        <Textarea value={form.description} onChange={e=>setForm(f=>({ ...f, description: e.target.value }))} rows={4} />
      </label>
      <div className="grid gap-2">
        <span>Localisation</span>
        <Map lat={lat} lng={lng} onPick={(la,lo)=>{ setLat(la); setLng(lo); }}/>
        <div className="flex items-center gap-2 text-sm">
          <input id="pub" type="checkbox" checked={form.public_location} onChange={e=>setForm(f=>({ ...f, public_location: e.target.checked }))} />
          <label htmlFor="pub">Utiliser la précision exacte (sinon position masquée)</label>
        </div>
      </div>
      <div className="grid gap-2">
        <span>Photos (max 5, 5 Mo/photo)</span>
        <Input type="file" accept="image/*" multiple onChange={onFileChange} />
        <div className="flex gap-2 flex-wrap text-xs text-gray-600">{files.map((f,i)=><span key={i}>{f.name}</span>)}</div>
      </div>
      <div className="grid gap-2">
        <span>Contact (optionnel)</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input placeholder="Email" value={form.citizen_email} onChange={e=>setForm(f=>({ ...f, citizen_email: e.target.value }))} />
          <Input placeholder="Téléphone" value={form.citizen_phone} onChange={e=>setForm(f=>({ ...f, citizen_phone: e.target.value }))} />
        </div>
      </div>
      <Button onClick={onSubmit} disabled={sending || !form.infrastructure_type_id}>Envoyer</Button>
    </div>
  );
}
