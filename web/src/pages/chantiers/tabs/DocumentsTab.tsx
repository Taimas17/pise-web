import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAttachDocument, useDeleteAttachment } from '@/hooks/api/useChantiers';

export default function DocumentsTab({ chantierId, attachments = [] }: { chantierId: number; attachments?: any[] }){
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const { mutate: attach, isPending } = useAttachDocument();
  const { mutate: remove } = useDeleteAttachment();

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2 animate-slide-up">
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Catégorie" /></SelectTrigger>
          <SelectContent>{['contrat','OS','PV_reception','photo','autre'].map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Button onClick={() => { if(!file) return; const data = new FormData(); data.append('file', file); if (category) data.append('category', category); attach({ chantierId, payload: data }); setFile(null); setCategory(''); }} disabled={isPending}>Uploader</Button>
      </div>

      <div className="grid gap-2">
        {attachments.map((a:any)=> (
          <div key={a.id} className="border rounded p-3 flex items-center justify-between animate-slide-up">
            <div>
              <div className="font-medium">{a.type} — {a.category || 'n/a'}</div>
              <div className="text-sm text-muted-foreground">{a.path}</div>
            </div>
            <div className="flex gap-2">
              <a href={`/storage/${a.path}`} target="_blank" className="text-sky-600">Voir</a>
              <Button variant="destructive" onClick={() => remove(a.id)}>Supprimer</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
