import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Report } from '@/services/types';
import { StatusBadge } from '@/components/badges/StatusBadge';
import { CriticalityBadge } from '@/components/badges/CriticalityBadge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export type ReportCardProps = {
  report: Report;
  onClick?: () => void;
  variant?: 'compact' | 'expanded';
};

export const ReportCard = memo(function ReportCard({ report, onClick, variant = 'compact' }: ReportCardProps){
  return (
    <Card className="card-hover cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{report.infrastructure_type?.name || 'Signalement'}</CardTitle>
          <div className="flex gap-2">
            <StatusBadge status={report.status} />
            <CriticalityBadge criticality={report.criticality} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">
        <p className={`line-clamp-${variant === 'compact' ? 2 : 4}`}>{report.description}</p>
        <div className="mt-2 text-xs opacity-80">
          {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: fr })}
          {report.zone?.name ? ` • ${report.zone.name}` : ''}
        </div>
      </CardContent>
    </Card>
  );
});
