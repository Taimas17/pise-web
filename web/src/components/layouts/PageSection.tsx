import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function PageSection({ title, description, collapsible = false, children }: { title: string; description?: string; collapsible?: boolean; children: ReactNode }){
  const [open, setOpen] = useState(true);
  return (
    <section className="rounded-lg border p-4 bg-card animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        {collapsible && (
          <button onClick={() => setOpen(o => !o)} className="text-sm text-muted-foreground flex items-center gap-1">
            {open ? 'Masquer' : 'Afficher'} <ChevronDown className={`h-4 w-4 transition-transform ${open ? '' : '-rotate-90'}`} />
          </button>
        )}
      </div>
      {(!collapsible || open) && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </section>
  );
}
