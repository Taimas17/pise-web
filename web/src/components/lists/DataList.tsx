import { ReactNode } from 'react';
import LoadingState from '@/components/layouts/LoadingState';

export default function DataList<T>({
  data,
  renderItem,
  loading,
  error,
  pagination,
  empty,
}: {
  data?: T[];
  renderItem: (item: T) => ReactNode;
  loading?: boolean;
  error?: unknown;
  empty?: ReactNode;
  pagination?: { current?: number; total?: number; onChange?: (page: number) => void };
}) {
  if (loading) return <LoadingState type="list" count={6} />;
  if (error) return <div className="text-red-600">Une erreur est survenue.</div>;
  if (!data || data.length === 0) return empty || <div className="text-muted-foreground">Aucun résultat.</div>;

  return (
    <div className="space-y-3">
      {data.map((item, idx) => (
        <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
          {renderItem(item)}
        </div>
      ))}
      {pagination && pagination.total && pagination.total > 1 && (
        <div className="flex items-center justify-center gap-2 pt-3">
          {Array.from({ length: pagination.total }).map((_, i) => {
            const page = i + 1;
            const active = page === (pagination.current || 1);
            return (
              <button
                key={page}
                onClick={() => pagination.onChange?.(page)}
                className={`px-3 py-1 rounded border ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
