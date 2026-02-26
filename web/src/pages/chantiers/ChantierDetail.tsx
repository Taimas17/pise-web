import { useParams } from 'react-router-dom';
import { useChantier } from '@/hooks/api/useChantiers';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import PageHeader from '@/components/layouts/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LotsTab from './tabs/LotsTab';
import TimelineTab from './tabs/TimelineTab';
import BudgetTab from './tabs/BudgetTab';
import DocumentsTab from './tabs/DocumentsTab';
import AlertesTab from './tabs/AlertesTab';
import InfosTab from './tabs/InfosTab';
import LoadingState from '@/components/layouts/LoadingState';

export default function ChantierDetail(){
  const { id } = useParams();
  const chantierId = Number(id);
  const { data: chantier, isLoading } = useChantier(chantierId, { include: 'lots,etapes,expenses,attachments,reports' });

  if (isLoading || !chantier) return <LoadingState type="form" count={6} />;

  return (
    <div className="grid gap-4 animate-fade-in">
      <Breadcrumbs items={[{ label: 'Chantiers', href: '/chantiers' }, { label: `Chantier #${chantier.id}` }]} />

      <PageHeader
        title={`Chantier #${chantier.id} — ${chantier.name || ''}`}
        actions={[
          <div key="status" className="flex items-center gap-2">
            <Badge className="bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300">{chantier.status}</Badge>
            <span className="text-sm text-muted-foreground hidden sm:inline">{chantier.progress ?? 0}%</span>
          </div>
        ]}
      />

      <Progress value={Number(chantier.progress ?? 0)} />

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="lots">Lots</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="alertes">Alertes</TabsTrigger>
          <TabsTrigger value="infos">Infos</TabsTrigger>
        </TabsList>

        <TabsContent value="lots"><div className="animate-fade-in">
          <LotsTab chantierId={chantier.id} lots={chantier.lots} />
        </div></TabsContent>

        <TabsContent value="timeline"><div className="animate-fade-in">
          <TimelineTab chantierId={chantier.id} etapes={chantier.etapes} lots={chantier.lots} />
        </div></TabsContent>

        <TabsContent value="budget"><div className="animate-fade-in">
          <BudgetTab chantierId={chantier.id} expenses={chantier.expenses} lots={chantier.lots} summary={{ budget_planned: chantier.budget_total, budget_committed: undefined, budget_actual: undefined }} />
        </div></TabsContent>

        <TabsContent value="documents"><div className="animate-fade-in">
          <DocumentsTab chantierId={chantier.id} attachments={chantier.attachments} />
        </div></TabsContent>

        <TabsContent value="alertes"><div className="animate-fade-in">
          <AlertesTab chantierId={chantier.id} reports={chantier.reports} onChanged={() => { /* invalidation via mutations in future */ }} />
        </div></TabsContent>

        <TabsContent value="infos"><div className="animate-fade-in">
          <InfosTab chantier={chantier} types={[]} />
        </div></TabsContent>
      </Tabs>
    </div>
  );
}
