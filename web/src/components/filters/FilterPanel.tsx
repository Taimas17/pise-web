import { useMemo, useState } from 'react';
import FilterField, { Option } from './FilterField';
import ZoneCascade from './ZoneCascade';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export type FilterDescriptor =
  | { type: 'search' | 'select' | 'multi-select' | 'date-range'; name: string; label?: string; placeholder?: string; options?: Option[] }
  | { type: 'cascade'; name: string; label?: string };

export default function FilterPanel({
  filters,
  values,
  onChange,
  onReset,
}: {
  filters: FilterDescriptor[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onReset?: () => void;
}){
  const activeCount = useMemo(() => Object.values(values).filter((v) => v !== undefined && v !== null && v !== '' && (!Array.isArray(v) || v.length > 0)).length, [values]);

  const content = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {filters.map((f) => (
        <div key={f.name}>
          {f.type === 'cascade' ? (
            <ZoneCascade value={values[f.name]} onChange={(v) => onChange(f.name, v)} />
          ) : (
            <FilterField
              type={f.type}
              name={f.name}
              label={f.label}
              placeholder={(f as any).placeholder}
              options={(f as any).options}
              value={values[f.name]}
              onChange={(v) => onChange(f.name, v)}
            />
          )}
        </div>
      ))}
      <div className="md:col-span-3 flex items-center gap-2">
        {onReset && <Button variant="outline" onClick={onReset}>Réinitialiser</Button>}
        <div className="text-sm text-muted-foreground">{activeCount} filtre{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}</div>
      </div>
    </div>
  );

  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4">
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline">Filtres ({activeCount})</Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader><SheetTitle>Filtres</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-3">{content}</div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden md:block animate-slide-down">
        {content}
      </div>
    </div>
  );
}
