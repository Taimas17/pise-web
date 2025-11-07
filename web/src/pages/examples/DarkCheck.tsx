import PageSection from '@/components/layouts/PageSection';
import PageHeader from '@/components/layouts/PageHeader';
import StatsGrid from '@/components/stats/StatsGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DarkCheck(){
  const stats = [
    { title: 'Exemple A', value: 123, color: 'blue' as const },
    { title: 'Exemple B', value: 456, color: 'green' as const },
    { title: 'Exemple C', value: '78%', color: 'amber' as const },
    { title: 'Exemple D', value: 90, color: 'purple' as const },
  ];
  return (
    <div className="grid gap-6 animate-fade-in">
      <PageHeader title="Dark mode — vérification visuelle" />
      <StatsGrid stats={stats as any} columns={4} />
      <PageSection title="Formulaires">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="Champ texte" />
          <Input placeholder="Email" type="email" />
          <Textarea placeholder="Zone de texte" />
          <Button>Action</Button>
        </div>
      </PageSection>
      <PageSection title="Cartes">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="card-hover">
              <CardHeader><CardTitle>Carte {i+1}</CardTitle></CardHeader>
              <CardContent>Contenu d’exemple</CardContent>
            </Card>
          ))}
        </div>
      </PageSection>
    </div>
  );
}
