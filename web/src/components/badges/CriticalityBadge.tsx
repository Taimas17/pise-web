import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import type { ReportCriticality } from '@/services/types';

const colors: Record<ReportCriticality, string> = {
  faible:  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  moyenne: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  haute:   'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const labels: Record<ReportCriticality, string> = {
  faible:  'Faible',
  moyenne: 'Moyenne',
  haute:   'Haute',
};

export const CriticalityBadge = memo(function CriticalityBadge({ criticality, className = '' }: { criticality: ReportCriticality; className?: string }){
  const cls = colors[criticality] ?? 'bg-gray-100 text-gray-700';
  return <Badge className={`${cls} animate-scale-in ${className}`}>{labels[criticality] ?? criticality}</Badge>;
});
