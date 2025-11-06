import { useState } from 'react';
import ConfirmDialog from '@/components/dialogs/ConfirmDialog';
import ActionDialog from '@/components/dialogs/ActionDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DialogsExample(){
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [name, setName] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => setConfirmOpen(true)} variant="destructive">Ouvrir ConfirmDialog</Button>
        <Button onClick={() => setActionOpen(true)} variant="outline">Ouvrir ActionDialog</Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => { setConfirmOpen(false); alert('Confirmé'); }}
        title="Supprimer l’élément"
        description="Cette action est irréversible. Êtes-vous sûr ?"
        variant="danger"
        confirmLabel="Supprimer"
      />

      <ActionDialog
        open={actionOpen}
        onClose={() => setActionOpen(false)}
        onSubmit={() => { setActionOpen(false); alert(`Nom: ${name}`); }}
        title="Créer un type"
        description="Entrez le nom du type"
        submitLabel="Créer"
      >
        <Input placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} />
      </ActionDialog>
    </div>
  );
}
