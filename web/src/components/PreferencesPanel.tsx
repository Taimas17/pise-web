import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { usePreferences } from "../hooks/usePreferences";

export default function PreferencesPanel(){
  const { theme, fontSize, density, setTheme, setFontSize, setDensity } = usePreferences();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" aria-label="Ouvrir les préférences">Préférences</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Préférences d’affichage</DialogTitle>
          <DialogDescription>Ajustez thème, taille de police et densité pour votre confort de lecture.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <label className="text-sm text-gray-600">Thème</label>
            <Select value={theme} onValueChange={(v)=> setTheme(v as any)}>
              <SelectTrigger className="w-56" aria-label="Choisir le thème"><SelectValue placeholder="Choisir…"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="system">Système</SelectItem>
                <SelectItem value="light">Clair</SelectItem>
                <SelectItem value="dark">Sombre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-gray-600">Taille de police</label>
            <Select value={fontSize} onValueChange={(v)=> setFontSize(v as any)}>
              <SelectTrigger className="w-56" aria-label="Choisir la taille de police"><SelectValue placeholder="Choisir…"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Petite</SelectItem>
                <SelectItem value="normal">Normale</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-gray-600">Densité</label>
            <Select value={density} onValueChange={(v)=> setDensity(v as any)}>
              <SelectTrigger className="w-56" aria-label="Choisir la densité"><SelectValue placeholder="Choisir…"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="comfortable">Confortable</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
