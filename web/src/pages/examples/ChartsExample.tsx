import ChartCard from '@/components/stats/ChartCard';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { month: 'Jan', value: 24 },
  { month: 'Fév', value: 32 },
  { month: 'Mar', value: 45 },
  { month: 'Avr', value: 39 },
  { month: 'Mai', value: 51 },
  { month: 'Juin', value: 47 },
];

export default function ChartsExample(){
  return (
    <ChartCard title="Fréquence mensuelle" description="Nombre de signalements par mois" onExport={() => alert('Export')}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
