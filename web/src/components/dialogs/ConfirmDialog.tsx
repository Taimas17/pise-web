import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function ConfirmDialog({ open, onClose, onConfirm, title, description, variant = 'info', confirmLabel = 'Confirmer', cancelLabel = 'Annuler', loading = false }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; description?: string; variant?: 'danger' | 'warning' | 'info'; confirmLabel?: string; cancelLabel?: string; loading?: boolean }){
  const variantClass = variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' : variant === 'warning' ? 'bg-amber-600 text-white hover:bg-amber-700' : '';
  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} onClick={onClose}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction disabled={loading} onClick={onConfirm} className={variantClass}>{loading ? 'Veuillez patienter…' : confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
