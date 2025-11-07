import { ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ActionDialog({ open, onClose, onSubmit, title, description, children, loading = false, submitLabel = 'Valider', cancelLabel = 'Annuler' }: { open: boolean; onClose: () => void; onSubmit: () => void; title: string; description?: string; children: ReactNode; loading?: boolean; submitLabel?: string; cancelLabel?: string }){
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-3">
          {children}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
          <Button onClick={onSubmit} disabled={loading}>{loading ? 'Veuillez patienter…' : submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
