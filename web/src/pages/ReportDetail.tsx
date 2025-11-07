import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/layouts/PageHeader';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import LoadingState from '@/components/layouts/LoadingState';
import { StatusBadge } from '@/components/badges/StatusBadge';
import { CriticalityBadge } from '@/components/badges/CriticalityBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Map from '@/components/Map';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ConfirmDialog from '@/components/dialogs/ConfirmDialog';
import ActionDialog from '@/components/dialogs/ActionDialog';
import { useReport, useReviewReport, useAssignReport, useUpdateReport } from '@/hooks/api/useReports';
import { API_URL } from '@/lib/api';

export default function ReportDetail(){
  const params = useParams();
  const id = Number(params.id);
  const { data: report, isLoading } = useReport(id);

  const [comment, setComment] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject'>('approve');
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [resolveOpen, setResolveOpen] = useState(false);

  const { mutate: reviewReport, isPending: reviewing } = useReviewReport();
  const { mutate: assignReport, isPending: assigning } = useAssignReport();
  const { mutate: updateReport, isPending: updating } = useUpdateReport();

  const actions = useMemo(() => [
    <div key="badges" className="flex gap-2">
      {report && <StatusBadge status={report.status} />}
      {report && <CriticalityBadge criticality={report.criticality} />}
    </div>,
  ], [report]);

  if (isLoading || !report) return <LoadingState type="form" count={6} />;

  const location = report.masked_location || report.location;

  function openConfirm(action: 'approve' | 'reject'){
    setConfirmAction(action);
    setConfirmOpen(true);
  }

  function handleConfirm(){
    reviewReport({ id, payload: { action: confirmAction, comment } });
    setConfirmOpen(false);
    setComment('');
  }

  function handleAssign(){
    const user_id = Number(assignUserId);
    if (!user_id) return;
    assignReport({ id, payload: { user_id } });
    setAssignOpen(false);
    setAssignUserId('');
  }

  function handleResolve(){
    updateReport({ id, payload: { status: 'resolved', resolved_at: new Date().toISOString() } as any });
    setResolveOpen(false);
  }

  return (
    <div className="grid gap-6 animate-fade-in">
      <Breadcrumbs items={[{ label: 'Suivi', href: '/suivi' }, { label: `Signalement #${report.id}` }]} />

      <PageHeader
        title={report.infrastructure_type?.name || `Signalement #${report.id}`}
        description={report.description}
        actions={actions}
      />

      {location && (
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Localisation</CardTitle>
            <CardDescription>Coordonnées {report.masked_location ? 'masquées' : 'exactes'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Map lat={location.lat} lng={location.lng} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {!!report.photos?.length && (
            <Card className="card-hover">
              <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {report.photos?.map((p:any) => {
                    const url = p.url || `${API_URL}/storage/${p.path}`;
                    const thumb = p.thumbnail_url || `${API_URL}/storage/${p.thumbnail_path || p.path}`;
                    return (
                      <a key={p.id} href={url} target="_blank">
                        <img src={thumb} className="w-full h-32 object-cover rounded hover:scale-[1.02] transition" />
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {!!report.status_histories?.length && (
            <Card className="card-hover">
              <CardHeader><CardTitle>Historique</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.status_histories?.map((h:any, i:number) => (
                    <div key={h.id || i} className="flex items-center justify-between border rounded p-2">
                      <div className="text-sm">
                        <div className="font-medium">{h.status}</div>
                        {h.comment && <div className="text-muted-foreground">{h.comment}</div>}
                      </div>
                      <div className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="card-hover">
            <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea placeholder="Commentaire" value={comment} onChange={(e) => setComment(e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => openConfirm('approve')} disabled={reviewing || report.status !== 'pending'}>Approuver</Button>
                <Button variant="destructive" onClick={() => openConfirm('reject')} disabled={reviewing || report.status !== 'pending'}>Rejeter</Button>
              </div>
              <Button variant="outline" onClick={() => setAssignOpen(true)} disabled={assigning}>Assigner</Button>
              <Button variant="secondary" onClick={() => setResolveOpen(true)} disabled={updating || report.status === 'resolved'}>Marquer résolu</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title={confirmAction === 'approve' ? 'Approuver' : 'Rejeter'}
        description="Êtes-vous sûr ?"
        variant={confirmAction === 'reject' ? 'danger' : 'info'}
        loading={reviewing}
      />

      <ActionDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onSubmit={handleAssign}
        title="Assigner le signalement"
        description="Saisir l’identifiant de l’agent"
        submitLabel="Assigner"
        loading={assigning}
      >
        <input className="border rounded h-9 px-2 w-full" placeholder="ID Agent" value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)} />
      </ActionDialog>

      <ActionDialog
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        onSubmit={handleResolve}
        title="Marquer résolu"
        description="Confirmez la résolution du signalement"
        submitLabel="Résoudre"
        loading={updating}
      >
        <div className="text-sm text-muted-foreground">Cette action passe le statut à « résolu » et rafraîchit les données.</div>
      </ActionDialog>
    </div>
  );
}
