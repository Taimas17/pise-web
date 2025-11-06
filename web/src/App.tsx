import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
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
import { AlertCircle } from "lucide-react";
import { api } from "./lib/api";
import ChantiersList from "./pages/ChantiersList";
import ChantierDetail from "./pages/ChantierDetail";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await api.get('/health');
        setBackendHealthy(true);
      } catch {
        setBackendHealthy(false);
      }
    })();
  }, []);

  if (backendHealthy === false) {
    return (
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
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <Link to="/" className="font-semibold text-sky-600">PISE</Link>
              <nav className="flex items-center gap-4 text-sm">
                <NavLink to="/signaler" className={({isActive})=>isActive?"text-sky-700 font-medium":"text-gray-600 hover:text-gray-900"}>Signaler</NavLink>
                <NavLink to="/suivi" className={({isActive})=>isActive?"text-sky-700 font-medium":"text-gray-600 hover:text-gray-900"}>Suivi</NavLink>
                <NavLink to="/chantiers" className={({isActive})=>isActive?"text-sky-700 font-medium":"text-gray-600 hover:text-gray-900"}>Chantiers</NavLink>
                <NavLink to="/dashboard" className={({isActive})=>isActive?"text-sky-700 font-medium":"text-gray-600 hover:text-gray-900"}>Tableau de bord</NavLink>
                <NavLink to="/admin" className={({isActive})=>isActive?"text-sky-700 font-medium":"text-gray-600 hover:text-gray-900"}>Admin</NavLink>
                <NavLink to="/compte" className={({isActive})=>isActive?"text-sky-700 font-medium":"text-gray-600 hover:text-gray-900"}>Compte</NavLink>
              </nav>
            </div>
          </header>
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
            </Routes>
          </main>
          <footer className="border-t text-center text-sm text-gray-500 py-4">© {new Date().getFullYear()} PISE</footer>
        </div>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

function Home(){
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Pilote PISE</h1>
      <p className="text-gray-600">Signaler une anomalie d’infrastructure publique et suivre sa résolution.</p>
      <div className="flex gap-3">
        <Link to="/signaler"><Button>Créer un signalement</Button></Link>
        <Link to="/dashboard"><Button variant="outline">Voir le tableau de bord</Button></Link>
      </div>
    </div>
  )
}
