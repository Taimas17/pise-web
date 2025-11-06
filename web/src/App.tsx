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
import { AlertCircle, Menu } from "lucide-react";
import { api } from "./lib/api";
import ChantiersList from "./pages/ChantiersList";
import ChantierDetail from "./pages/ChantierDetail";
import { useIsMobile } from "./hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./components/ui/sheet";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "next-themes";

const navItems = [
  { to: "/signaler", label: "Signaler" },
  { to: "/suivi", label: "Suivi" },
  { to: "/chantiers", label: "Chantiers" },
  { to: "/dashboard", label: "Tableau de bord" },
  { to: "/admin", label: "Admin" },
  { to: "/compte", label: "Compte" },
];

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="touch-target">
          <Menu className="size-5" />
          <span className="sr-only">Ouvrir la navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>
            <Link to="/" className="text-xl font-bold text-sky-600">PISE</Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="p-2">
          <ul className="grid gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-sm px-3 py-2 text-base ${
                      isActive
                        ? "bg-sky-50 text-sky-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function DesktopNav() {
  return (
    <nav className="hidden md:flex items-center gap-5 text-sm">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `transition-colors ${
              isActive
                ? "text-sky-700 font-medium border-b-2 border-sky-600 pb-0.5"
                : "text-gray-600 hover:text-gray-900"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

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
              <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
                  <div className="md:hidden">
                    <MobileNav />
                  </div>
                  <Link to="/" className="text-responsive-h2 text-sky-600 tracking-tight">PISE</Link>
                  <div className="ml-auto">
                    {isMobile ? null : <DesktopNav />}
                  </div>
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
