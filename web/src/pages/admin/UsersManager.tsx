import { useState } from 'react';
import DataTable, { Column } from '@/components/lists/DataTable';
import { useUsers, useUpdateUserRole } from '@/hooks/api/useUsers';
import FilterPanel, { FilterDescriptor } from '@/components/filters/FilterPanel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UsersManager(){
  const [filters, setFilters] = useState<{ page?: number; q?: string }>({ page: 1 });
  const { data } = useUsers(filters);
  const { mutate: updateRole } = useUpdateUserRole();

  const columns: Column<any>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: 'Nom' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Rôle', render: (row) => (
      <Select defaultValue={row.role} onValueChange={(v)=> updateRole({ id: row.id, role: v as any })}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Rôle" /></SelectTrigger>
        <SelectContent>
          {['admin','agent','citizen','moderator'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
        </SelectContent>
      </Select>
    ) },
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
