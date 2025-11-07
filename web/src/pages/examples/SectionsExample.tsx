import PageSection from '@/components/layouts/PageSection';
import EmptyState from '@/components/layouts/EmptyState';
import { Button } from '@/components/ui/button';
import { Inbox } from 'lucide-react';

export default function SectionsExample(){
  return (
    <div className="space-y-6">
      <PageSection title="Section avec contenu" description="Exemple de section non-collapsible">
        <div className="grid grid-cols-2 gap-2">
          <div className="h-16 bg-muted rounded" />
          <div className="h-16 bg-muted rounded" />
        </div>
      </PageSection>

      <PageSection title="Section repliable" description="Peut être masquée" collapsible>
        <EmptyState
          icon={<Inbox className="h-10 w-10 mx-auto" />}
          title="Aucun élément"
          description="Commencez par créer un premier élément."
          action={<Button>Créer</Button>}
        />
      </PageSection>
    </div>
  );
}
