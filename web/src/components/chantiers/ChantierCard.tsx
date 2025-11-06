import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Chantier } from '@/services/types';
import { Progress } from '@/components/ui/progress';

const statusColors: Record<string, string> = {
  planned: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
  in_progress: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  paused: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export type ChantierCardProps = {
  chantier: Chantier;
  onClick?: () => void;
  variant?: 'compact' | 'expanded';
};

export const ChantierCard = memo(function ChantierCard({ chantier, onClick, variant = 'compact' }: ChantierCardProps){
  const progress = Math.max(0, Math.min(100, Math.round(chantier.progress ?? 0)));
  const budget = chantier.budget_total ?? 0;
  const statusClass = statusColors[chantier.status] || 'bg-gray-100 text-gray-700';

  return (
    <Card className="card-hover cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{chantier.name}</CardTitle>
          <span className={`px-2 py-1 rounded text-xs ${statusClass}`}>{chantier.status}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground space-y-2">
        {chantier.description && <p className={`line-clamp-${variant === 'compact' ? 2 : 4}`}>{chantier.description}</p>}
        <div className="flex items-center justify-between">
          <span className="text-xs">Avancement</span>
          <span className="text-xs">{progress}%</span>
        </div>
        <Progress value={progress} />
        <div className="text-xs opacity-80 flex gap-3">
          {chantier.start_date && <span>Début: {new Date(chantier.start_date).toLocaleDateString()}</span>}
          {chantier.end_date && <span>Fin: {new Date(chantier.end_date).toLocaleDateString()}</span>}
        </div>
        <div className="text-xs opacity-80">Budget: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(budget)}</div>
      </CardContent>
    </Card>
  );
});
