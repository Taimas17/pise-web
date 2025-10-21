import { useEffect, useMemo, useState } from "react";
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
  const [geolocError, setGeolocError] = useState(false);
  const [types, setTypes] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [form, setForm] = useState({ infrastructure_type_id: '', criticality: 'moyenne', description: '', public_location: false, citizen_email: '', citizen_phone: '' });

  useEffect(()=>{ (async()=>{
    try { const { data } = await api.get('/infrastructure-types'); setTypes(data); } catch {}
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); },
        ()=>{ setGeolocError(true); if (lat==null || lng==null) { setLat(14.6937); setLng(-17.4441); } },
        { enableHighAccuracy: true }
      );
    } else {
      setGeolocError(true); setLat(14.6937); setLng(-17.4441);
    }
    const q = await get('queuedReports') as any[] || [];
    setQueueCount(q.length);
  })(); },[]);

  async function onSubmit(){
    if (!form.infrastructure_type_id) { toast('Type requis'); return; }
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
      await api.post('/reports', data, { headers: { 'Content-Type': 'multipart/form-data' }});
      toast('Signalement envoyé');
      setFiles([]); setForm({ ...form, description: '' });
    } catch (e){
      const queue = (await get('queuedReports') as any[]) || [];
      queue.push({ payload: Object.fromEntries(data as any), time: Date.now() });
      await set('queuedReports', queue);
      setQueueCount(queue.length);
      toast('Hors-ligne: signalement mis en file pour envoi ultérieur');
    } finally { setSending(false); }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>){
    const incoming = Array.from(e.target.files || []);
    const filtered = incoming.filter(f=>{
      if (f.size > 5 * 1024 * 1024) { toast(`${f.name}: > 5 Mo`); return false; }
      return true;
    });
    setFiles(prev => [...prev, ...filtered].slice(0, 5));
  }

  function removeFile(idx: number){ setFiles(prev => prev.filter((_,i)=>i!==idx)); }

  useEffect(()=>{
    const iv = setInterval(async ()=>{
      const queue = (await get('queuedReports') as any[]) || [];
      setQueueCount(queue.length);
      if (!queue.length) return;
      for (const item of queue) {
        try {
          const fd = new FormData();
          for (const [k,v] of Object.entries(item.payload)) fd.append(k, v as any);
          await api.post('/reports', fd);
        } catch { return; }
      }
      await set('queuedReports', []);
      setQueueCount(0);
      toast('Envoi des signalements en file terminé');
    }, 10000);
    return ()=> clearInterval(iv);
  },[]);

  async function clearQueue(){ await set('queuedReports', []); setQueueCount(0); toast('File effacée'); }

  const previews = useMemo(()=> files.map(f => URL.createObjectURL(f)), [files]);

  return (
    <div className="grid gap-4 max-w-2xl">
      {queueCount > 0 && (
        <div className="rounded border bg-yellow-50 text-yellow-800 p-3 text-sm flex items-center justify-between">
          <div>{queueCount} élément(s) en file hors-ligne</div>
          <Button size="sm" variant="outline" onClick={clearQueue}>Effacer</Button>
        </div>
      )}
      {geolocError && (
        <div className="rounded border bg-amber-50 text-amber-800 p-3 text-sm">Géolocalisation indisponible. Sélectionnez manuellement la position sur la carte.</div>
      )}
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
        {lat != null && lng != null && <Map lat={lat} lng={lng} onPick={(la,lo)=>{ setLat(la); setLng(lo); }}/>}        
        <div className="flex items-center gap-2 text-sm">
          <input id="pub" type="checkbox" checked={form.public_location} onChange={e=>setForm(f=>({ ...f, public_location: e.target.checked }))} />
          <label htmlFor="pub">Utiliser la précision exacte (sinon position masquée)</label>
        </div>
      </div>
      <div className="grid gap-2">
        <span>Photos (max 5, 5 Mo/photo)</span>
        <Input type="file" accept="image/*" multiple onChange={onFileChange} />
        <div className="flex gap-2 flex-wrap">
          {previews.map((src, i)=>(
            <div key={i} className="relative">
              <img src={src} className="w-24 h-24 object-cover border rounded" />
              <button className="absolute -top-2 -right-2 bg-white border rounded-full px-2 py-0.5 text-xs" onClick={()=>removeFile(i)}>×</button>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        <span>Contact (optionnel)</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input placeholder="Email" value={form.citizen_email} onChange={e=>setForm(f=>({ ...f, citizen_email: e.target.value }))} />
          <Input placeholder="Téléphone" value={form.citizen_phone} onChange={e=>setForm(f=>({ ...f, citizen_phone: e.target.value }))} />
        </div>
      </div>
      <Button onClick={onSubmit} disabled={sending}>Envoyer</Button>
    </div>
  );
}
