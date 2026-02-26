import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { Button } from "./components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { AlertCircle } from "lucide-react";
import { api } from "./lib/api";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import Navbar from "./components/navigation/Navbar";

const SignalementForm = lazy(() => import("./pages/SignalementForm"));
const ReportsList     = lazy(() => import("./pages/ReportsList"));
const ReportDetail    = lazy(() => import("./pages/ReportDetail"));
const Dashboard       = lazy(() => import("./pages/Dashboard"));
const Admin           = lazy(() => import("./pages/Admin"));
const Account         = lazy(() => import("./pages/Account"));
const ChantiersList   = lazy(() => import("./pages/ChantiersList"));
const ChantierDetail  = lazy(() => import("./pages/chantiers/ChantierDetail"));
const FiltersExample  = lazy(() => import("./pages/examples/FiltersExample"));
const StatsExample    = lazy(() => import("./pages/examples/StatsExample"));
const TableExample    = lazy(() => import("./pages/examples/TableExample"));
const ChartsExample   = lazy(() => import("./pages/examples/ChartsExample"));
const DialogsExample  = lazy(() => import("./pages/examples/DialogsExample"));
const SectionsExample = lazy(() => import("./pages/examples/SectionsExample"));
const DarkCheck       = lazy(() => import("./pages/examples/DarkCheck"));

const navItems = [
  { to: "/signaler", label: "Signaler" },
  { to: "/suivi", label: "Suivi" },
  { to: "/chantiers", label: "Chantiers" },
  { to: "/dashboard", label: "Tableau de bord" },
  { to: "/admin", label: "Admin" },
  { to: "/compte", label: "Compte" },
];

export default function App() {
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
                <Suspense fallback={<div className="flex items-center justify-center h-40 text-gray-400">Chargement…</div>}>
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
                </Suspense>
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
