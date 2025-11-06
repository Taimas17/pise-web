import { ReactNode, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';

export type Option = { label: string; value: string | number };

export type FilterFieldProps = {
  type: 'search' | 'select' | 'multi-select' | 'date-range';
  name: string;
  label?: string;
  icon?: ReactNode;
  placeholder?: string;
  value?: any;
  onChange: (value: any) => void;
  options?: Option[];
};

export default function FilterField({ type, name, label, icon, placeholder, value, onChange, options = [] }: FilterFieldProps){
  const [open, setOpen] = useState(false);

  const content = useMemo(() => {
    if (type === 'search') {
      return (
        <Input
          placeholder={placeholder || 'Rechercher...'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }

    if (type === 'select') {
      return (
        <Select value={String(value ?? '')} onValueChange={(v) => onChange(v)}>
          <SelectTrigger><SelectValue placeholder={placeholder || 'Sélectionner'} /></SelectTrigger>
          <SelectContent>
            {options.map((opt) => <SelectItem key={String(opt.value)} value={String(opt.value)}>{opt.label}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    }

    if (type === 'multi-select') {
      return (
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const active = Array.isArray(value) && value.includes(opt.value);
            return (
              <Button
                key={String(opt.value)}
                type="button"
                variant={active ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  const prev: any[] = Array.isArray(value) ? value : [];
                  onChange(active ? prev.filter((v) => v !== opt.value) : [...prev, opt.value]);
                }}
              >
                {opt.label}
              </Button>
            );
          })}
        </div>
      );
    }

    if (type === 'date-range') {
      const from: Date | undefined = value?.from ? new Date(value.from) : undefined;
      const to: Date | undefined = value?.to ? new Date(value.to) : undefined;
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start w-full">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {from ? (
                to ? (
                  <span>{format(from, 'dd/MM/yyyy')} - {format(to, 'dd/MM/yyyy')}</span>
                ) : (
                  <span>{format(from, 'dd/MM/yyyy')}</span>
                )
              ) : (
                <span>{placeholder || 'Sélectionner une période'}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="range"
              selected={{ from, to }}
              numberOfMonths={2}
              onSelect={(range: any) => onChange({ from: range?.from, to: range?.to })}
              initialFocus
            />
            <div className="p-2 flex justify-end">
              <Button size="sm" variant="ghost" onClick={() => { onChange(undefined); setOpen(false); }}>
                <X className="h-4 w-4 mr-1"/> Effacer
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      );
    }

    return null;
  }, [type, value, options, placeholder, onChange, open]);

  return (
    <div className="space-y-1 animate-slide-up">
      {label && (
        <Label htmlFor={name} className="text-sm flex items-center gap-2">
          {icon}{label}
        </Label>
      )}
      {content}
    </div>
  );
}
