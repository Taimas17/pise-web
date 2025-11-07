import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import SignalementForm from "./pages/SignalementForm";
import ReportsList from "./pages/ReportsList";
import ReportDetail from "./pages/ReportDetail";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Account from "./pages/Account";
import { Toaster } from "./components/ui/sonner";
import { Button } from "./components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { AlertCircle, Menu } from "lucide-react";
import { api } from "./lib/api";
import ChantiersList from "./pages/ChantiersList";
import ChantierDetail from "./pages/chantiers/ChantierDetail";
import { useIsMobile } from "./hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./components/ui/sheet";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import FiltersExample from "./pages/examples/FiltersExample";
import StatsExample from "./pages/examples/StatsExample";
import TableExample from "./pages/examples/TableExample";
import ChartsExample from "./pages/examples/ChartsExample";
import DialogsExample from "./pages/examples/DialogsExample";
import SectionsExample from "./pages/examples/SectionsExample";
import DarkCheck from "./pages/examples/DarkCheck";
import Navbar from "./components/navigation/Navbar";

const navItems = [
  { to: "/signaler", label: "Signaler" },
  { to: "/suivi", label: "Suivi" },
  { to: "/chantiers", label: "Chantiers" },
  { to: "/dashboard", label: "Tableau de bord" },
  { to: "/admin", label: "Admin" },
  { to: "/compte", label: "Compte" },
];

export default function App() {
  const isMobile = useIsMobile();
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await api.get("/health");
        if (!cancelled) {
          setBackendHealthy(true);
        }
      } catch {
        if (!cancelled) {
          setBackendHealthy(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BrowserRouter>
          {backendHealthy === false ? (
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="max-w-md w-full">
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertTitle>Erreur de connexion</AlertTitle>
                  <AlertDescription>
                    <p>Impossible de se connecter au serveur backend.</p>
                    <Button variant="outline" className="mt-3" onClick={() => window.location.reload()}>
                      Réessayer
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          ) : (
            <div className="min-h-screen flex flex-col">
              <Navbar items={navItems} />
              <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signaler" element={<SignalementForm />} />
                  <Route path="/suivi" element={<ReportsList />} />
                  <Route path="/suivi/:id" element={<ReportDetail />} />
                  <Route path="/chantiers" element={<ChantiersList />} />
                  <Route path="/chantiers/:id" element={<ChantierDetail />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/compte" element={<Account />} />
                  {/* Examples (stories) */}
                  <Route path="/examples/filters" element={<FiltersExample />} />
                  <Route path="/examples/stats" element={<StatsExample />} />
                  <Route path="/examples/table" element={<TableExample />} />
                  <Route path="/examples/charts" element={<ChartsExample />} />
                  <Route path="/examples/dialogs" element={<DialogsExample />} />
                  <Route path="/examples/sections" element={<SectionsExample />} />
                  <Route path="/examples/dark-check" element={<DarkCheck />} />
                </Routes>
              </main>
              <footer className="border-t text-center text-sm text-gray-500 py-4">© {new Date().getFullYear()} PISE</footer>
            </div>
          )}
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

function Home() {
  return (
    <div className="grid gap-6">
      <h1 className="text-responsive-h1">Pilote PISE</h1>
      <p className="text-gray-700">Signaler une anomalie d’infrastructure publique et suivre sa résolution.</p>
      <div className="flex flex-wrap gap-3">
        <Link to="/signaler"><Button className="touch-target">Créer un signalement</Button></Link>
        <Link to="/dashboard"><Button variant="outline" className="touch-target">Voir le tableau de bord</Button></Link>
      </div>
    </div>
  );
}
