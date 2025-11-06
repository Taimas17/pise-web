import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useIsMobile } from "../hooks/use-mobile";

export default function Admin(){
  return (
    <div className="grid gap-6">
      <h2 className="text-responsive-h2">Administration</h2>
      <TypesManager />
      <ZonesManager />
      <UsersManager />
      <AuditViewer />
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
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <Input placeholder="Nouveau type" value={name} onChange={e=>setName(e.target.value)} />
        <Button onClick={add}>Ajouter</Button>
      </div>
      <ul className="list-disc pl-6 text-sm">{types.map(t => <li key={t.id}>{t.name}</li>)}</ul>
    </div>
  );
}

function ZonesManager(){
  const [file, setFile] = useState<File | null>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [level, setLevel] = useState('commune');
  const [editName, setEditName] = useState<Record<number,string>>({});
  async function importZones(){ if(!file) return; const fd = new FormData(); fd.append('file', file); await api.post('/zones/import', fd); alert('Import terminé'); load(); }
  async function load(){ const { data } = await api.get('/zones', { params: { level } }); setZones(data); }
  useEffect(()=>{ load(); }, [level]);
  async function saveName(z:any){ await api.patch(`/zones/${z.id}`, { name: editName[z.id] ?? z.name }); await load(); }
  async function remove(z:any){ if(!confirm('Supprimer cette zone ?')) return; try{ await api.delete(`/zones/${z.id}`); await load(); }catch(e:any){ alert(e?.response?.data?.message || 'Erreur de suppression'); } }
  return (
    <div className="border rounded p-3">
      <div className="font-medium mb-2">Zones</div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
        <select value={level} onChange={e=>setLevel(e.target.value)} className="border rounded h-9 px-2">
          <option value="commune">Commune</option>
          <option value="arrondissement">Arrondissement</option>
          <option value="quartier">Quartier</option>
        </select>
        <Input type="file" accept="application/json,.geojson" onChange={e=>setFile(e.target.files?.[0] || null)} />
        <Button onClick={importZones} disabled={!file}>Importer</Button>
      </div>
      <div className="text-sm grid gap-2">
        {zones.map(z=> (
          <div key={z.id} className="flex flex-col sm:flex-row sm:items-center gap-2 py-1">
            <Input value={editName[z.id] ?? z.name} onChange={e=>setEditName(s=>({ ...s, [z.id]: e.target.value }))} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>saveName(z)}>Enregistrer</Button>
              <Button variant="destructive" onClick={()=>remove(z)}>Supprimer</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersManager(){
  const [users, setUsers] = useState<any[]>([]);
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const isMobile = useIsMobile();
  async function load(){ const { data } = await api.get('/users', { params: { role: role||undefined, q: q||undefined, page } }); setUsers(data.data || data); }
  useEffect(()=>{ load(); }, [role, q, page]);
  async function changeRole(u:any, newRole:string){ if(!confirm(`Changer le rôle de ${u.name} en ${newRole} ?`)) return; await api.patch(`/users/${u.id}/role`, { role: newRole }); await load(); }
  return (
    <div className="border rounded p-3">
      <div className="font-medium mb-2">Utilisateurs</div>
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
        <Input placeholder="Recherche" value={q} onChange={e=>setQ(e.target.value)} className="w-full md:w-64" />
        <select value={role} onChange={e=>setRole(e.target.value)} className="border rounded h-9 px-2">
          <option value="">Tous</option>
          <option value="admin">Admin</option>
          <option value="moderator">Modérateur</option>
          <option value="agent">Agent</option>
          <option value="citizen">Citoyen</option>
        </select>
      </div>
      {isMobile ? (
        <div className="grid gap-2">
          {users.map((u:any)=>(
            <Card key={u.id} className="card-hover">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{u.name}</CardTitle>
                    <CardDescription>{u.email}</CardDescription>
                  </div>
                  <Badge>{u.role}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <label className="text-sm text-gray-600">Rôle</label>
                <select value={u.role} onChange={e=>changeRole(u, e.target.value)} className="border rounded h-9 px-2 w-full mt-1">
                  {['admin','moderator','agent','citizen'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Rôle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u:any)=>(
              <TableRow key={u.id}>
                <TableCell>#{u.id}</TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell className="hidden md:table-cell text-gray-600">{u.email}</TableCell>
                <TableCell>
                  <select value={u.role} onChange={e=>changeRole(u, e.target.value)} className="border rounded h-9 px-2">
                    {['admin','moderator','agent','citizen'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function AuditViewer(){
  const [logs, setLogs] = useState<any[]>([]);
  const [entityType, setEntityType] = useState('');
  const [userId, setUserId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  async function load(){ const { data } = await api.get('/audit/logs', { params: { entity_type: entityType||undefined, user_id: userId||undefined, from: from||undefined, to: to||undefined } }); setLogs(data.data || data); }
  useEffect(()=>{ load(); }, [entityType, userId, from, to]);
  return (
    <div className="border rounded p-3">
      <div className="font-medium mb-2">Audit</div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
        <Input placeholder="Type d’entité (report, user, zone, type)" value={entityType} onChange={e=>setEntityType(e.target.value)} className="w-full sm:w-80" />
        <Input placeholder="ID utilisateur" value={userId} onChange={e=>setUserId(e.target.value)} className="w-full sm:w-40" />
        <Input type="date" value={from} onChange={e=>setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={e=>setTo(e.target.value)} />
      </div>
      <div className="text-xs">
        {logs.map((l:any)=>(
          <div key={l.id} className="border-b py-1">
            <div className="font-mono">[{l.created_at}] {l.entity_type} #{l.entity_id} — {l.action}</div>
            <div className="text-gray-600">{JSON.stringify(l.changes)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}