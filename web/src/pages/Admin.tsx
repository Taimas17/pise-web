import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "../components/ui/sonner";

export default function Admin(){
  return (
    <div className="grid gap-6">
      <h2 className="text-xl font-semibold">Administration</h2>
      <TypesManager />
      <ZonesImporter />
      <ZonesList />
    </div>
  );
}

function TypesManager(){
  const [types, setTypes] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  async function load(){ try { const { data } = await api.get('/infrastructure-types'); setTypes(data); } catch {} }
  useEffect(()=>{ load(); },[]);
  async function add(){ if(!name) return; try { await api.post('/infrastructure-types', { name }); toast('Type ajouté'); setName(''); await load(); } catch { toast('Erreur'); } }
  async function startEdit(t:any){ setEditingId(t.id); setEditingName(t.name); }
  async function saveEdit(){ if(!editingId) return; try { await api.patch(`/infrastructure-types/${editingId}`, { name: editingName }); toast('Type mis à jour'); setEditingId(null); await load(); } catch { toast('Erreur lors de la mise à jour'); } }
  async function remove(id:number){ if(!confirm('Supprimer ce type ?')) return; try { await api.delete(`/infrastructure-types/${id}`); toast('Supprimé'); await load(); } catch (e:any) { toast(e?.response?.data?.message || 'Suppression impossible'); } }
  return (
    <div className="border rounded p-3">
      <div className="font-medium mb-2">Types d’infrastructure</div>
      <div className="flex gap-2 mb-2">
        <Input placeholder="Nouveau type" value={name} onChange={e=>setName(e.target.value)} />
        <Button onClick={add}>Ajouter</Button>
      </div>
      <ul className="grid gap-2">
        {types.map(t => (
          <li key={t.id} className="flex items-center gap-2">
            {editingId === t.id ? (
              <>
                <Input value={editingName} onChange={e=>setEditingName(e.target.value)} className="max-w-xs" />
                <Button size="sm" onClick={saveEdit}>Enregistrer</Button>
                <Button size="sm" variant="ghost" onClick={()=>setEditingId(null)}>Annuler</Button>
              </>
            ) : (
              <>
                <span className="flex-1">{t.name}</span>
                <Button size="sm" variant="outline" onClick={()=>startEdit(t)}>Renommer</Button>
                <Button size="sm" variant="destructive" onClick={()=>remove(t.id)}>Supprimer</Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ZonesImporter(){
  const [file, setFile] = useState<File | null>(null);
  const [log, setLog] = useState<any | null>(null);
  async function importZones(){
    if(!file) return; const fd = new FormData(); fd.append('file', file);
    try { const { data } = await api.post('/zones/import', fd); setLog(data); toast('Import terminé'); }
    catch { toast('Erreur import'); }
  }
  return (
    <div className="border rounded p-3">
      <div className="font-medium mb-2">Import des zones (GeoJSON)</div>
      <div className="flex items-center gap-2 mb-2">
        <Input type="file" accept="application/json,.geojson" onChange={e=>setFile(e.target.files?.[0] || null)} />
        <Button onClick={importZones} disabled={!file}>Importer</Button>
      </div>
      {log && (
        <div className="text-sm bg-gray-50 border rounded p-2 overflow-auto">
          <div><span className="font-medium">Créés:</span> {log.created ?? log.created_count ?? '-'}</div>
          <div><span className="font-medium">Mises à jour:</span> {log.updated ?? log.updated_count ?? '-'}</div>
          {log.errors && Array.isArray(log.errors) && log.errors.length>0 && (
            <div className="mt-2">
              <div className="font-medium">Erreurs:</div>
              <ul className="list-disc pl-6">{log.errors.map((e:any,i:number)=><li key={i}>{typeof e==='string'?e:JSON.stringify(e)}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ZonesList(){
  const [zones, setZones] = useState<any[]>([]);
  const [level, setLevel] = useState('');
  const [parentId, setParentId] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState<number | null>(null);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renamingName, setRenamingName] = useState('');
  async function load(){
    try {
      const params = Object.fromEntries(Object.entries({ level, parent_id: parentId, page }).filter(([_,v])=>v));
      const { data } = await api.get('/zones', { params });
      if (data?.data) { setZones(data.data); setLastPage(data?.meta?.last_page || null); }
      else { setZones(data); setLastPage(null); }
    } catch {}
  }
  useEffect(()=>{ load(); }, [level, parentId, page]);
  async function rename(){ if(!renamingId) return; try { await api.patch(`/zones/${renamingId}`, { name: renamingName }); toast('Zone renommée'); setRenamingId(null); await load(); } catch { toast('Action non disponible'); } }
  async function remove(id:number){ if(!confirm('Supprimer cette zone ?')) return; try { await api.delete(`/zones/${id}`); toast('Supprimée'); await load(); } catch { toast('Action non disponible'); } }
  return (
    <div className="border rounded p-3">
      <div className="font-medium mb-2">Zones</div>
      <div className="flex flex-wrap gap-2 mb-2">
        <Input placeholder="Niveau (ex: commune)" value={level} onChange={e=>{ setPage(1); setLevel(e.target.value); }} className="w-48" />
        <Input placeholder="Parent ID" value={parentId} onChange={e=>{ setPage(1); setParentId(e.target.value); }} className="w-40" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2 border">Nom</th>
              <th className="text-left p-2 border">Niveau</th>
              <th className="text-left p-2 border">Parent</th>
              <th className="p-2 border w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z:any)=>(
              <tr key={z.id} className="border-t">
                <td className="p-2">
                  {renamingId === z.id ? (
                    <Input value={renamingName} onChange={e=>setRenamingName(e.target.value)} />
                  ) : z.name}
                </td>
                <td className="p-2">{z.level || '-'}</td>
                <td className="p-2">{z.parent?.name || z.parent_id || '-'}</td>
                <td className="p-2 flex gap-2">
                  {renamingId === z.id ? (
                    <>
                      <Button size="sm" onClick={rename}>Enregistrer</Button>
                      <Button size="sm" variant="ghost" onClick={()=>setRenamingId(null)}>Annuler</Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={()=>{ setRenamingId(z.id); setRenamingName(z.name); }}>Renommer</Button>
                      <Button size="sm" variant="destructive" onClick={()=>remove(z.id)}>Supprimer</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {lastPage && lastPage > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          <Button size="sm" variant="outline" onClick={()=>setPage(p=>Math.max(1, p-1))}>Précédent</Button>
          <div className="text-sm">Page {page}</div>
          <Button size="sm" variant="outline" onClick={()=>setPage(p=> lastPage ? Math.min(lastPage, p+1) : p+1)}>Suivant</Button>
        </div>
      )}
    </div>
  );
}
