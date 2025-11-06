import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import type { ReportStatus } from '@/services/types';

const colors: Record<ReportStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  assigned: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

function label(status: ReportStatus) {
  switch (status) {
    case 'pending': return 'En attente';
    case 'approved': return 'Approuvé';
    case 'assigned': return 'Assigné';
    case 'in_progress': return 'En cours';
    case 'resolved': return 'Résolu';
    case 'rejected': return 'Rejeté';
  }
}

export const StatusBadge = memo(function StatusBadge({ status, className = '' }: { status: ReportStatus; className?: string }){
  return <Badge className={`${colors[status]} animate-scale-in ${className}`}>{label(status)}</Badge>;
});
