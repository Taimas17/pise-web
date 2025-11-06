import { useState, useEffect } from 'react';
import { useZones } from '@/hooks/api/useZones';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function ZoneCascade({ value, onChange }: { value?: number; onChange: (zoneId?: number) => void }){
  const [commune, setCommune] = useState<number | undefined>(undefined);
  const [arrondissement, setArrondissement] = useState<number | undefined>(undefined);
  const [quartier, setQuartier] = useState<number | undefined>(undefined);

  const communes = useZones(undefined);
  const arrondissements = useZones(commune);
  const quartiers = useZones(arrondissement);

  useEffect(() => {
    if (quartier) onChange(quartier);
    else if (arrondissement) onChange(arrondissement);
    else if (commune) onChange(commune);
    else onChange(undefined);
  }, [commune, arrondissement, quartier]);

  useEffect(() => {
    if (value) {
      // si un value initial est fourni, on laisse l'utilisateur re-sélectionner
    }
  }, [value]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <Select value={commune ? String(commune) : ''} onValueChange={(v) => { setCommune(Number(v)); setArrondissement(undefined); setQuartier(undefined); }}>
        <SelectTrigger><SelectValue placeholder="Commune" /></SelectTrigger>
        <SelectContent>
          {communes.data?.map((z) => <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={arrondissement ? String(arrondissement) : ''} onValueChange={(v) => { setArrondissement(Number(v)); setQuartier(undefined); }} disabled={!commune}>
        <SelectTrigger><SelectValue placeholder="Arrondissement" /></SelectTrigger>
        <SelectContent>
          {arrondissements.data?.map((z) => <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={quartier ? String(quartier) : ''} onValueChange={(v) => setQuartier(Number(v))} disabled={!arrondissement}>
        <SelectTrigger><SelectValue placeholder="Quartier" /></SelectTrigger>
        <SelectContent>
          {quartiers.data?.map((z) => <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="md:col-span-3 flex gap-2">
        <Button type="button" variant="ghost" onClick={() => { setCommune(undefined); setArrondissement(undefined); setQuartier(undefined); }}>Effacer</Button>
      </div>
    </div>
  );
}
