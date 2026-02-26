import { useState } from 'react';
import DataTable, { Column } from '@/components/lists/DataTable';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/dialogs/ConfirmDialog';
import ActionDialog from '@/components/dialogs/ActionDialog';
import { Input } from '@/components/ui/input';
import { downloadBlob } from '@/lib/utils';
import { useInfraTypes, useCreateInfraType, useUpdateInfraType, useDeleteInfraType } from '@/hooks/api/useInfraTypes';
import axios from 'axios';
import { API_URL } from '@/lib/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function InfraTypesManager(){
  const { data: types } = useInfraTypes();
  const { mutate: createType } = useCreateInfraType();
  const { mutate: updateType } = useUpdateInfraType();
  const { mutate: deleteType, isPending: deleting } = useDeleteInfraType();

  const [confirm, setConfirm] = useState<{ id: number } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', color: '' });

  const columns: Column<any>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: 'Nom', sortable: true, render: (row) => (
      <Input defaultValue={row.name} onBlur={(e)=> updateType({ id: row.id, payload: { name: e.target.value } })} />
    ) },
    { key: 'color', header: 'Couleur', render: (row) => (
      <Input defaultValue={row.color || ''} onBlur={(e)=> updateType({ id: row.id, payload: { color: e.target.value } })} />
    ) },
  ];

  function exportCSV(){
    const header = 'id,name,color\n';
    const rows = (types||[]).map(t => `${t.id},${JSON.stringify(t.name)},${JSON.stringify(t.color||'')}`).join('\n');
    const blob = new Blob([header+rows], { type: 'text/csv;charset=utf-8;' });
    const ts = new Date(); const suffix = `${ts.toISOString().slice(0,10)}-${String(ts.getHours()).padStart(2,'0')}${String(ts.getMinutes()).padStart(2,'0')}`;
    downloadBlob(`infra-types-${suffix}.csv`, blob);
  }

  return (
    <div className="grid gap-3">
      <div className="flex gap-2">
        <Button onClick={()=> setCreateOpen(true)} className="transition-transform active:scale-95">Nouveau type</Button>
        <Button variant="outline" onClick={exportCSV}>Exporter CSV</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Exporter</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={async ()=>{ const ts=new Date(); const suffix=`${ts.toISOString().slice(0,10)}-${String(ts.getHours()).padStart(2,'0')}${String(ts.getMinutes()).padStart(2,'0')}`; const { data } = await axios.get(`${API_URL}/api/infrastructure-types/export`, { responseType:'blob', params:{ format:'pdf' } }); downloadBlob(`infra-types-${suffix}.pdf`, data); }}>PDF</DropdownMenuItem>
            <DropdownMenuItem onClick={async ()=>{ const ts=new Date(); const suffix=`${ts.toISOString().slice(0,10)}-${String(ts.getHours()).padStart(2,'0')}${String(ts.getMinutes()).padStart(2,'0')}`; const { data } = await axios.get(`${API_URL}/api/infrastructure-types/export`, { responseType:'blob', params:{ format:'excel' } }); downloadBlob(`infra-types-${suffix}.xlsx`, data); }}>Excel</DropdownMenuItem>
            <DropdownMenuItem onClick={async ()=>{ const ts=new Date(); const suffix=`${ts.toISOString().slice(0,10)}-${String(ts.getHours()).padStart(2,'0')}${String(ts.getMinutes()).padStart(2,'0')}`; const { data } = await axios.get(`${API_URL}/api/infrastructure-types/export`, { responseType:'blob', params:{ format:'geojson' } }); downloadBlob(`infra-types-${suffix}.geojson`, data); }}>GeoJSON</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DataTable
        columns={columns}
        data={types || []}
        actions={(row) => (
          <Button variant="destructive" onClick={()=> setConfirm({ id: row.id })} disabled={deleting}>Supprimer</Button>
        )}
      />

      <ActionDialog open={createOpen} onClose={()=> setCreateOpen(false)} onSubmit={()=> { createType(form); setCreateOpen(false); setForm({ name: '', color: '' }); }} title="Créer un type">
        <Input placeholder="Nom" value={form.name} onChange={(e)=> setForm(f=>({ ...f, name: e.target.value }))} />
        <Input placeholder="Couleur (ex: #0ea5e9)" value={form.color} onChange={(e)=> setForm(f=>({ ...f, color: e.target.value }))} />
      </ActionDialog>

      <ConfirmDialog open={!!confirm} onClose={()=> setConfirm(null)} onConfirm={()=> { if(confirm) deleteType(confirm.id); setConfirm(null); }} title="Supprimer" description="Confirmez la suppression" variant="danger" />
    </div>
  );
}
