import StatsGrid from '@/components/stats/StatsGrid';
import { Activity, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function StatsExample(){
  const stats = [
    { title: 'Signalements', value: 1284, icon: <Activity className="h-5 w-5" />, color: 'blue' as const },
    { title: 'Critiques', value: 42, icon: <AlertTriangle className="h-5 w-5" />, color: 'red' as const, trend: { value: 8, direction: 'down' } },
    { title: 'Résolus', value: 987, icon: <CheckCircle2 className="h-5 w-5" />, color: 'green' as const, trend: { value: 12, direction: 'up' } },
    { title: 'Zones actives', value: 23, icon: <MapPin className="h-5 w-5" />, color: 'purple' as const },
  ];

  return <StatsGrid stats={stats as any} columns={4} />;
}
