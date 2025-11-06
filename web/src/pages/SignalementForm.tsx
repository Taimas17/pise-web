import { useEffect, useState } from "react";
import { api } from "../lib/api";
import Map from "../components/Map";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "../components/ui/sonner";
import { set, get } from 'idb-keyval';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { FileText, Image as ImageIcon, MapPin } from "lucide-react";
import type { Coordinates } from "../types/geo";
import type { InfrastructureType, ReportCreatePayload } from "../types/api";
import { isValidCoordinates } from "../lib/geo-utils";

export default function SignalementForm(){
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [types, setTypes] = useState<InfrastructureType[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState<Pick<ReportCreatePayload,'infrastructure_type_id'|'criticality'|'description'|'public_location'|'citizen_email'|'citizen_phone'>>({
    infrastructure_type_id: '',
    criticality: 'moyenne',
    description: '',
    public_location: false,
    citizen_email: '',
    citizen_phone: ''
  });

  useEffect(()=>{ (async()=>{
    try { const { data } = await api.get('/infrastructure-types'); setTypes(data); } catch {}
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setCoordinates({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }, ()=>{}, { enableHighAccuracy: true });
    }
  })(); },[]);

  async function onSubmit(){
    if (!coordinates || !isValidCoordinates(coordinates)) { toast('Localisation invalide'); return; }
    setSending(true);
    const data = new FormData();
    data.append('infrastructure_type_id', String(form.infrastructure_type_id));
    data.append('criticality', form.criticality);
    if (form.description) data.append('description', form.description);
    data.append('lat', String(coordinates.lat));
    data.append('lng', String(coordinates.lng));
    data.append('public_location', String(form.public_location));
    if (form.citizen_email) data.append('citizen_email', form.citizen_email);
    if (form.citizen_phone) data.append('citizen_phone', form.citizen_phone);
    files.forEach(f => data.append('photos[]', f));

    try {
      await api.post('/reports', data, { headers: { 'Content-Type': 'multipart/form-data' }});
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

  if (!coordinates) return <p>Chargement de la géolocalisation…</p>;

  return (
    <div className="grid gap-4 max-w-2xl">
      <div>
        <h2 className="text-responsive-h2 flex items-center gap-2"><FileText className="size-5 text-sky-600"/> Créer un signalement</h2>
        <p className="text-gray-700 mt-1">Décrivez le problème, positionnez-le sur la carte et ajoutez des photos.</p>
      </div>

      <Card className="card-hover">
        <CardHeader className="border-b">
          <CardTitle>Informations</CardTitle>
          <CardDescription>Type, criticité et description</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4">
          <label className="grid gap-2">
            <span>Type d’infrastructure</span>
            <Select value={String(form.infrastructure_type_id)} onValueChange={(v)=>setForm(f=>({ ...f, infrastructure_type_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Choisir…"/></SelectTrigger>
              <SelectContent>
                {types.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-2">
            <span>Criticité</span>
            <select className="border rounded p-2" value={form.criticality} onChange={e=>setForm(f=>({ ...f, criticality: e.target.value as ReportCreatePayload['criticality'] }))}>
              <option value="faible">Faible</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span>Description</span>
            <Textarea value={form.description} onChange={e=>setForm(f=>({ ...f, description: e.target.value }))} rows={4} />
          </label>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2"><MapPin className="size-4"/> Localisation</CardTitle>
          <CardDescription>Déplacez le marqueur pour ajuster</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 pt-4">
          <Map lat={coordinates.lat} lng={coordinates.lng} onPick={(la,lo)=> setCoordinates({ lat: la, lng: lo })} className="h-[250px] md:h-[350px]"/>
          <label className="flex items-center gap-2 text-sm">
            <input id="pub" type="checkbox" checked={form.public_location} onChange={e=>setForm(f=>({ ...f, public_location: e.target.checked }))} />
            <span>Utiliser la précision exacte (sinon position masquée)</span>
          </label>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2"><ImageIcon className="size-4"/> Photos</CardTitle>
          <CardDescription>Maximum 5 photos (5 Mo/photo)</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 pt-4">
          <Input type="file" accept="image/*" multiple onChange={onFileChange} />
          {!!files.length && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {files.map((f, i) => (
                <div key={i} className="border rounded overflow-hidden">
                  <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-24 object-cover" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="border-b">
          <CardTitle>Contact (optionnel)</CardTitle>
          <CardDescription>Nous pourrions vous recontacter si besoin</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="Email" value={form.citizen_email} onChange={e=>setForm(f=>({ ...f, citizen_email: e.target.value }))} />
            <Input placeholder="Téléphone" value={form.citizen_phone} onChange={e=>setForm(f=>({ ...f, citizen_phone: e.target.value }))} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={onSubmit} disabled={sending || !form.infrastructure_type_id} className="touch-target">{sending ? 'Envoi…' : 'Envoyer'}</Button>
        {sending && (
          <div className="flex-1 grid grid-cols-3 gap-2">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        )}
      </div>
    </div>
  );
}
