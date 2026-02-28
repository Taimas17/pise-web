import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { Button } from "./components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { AlertCircle, MapPin, ClipboardList, BarChart3, Shield, Wrench, Droplets, BookOpen, ChevronRight } from "lucide-react";
import { api } from "./lib/api";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import Navbar from "./components/navigation/Navbar";
import { useAuthStore } from "./stores/useAuthStore";

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

// roles: undefined = tous | [] = authentifié seulement | ['admin'] = rôles spécifiques
export type NavItem = { to: string; label: string; roles?: string[] };

const ALL_NAV_ITEMS: NavItem[] = [
  { to: "/signaler",  label: "Signaler" },
  { to: "/suivi",     label: "Suivi",           roles: [] },
  { to: "/chantiers", label: "Chantiers",       roles: ['admin', 'moderator', 'agent'] },
  { to: "/dashboard", label: "Tableau de bord", roles: ['admin', 'moderator', 'agent'] },
  { to: "/admin",     label: "Admin",           roles: ['admin'] },
  { to: "/compte",    label: "Compte" },
];

function filterNavItems(items: NavItem[], role: string | undefined): NavItem[] {
  return items.filter(item => {
    if (!item.roles) return true;
    if (item.roles.length === 0) return !!role;
    return role ? item.roles.includes(role) : false;
  });
}

export default function App() {
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const user = useAuthStore(s => s.user);
  const navItems = filterNavItems(ALL_NAV_ITEMS, user?.role);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await api.get("/health");
        if (!cancelled) setBackendHealthy(true);
      } catch {
        if (!cancelled) setBackendHealthy(false);
      }
    })();
    return () => { cancelled = true; };
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
              <footer className="border-t text-center text-sm text-muted-foreground py-4">
                © {new Date().getFullYear()} PISE — Commune de Nikki, Bénin
              </footer>
            </div>
          )}
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Page d'accueil
───────────────────────────────────────────────────────────────────────── */
function Home() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const isStaff = user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'agent';

  const features = [
    {
      icon: <MapPin className="size-6" />,
      color: 'text-sky-600',
      bg: 'bg-sky-50 dark:bg-sky-950/40',
      border: 'border-sky-100 dark:border-sky-900',
      title: 'Signaler une anomalie',
      desc: 'Localisez et signalez une infrastructure dégradée — route, pont, école, eau potable — en quelques clics.',
      cta: 'Créer un signalement',
      href: '/signaler',
      show: true,
    },
    {
      icon: <ClipboardList className="size-6" />,
      color: 'text-violet-600',
      bg: 'bg-violet-50 dark:bg-violet-950/40',
      border: 'border-violet-100 dark:border-violet-900',
      title: 'Suivre les signalements',
      desc: 'Consultez l\'état de vos signalements et ceux de votre commune en temps réel.',
      cta: 'Voir le suivi',
      href: '/suivi',
      show: !!user,
    },
    {
      icon: <BarChart3 className="size-6" />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-100 dark:border-emerald-900',
      title: 'Tableau de bord',
      desc: 'Visualisez les indicateurs de performance, la carte des infrastructures et exportez les données.',
      cta: 'Ouvrir le tableau de bord',
      href: '/dashboard',
      show: isStaff,
    },
  ].filter(f => f.show);

  const infraTypes = [
    { icon: <Wrench className="size-4" />,   label: 'Routes & Ponts' },
    { icon: <BookOpen className="size-4" />, label: 'Écoles' },
    { icon: <Droplets className="size-4" />, label: 'Eau potable' },
    { icon: <Shield className="size-4" />,   label: 'Marchés' },
  ];

  const steps = [
    { num: '01', title: 'Repérez',  desc: 'Une infrastructure dégradée dans la commune' },
    { num: '02', title: 'Signalez', desc: 'En quelques clics via le formulaire en ligne' },
    { num: '03', title: 'Suivez',   desc: 'L\'avancement de la prise en charge' },
    { num: '04', title: 'Résolu',   desc: 'La commune intervient et clôture le signalement' },
  ];

  return (
    <div className="grid gap-0 animate-fade-in -mt-2">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative rounded-2xl overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-sky-500 to-emerald-500" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 px-6 md:px-10 py-14 md:py-20 text-white">
          <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full mb-5">
            <span className="size-1.5 rounded-full bg-emerald-300 animate-pulse inline-block" />
            Commune de Nikki — Bénin
          </span>

          <h1 className="text-3xl md:text-[2.75rem] font-extrabold leading-tight mb-4 max-w-2xl tracking-tight">
            Plateforme Intégrée de<br />
            <span className="text-emerald-200">Suivi des Équipements</span>
          </h1>

          <p className="text-white/85 text-base md:text-lg max-w-xl mb-8 leading-relaxed">
            Signalez les anomalies d'infrastructure publique, suivez leur résolution
            et analysez les performances de votre commune.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-white text-sky-700 hover:bg-white/90 font-semibold shadow-lg transition-transform active:scale-95"
              onClick={() => navigate('/signaler')}
            >
              <MapPin className="mr-2 size-4" />
              Signaler une anomalie
            </Button>

            {isStaff && (
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/15 font-semibold"
                onClick={() => navigate('/dashboard')}
              >
                <BarChart3 className="mr-2 size-4" />
                Tableau de bord
              </Button>
            )}

            {!user && (
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/15 font-semibold"
                onClick={() => navigate('/compte')}
              >
                Se connecter
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ── Feature cards ─────────────────────────────────────── */}
      {features.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-bold text-foreground mb-5">Que souhaitez-vous faire ?</h2>
          <div className={`grid gap-4 ${features.length === 1 ? 'grid-cols-1 max-w-sm' : features.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
            {features.map((f) => (
              <Link key={f.href} to={f.href} className="group block">
                <div className={`h-full rounded-xl border p-5 ${f.bg} ${f.border} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}>
                  <div className={`${f.color} mb-3`}>{f.icon}</div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{f.desc}</p>
                  <span className={`inline-flex items-center gap-1 text-sm font-medium ${f.color} group-hover:gap-2 transition-all`}>
                    {f.cta} <ChevronRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-foreground mb-5">Comment ça marche ?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <div key={s.num} className="relative flex flex-col items-start">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-5 left-[calc(100%-8px)] w-full h-px bg-border z-0" />
              )}
              <div className="relative z-10 flex items-center justify-center size-10 rounded-full bg-sky-600 text-white text-sm font-bold mb-3 shrink-0 shadow-sm">
                {s.num}
              </div>
              <p className="font-semibold text-sm text-foreground">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Types couverts ────────────────────────────────────── */}
      <section className="rounded-xl border bg-muted/30 dark:bg-muted/10 px-6 py-5 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-foreground mb-1">Infrastructures couvertes</h2>
            <p className="text-xs text-muted-foreground">Routes, ponts, écoles, eau, marchés, électricité et plus.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {infraTypes.map((t) => (
              <span key={t.label} className="inline-flex items-center gap-1.5 bg-background border rounded-full px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                <span className="text-sky-600">{t.icon}</span>
                {t.label}
              </span>
            ))}
            <span className="inline-flex items-center bg-background border rounded-full px-3 py-1 text-xs text-muted-foreground">
              et plus…
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
