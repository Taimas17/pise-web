import { useMemo, useState } from 'react';
import DataTable, { Column } from '@/components/lists/DataTable';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/dialogs/ConfirmDialog';
import ActionDialog from '@/components/dialogs/ActionDialog';
import { Input } from '@/components/ui/input';
import { downloadBlob } from '@/lib/utils';
import { useZones, useCreateZone, useUpdateZone, useDeleteZone, useImportZones } from '@/hooks/api/useZones';
import FilterPanel, { FilterDescriptor } from '@/components/filters/FilterPanel';

export default function ZonesManager(){
  const [filters, setFilters] = useState<{ parent_id?: number; q?: string }>({});
  const { data: zones } = useZones(filters.parent_id);
  const { mutate: createZone } = useCreateZone();
  const { mutate: updateZone } = useUpdateZone();
  const { mutate: deleteZone } = useDeleteZone();
  const { mutate: importZones, isPending: importing } = useImportZones();

  const [confirm, setConfirm] = useState<{ id: number } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', parent_id: '' });
  const [file, setFile] = useState<File | null>(null);

  const columns: Column<any>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: 'Nom', sortable: true, render: (row) => (
      <Input defaultValue={row.name} onBlur={(e)=> updateZone({ id: row.id, payload: { name: e.target.value } })} />
    ) },
    { key: 'parent_id', header: 'Parent', render: (row) => (
      <Input defaultValue={row.parent_id || ''} onBlur={(e)=> updateZone({ id: row.id, payload: { parent_id: e.target.value ? Number(e.target.value) : undefined } })} />
    ) },
    { key: 'level', header: 'Niveau' },
  ];

  const filterDefs: FilterDescriptor[] = useMemo(() => ([
    { type: 'search', name: 'q', label: 'Rechercher' },
  ]), []);

  function exportCSV(){
    const header = 'id,name,parent_id,level\n';
    const rows = (zones||[]).map(z => `${z.id},${JSON.stringify(z.name)},${z.parent_id || ''},${JSON.stringify(z.level||'')}`).join('\n');
    const blob = new Blob([header+rows], { type: 'text/csv;charset=utf-8;' });
    const ts = new Date(); const suffix = `${ts.toISOString().slice(0,10)}-${String(ts.getHours()).padStart(2,'0')}${String(ts.getMinutes()).padStart(2,'0')}`;
    downloadBlob(`zones-${suffix}.csv`, blob);
  }

  return (
    <div className="grid gap-3">
      <div className="flex gap-2 flex-wrap">
        <Button onClick={()=> setCreateOpen(true)} className="transition-transform active:scale-95">Nouvelle zone</Button>
        <input type="file" accept=".csv,.xlsx" onChange={(e)=> setFile(e.target.files?.[0] || null)} />
        <Button variant="outline" onClick={()=> { if(!file) return; const fd = new FormData(); fd.append('file', file); importZones(fd); setFile(null); }} disabled={importing}>Importer</Button>
        <Button variant="outline" onClick={exportCSV}>Exporter CSV</Button>
      </div>

      <FilterPanel filters={filterDefs} values={filters as any} onChange={(name, value)=> setFilters(f=>({ ...f, [name]: value }))} />

      <DataTable
        columns={columns}
        data={zones || []}
        actions={(row) => (
          <Button variant="destructive" onClick={()=> setConfirm({ id: row.id })}>Supprimer</Button>
        )}
      />

      <ActionDialog open={createOpen} onClose={()=> setCreateOpen(false)} onSubmit={()=> { createZone({ name: form.name, parent_id: form.parent_id ? Number(form.parent_id) : undefined }); setCreateOpen(false); setForm({ name: '', parent_id: '' }); }} title="Créer une zone">
        <Input placeholder="Nom" value={form.name} onChange={(e)=> setForm(f=>({ ...f, name: e.target.value }))} />
        <Input placeholder="Parent ID (optionnel)" value={form.parent_id} onChange={(e)=> setForm(f=>({ ...f, parent_id: e.target.value }))} />
      </ActionDialog>

      <ConfirmDialog open={!!confirm} onClose={()=> setConfirm(null)} onConfirm={()=> { if(confirm) deleteZone(confirm.id); setConfirm(null); }} title="Supprimer" description="Confirmez la suppression" variant="danger" />
    </div>
  );
}
