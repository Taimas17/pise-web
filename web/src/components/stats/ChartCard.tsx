import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ChartCard({ title, description, children, loading, onExport }: { title: string; description?: string; children: ReactNode; loading?: boolean; onExport?: () => void }){
  return (
    <Card className="animate-slide-up">
      <CardHeader className="flex-row items-center justify-between gap-2">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>Exporter</Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 rounded bg-muted animate-pulse" />
        ) : (
          <div className="h-64">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
