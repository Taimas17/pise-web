import { useState } from 'react';
import DataTable, { Column } from '@/components/lists/DataTable';
import { useAuditLogs } from '@/hooks/api/useAudit';
import FilterPanel, { FilterDescriptor } from '@/components/filters/FilterPanel';
import axios from 'axios';
import { API_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { downloadBlob } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function AuditViewer(){
  const [filters, setFilters] = useState<{ page?: number; q?: string }>({ page: 1 });
  const { data } = useAuditLogs(filters);

  const columns: Column<any>[] = [
    { key: 'id', header: 'ID' },
    { key: 'action', header: 'Action' },
    { key: 'user', header: 'Utilisateur', render: (row)=> row.user?.name || row.user_id },
    { key: 'created_at', header: 'Date' },
    { key: 'details', header: 'Détails', render: (row)=> <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(row.details || row.meta || {}, null, 2)}</pre> },
  ];

  const filterDefs: FilterDescriptor[] = [
    { type: 'search', name: 'q', label: 'Rechercher' },
  ];

  return (
    <div className="grid gap-3">
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Exporter</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={async ()=>{ const ts=new Date(); const suffix=`${ts.toISOString().slice(0,10)}-${String(ts.getHours()).padStart(2,'0')}${String(ts.getMinutes()).padStart(2,'0')}`; const { data } = await axios.get(`${API_URL}/api/audit/export`, { responseType:'blob', params:{ format:'pdf', q: filters.q } }); downloadBlob(`audit-${suffix}.pdf`, data); }}>PDF</DropdownMenuItem>
            <DropdownMenuItem onClick={async ()=>{ const ts=new Date(); const suffix=`${ts.toISOString().slice(0,10)}-${String(ts.getHours()).padStart(2,'0')}${String(ts.getMinutes()).padStart(2,'0')}`; const { data } = await axios.get(`${API_URL}/api/audit/export`, { responseType:'blob', params:{ format:'excel', q: filters.q } }); downloadBlob(`audit-${suffix}.xlsx`, data); }}>Excel</DropdownMenuItem>
            <DropdownMenuItem onClick={async ()=>{ const ts=new Date(); const suffix=`${ts.toISOString().slice(0,10)}-${String(ts.getHours()).padStart(2,'0')}${String(ts.getMinutes()).padStart(2,'0')}`; const { data } = await axios.get(`${API_URL}/api/audit/export`, { responseType:'blob', params:{ format:'geojson', q: filters.q } }); downloadBlob(`audit-${suffix}.geojson`, data); }}>GeoJSON</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <FilterPanel filters={filterDefs} values={filters as any} onChange={(n,v)=> setFilters(f=>({ ...f, [n]: v, page: 1 }))} onReset={()=> setFilters({ page: 1 })} />
      <DataTable
        columns={columns}
        data={data?.data || []}
        pagination={{ current: data?.current_page, total: data?.last_page, onChange: (page)=> setFilters(f=>({ ...f, page })) }}
      />
    </div>
  );
}
