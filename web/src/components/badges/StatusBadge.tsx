import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import type { ReportStatus } from '@/services/types';

const colors: Record<ReportStatus, string> = {
  draft:          'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  pending_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  assigned:       'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  resolved:       'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected:       'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

function label(status: ReportStatus) {
  switch (status) {
    case 'draft':          return 'Brouillon';
    case 'pending_review': return 'En attente';
    case 'assigned':       return 'Assigné';
    case 'resolved':       return 'Résolu';
    case 'rejected':       return 'Rejeté';
  }
}

export const StatusBadge = memo(function StatusBadge({ status, className = '' }: { status: ReportStatus; className?: string }){
  const cls = colors[status] ?? 'bg-gray-100 text-gray-700';
  return <Badge className={`${cls} animate-scale-in ${className}`}>{label(status) ?? status}</Badge>;
});
