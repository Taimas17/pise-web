export default function LoadingState({ type = 'list', count = 5 }: { type?: 'list' | 'grid' | 'form' | 'chart'; count?: number }){
  if (type === 'form') {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-10 bg-muted rounded" />
        ))}
      </div>
    );
  }
  if (type === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded" />
        ))}
      </div>
    );
  }
  if (type === 'chart') {
    return <div className="h-64 bg-muted/60 rounded animate-pulse" />;
  }
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded" />
      ))}
    </div>
  );
}
