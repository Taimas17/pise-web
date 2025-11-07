import PageHeader from '@/components/layouts/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InfraTypesManager from './InfraTypesManager';
import ZonesManager from './ZonesManager';
import UsersManager from './UsersManager';
import AuditViewer from './AuditViewer';

export default function Admin(){
  return (
    <div className="grid gap-6 animate-fade-in">
      <PageHeader title="Administration" />
      <Tabs defaultValue="types">
        <TabsList>
          <TabsTrigger value="types">Types d'infrastructure</TabsTrigger>
          <TabsTrigger value="zones">Zones</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>
        <TabsContent value="types"><InfraTypesManager /></TabsContent>
        <TabsContent value="zones"><ZonesManager /></TabsContent>
        <TabsContent value="users"><UsersManager /></TabsContent>
        <TabsContent value="audit"><AuditViewer /></TabsContent>
      </Tabs>
    </div>
  );
}
