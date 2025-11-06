import { ReactNode } from 'react';

export type StatCardProps = {
  title: string;
  value: number | string;
  icon?: ReactNode;
  trend?: { value: number; direction: 'up' | 'down' };
  description?: string;
  color?: 'primary' | 'green' | 'amber' | 'red' | 'blue' | 'purple';
};

export default function StatCard({ title, value, icon, trend, description, color = 'primary' }: StatCardProps){
  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
  };

  return (
    <div className="p-4 rounded-lg border bg-card card-hover animate-slide-up">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          {description && <div className="text-xs text-muted-foreground mt-1">{description}</div>}
        </div>
        {icon && <div className={`p-2 rounded ${colorMap[color]}`}>{icon}</div>}
      </div>
      {trend && (
        <div className={`mt-2 text-xs ${trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend.direction === 'up' ? '▲' : '▼'} {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
}
