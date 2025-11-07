import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import type { ReportCriticality } from '@/services/types';

const colors: Record<ReportCriticality, string> = {
  low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export const CriticalityBadge = memo(function CriticalityBadge({ criticality, className = '' }: { criticality: ReportCriticality; className?: string }){
  return <Badge className={`${colors[criticality]} animate-scale-in ${className}`}>{criticality}</Badge>;
});
