import { BrowserRouter, Routes, Route, Link, NavLink, Navigate } from "react-router-dom";
import SignalementForm from "./pages/SignalementForm";
import ReportsList from "./pages/ReportsList";
import ReportDetail from "./pages/ReportDetail";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Account from "./pages/Account";
import { Toaster, toast } from "./components/ui/sonner";
import { Button } from "./components/ui/button";
import { AuthProvider, useAuth } from "./hooks/useAuth";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <HeaderNav />
          <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signaler" element={<SignalementForm />} />
              <Route
                path="/suivi"
                element={
                  <RequireAuth>
                    <ReportsList />
                  </RequireAuth>
                }
              />
              <Route
                path="/suivi/:id"
                element={
                  <RequireAuth>
                    <ReportDetail />
                  </RequireAuth>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <RequireRoles roles={["agent", "moderator", "admin"]}>
                    <Dashboard />
                  </RequireRoles>
                }
              />
              <Route
                path="/admin"
                element={
                  <RequireRoles roles={["moderator", "admin"]}>
                    <Admin />
                  </RequireRoles>
                }
              />
              <Route path="/compte" element={<Account />} />
            </Routes>
          </main>
          <footer className="border-t text-center text-sm text-gray-500 py-4">© {new Date().getFullYear()} PISE</footer>
        </div>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

function HeaderNav(){
  const { user } = useAuth();
  const role = user?.role;
  return (
    <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-sky-600">PISE</Link>
        <nav className="flex items-center gap-4 text-sm">
          <NavLink to="/signaler" className={({isActive})=>isActive?"text-sky-700 font-medium":"text-gray-600 hover:text-gray-900"}>Signaler</NavLink>
          {role && (
            <NavLink to="/suivi" className={({isActive})=>isActive?"text-sky-700 font-medium":"text-gray-600 hover:text-gray-900"}>Suivi</NavLink>
          )}
          {(role === "agent" || role === "moderator" || role === "admin") && (
            <NavLink to="/dashboard" className={({isActive})=>isActive?"text-sky-700 font-medium":"text-gray-600 hover:text-gray-900"}>Tableau de bord</NavLink>
          )}
          {(role === "moderator" || role === "admin") && (
            <NavLink to="/admin" className={({isActive})=>isActive?"text-sky-700 font-medium":"text-gray-600 hover:text-gray-900"}>Admin</NavLink>
          )}
          <NavLink to="/compte" className={({isActive})=>isActive?"text-sky-700 font-medium":"text-gray-600 hover:text-gray-900"}>Compte</NavLink>
        </nav>
      </div>
    </header>
  );
}

function RequireAuth({ children }: { children: JSX.Element }){
  const { user, loading } = useAuth();
  if (loading) return <p>Chargement…</p>;
  if (!user) {
    toast("Connexion requise");
    return <Navigate to="/compte" replace />;
  }
  return children;
}

function RequireRoles({ children, roles }: { children: JSX.Element; roles: Array<'citizen'|'agent'|'moderator'|'admin'> }){
  const { user, loading } = useAuth();
  if (loading) return <p>Chargement…</p>;
  if (!user) {
    toast("Connexion requise");
    return <Navigate to="/compte" replace />;
  }
  if (!roles.includes(user.role!)) {
    toast("Accès refusé");
    return <div className="text-sm text-red-600">Accès refusé</div>;
  }
  return children;
}

function Home(){
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Pilote PISE</h1>
      <p className="text-gray-600">Signaler une anomalie d’infrastructure publique et suivre sa résolution.</p>
      <div className="flex gap-3">
        <Link to="/signaler"><Button>Créer un signalement</Button></Link>
      </div>
    </div>
  )
}
