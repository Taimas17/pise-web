import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function ErrorPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4 animate-fade-in">
      <h1 className="text-5xl font-bold tracking-tight">Oups…</h1>
      <p className="text-muted-foreground max-w-md">
        La page demandée est introuvable ou une erreur est survenue. Vérifiez l’URL ou revenez à l’accueil.
      </p>
      <div className="flex gap-3">
        <Link to="/"><Button>Retour à l’accueil</Button></Link>
        <Button variant="outline" onClick={() => window.location.reload()}>Recharger</Button>
      </div>
    </div>
  );
}
