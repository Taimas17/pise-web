import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function Admin(){
  return (
    <div className="grid gap-6">
      <h2 className="text-xl font-semibold">Administration</h2>
      <TypesManager />
      <ZonesImporter />
    </div>
  );
}

function TypesManager(){
  const [types, setTypes] = useState<any[]>([]);
  const [name, setName] = useState("");
  async function load(){ const { data } = await api.get('/infrastructure-types'); setTypes(data); }
  useEffect(()=>{ load(); },[]);
  async function add(){ if(!name) return; await api.post('/infrastructure-types', { name }); setName(''); await load(); }
  return (
    <div className="border rounded p-3">
      <div className="font-medium mb-2">Types d’infrastructure</div>
      <div className="flex gap-2 mb-2">
        <Input placeholder="Nouveau type" value={name} onChange={e=>setName(e.target.value)} />
        <Button onClick={add}>Ajouter</Button>
      </div>
      <ul className="list-disc pl-6 text-sm">{types.map(t => <li key={t.id}>{t.name}</li>)}</ul>
    </div>
  );
}

function ZonesImporter(){
  const [file, setFile] = useState<File | null>(null);
  async function importZones(){ if(!file) return; const fd = new FormData(); fd.append('file', file); await api.post('/zones/import', fd); alert('Import terminé'); }
  return (
    <div className="border rounded p-3">
      <div className="font-medium mb-2">Import des zones (GeoJSON)</div>
      <div className="flex items-center gap-2">
        <Input type="file" accept="application/json,.geojson" onChange={e=>setFile(e.target.files?.[0] || null)} />
        <Button onClick={importZones} disabled={!file}>Importer</Button>
      </div>
    </div>
  );
}
