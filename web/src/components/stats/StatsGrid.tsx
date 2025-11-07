import StatCard, { StatCardProps } from './StatCard';

export default function StatsGrid({ stats, columns = 4, loading = false }: { stats: StatCardProps[]; columns?: 2|3|4|5|6|7; loading?: boolean }){
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
        {Array.from({ length: columns }).map((_, i) => <div key={i} className="h-24 bg-muted rounded animate-pulse" />)}
      </div>
    );
  }
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
      {stats.map((s, idx) => (
        <div key={idx} style={{ animationDelay: `${idx * 40}ms` }}>
          <StatCard {...s} />
        </div>
      ))}
    </div>
  );
}
