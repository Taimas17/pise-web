import { ReactNode, useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type Column<T> = {
  key: keyof T | string;
  header: string | ReactNode;
  sortable?: boolean;
  accessor?: (row: T) => any;
  render?: (row: T) => ReactNode;
  className?: string;
};

export default function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  onRowClick,
  actions,
  pagination,
}: {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  actions?: (row: T) => ReactNode;
  pagination?: { current?: number; total?: number; onChange?: (page: number) => void };
}){
  const [sort, setSort] = useState<{ key?: string; dir: 'asc' | 'desc' }>({ dir: 'asc' });
  const sorted = useMemo(() => {
    if (!sort.key) return data;
    return [...data].sort((a, b) => {
      const col = columns.find(c => (c.key as string) === sort.key);
      const va = col?.accessor ? col.accessor(a as T) : (a as any)[sort.key!];
      const vb = col?.accessor ? col.accessor(b as T) : (b as any)[sort.key!];
      if (va === vb) return 0;
      return (va > vb ? 1 : -1) * (sort.dir === 'asc' ? 1 : -1);
    });
  }, [data, sort, columns]);

  return (
    <div>
      <div className="hidden md:block border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={String(c.key)} className={c.className} onClick={() => { if (c.sortable) setSort((s) => ({ key: c.key as string, dir: s.dir === 'asc' ? 'desc' : 'asc' })); }}>
                  <div className={`flex items-center gap-1 ${c.sortable ? 'cursor-pointer select-none' : ''}`}>
                    {c.header}
                    {c.sortable && sort.key === c.key && (sort.dir === 'asc' ? '▲' : '▼')}
                  </div>
                </TableHead>
              ))}
              {actions && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row, idx) => (
              <TableRow key={(row.id as any) ?? idx} className={onRowClick ? 'cursor-pointer' : ''} onClick={() => onRowClick?.(row)}>
                {columns.map((c) => (
                  <TableCell key={String(c.key)} className={c.className}>
                    {c.render ? c.render(row) : (c.accessor ? c.accessor(row) : (row as any)[c.key as string])}
                  </TableCell>
                ))}
                {actions && <TableCell className="text-right">{actions(row)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-3">
        {sorted.map((row, idx) => (
          <div key={(row.id as any) ?? idx} className="p-3 rounded border">
            {columns.map((c) => (
              <div key={String(c.key)} className="text-sm py-1">
                <div className="text-muted-foreground">{typeof c.header === 'string' ? c.header : ''}</div>
                <div>{c.render ? c.render(row) : (c.accessor ? c.accessor(row) : (row as any)[c.key as string])}</div>
              </div>
            ))}
            {actions && <div className="pt-2 text-right">{actions(row)}</div>}
          </div>
        ))}
      </div>

      {pagination && pagination.total && pagination.total > 1 && (
        <div className="flex items-center justify-center gap-2 pt-3">
          {Array.from({ length: pagination.total }).map((_, i) => {
            const page = i + 1;
            const active = page === (pagination.current || 1);
            return (
              <button key={page} onClick={() => pagination.onChange?.(page)} className={`px-3 py-1 rounded border ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                {page}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
