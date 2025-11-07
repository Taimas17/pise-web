import { useState } from 'react';
import DataTable, { Column } from '@/components/lists/DataTable';
import { useAuditLogs } from '@/hooks/api/useAudit';
import FilterPanel, { FilterDescriptor } from '@/components/filters/FilterPanel';

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
      <FilterPanel filters={filterDefs} values={filters as any} onChange={(n,v)=> setFilters(f=>({ ...f, [n]: v, page: 1 }))} onReset={()=> setFilters({ page: 1 })} />
      <DataTable
        columns={columns}
        data={data?.data || []}
        pagination={{ current: data?.current_page, total: data?.last_page, onChange: (page)=> setFilters(f=>({ ...f, page })) }}
      />
    </div>
  );
}
