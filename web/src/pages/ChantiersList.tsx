import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../components/ui/drawer";
import { Filter, Search } from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";

export default function ChantiersList() {
  const [rows, setRows] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: "",
    infrastructure_type_id: "",
    q: "",
    from: "",
    to: "",
    zone_commune_id: "",
    zone_arrondissement_id: "",
    zone_quartier_id: "",
    zone_id: "",
    manager_user_id: "",
    sort: "-created_at",
  });
  const [communes, setCommunes] = useState<any[]>([]);
  const [arrondissements, setArrondissements] = useState<any[]>([]);
  const [quartiers, setQuartiers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any | null>(null);

  async function load() {
    const params = Object.fromEntries(
      Object.entries({
        status: filters.status,
        infrastructure_type_id: filters.infrastructure_type_id,
        q: filters.q,
        from: filters.from,
        to: filters.to,
        zone_id: filters.zone_id,
        manager_user_id: filters.manager_user_id,
        sort: filters.sort,
      }).filter(([_, v]) => v)
    );
    const { data } = await api.get("/chantiers", { params });
    setRows(data.data || data);
  }

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/infrastructure-types");
        setTypes(data);
        const { data: com } = await api.get("/zones", { params: { level: "commune" } });
        setCommunes(com);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (filters.zone_commune_id) {
        const { data } = await api.get("/zones", {
          params: { level: "arrondissement", parent_id: filters.zone_commune_id },
        });
        setArrondissements(data);
        setQuartiers([]);
      } else {
        setArrondissements([]);
        setQuartiers([]);
      }
    })();
  }, [filters.zone_commune_id]);

  useEffect(() => {
    (async () => {
      if (filters.zone_arrondissement_id) {
        const { data } = await api.get("/zones", {
          params: { level: "quartier", parent_id: filters.zone_arrondissement_id },
        });
        setQuartiers(data);
      } else {
        setQuartiers([]);
      }
    })();
  }, [filters.zone_arrondissement_id]);

  useEffect(() => {
    load();
  });

  useEffect(() => {
    (async () => {
      try {
        const params = Object.fromEntries(
          Object.entries(filters).filter(
            ([k, v]) =>
              [
                "infrastructure_type_id",
                "status",
                "from",
                "to",
                "zone_id",
                "manager_user_id",
              ].includes(k) && v
          )
        );
        const { data } = await api.get("/chantiers/metrics", { params });
        setMetrics(data);
      } catch {}
    })();
  }, [filters]);

  useEffect(() => {
    if (filters.zone_quartier_id) setFilters((f) => ({ ...f, zone_id: f.zone_quartier_id }));
    else if (filters.zone_arrondissement_id) setFilters((f) => ({ ...f, zone_id: f.zone_arrondissement_id }));
    else if (filters.zone_commune_id) setFilters((f) => ({ ...f, zone_id: f.zone_commune_id }));
    else setFilters((f) => ({ ...f, zone_id: "" }));
  }, [filters.zone_commune_id, filters.zone_arrondissement_id, filters.zone_quartier_id]);

  const isMobile = useIsMobile();
  const activeFiltersCount = useMemo(() => {
    const { q, sort, zone_id, ...rest } = filters;
    return Object.values(rest).filter(Boolean).length;
  }, [filters]);

  function StatusBadge({ value }: { value?: string }) {
    const map: Record<string, string> = {
      planned: "bg-gray-100 text-gray-800 border-gray-200",
      in_progress: "bg-sky-100 text-sky-800 border-sky-200",
      on_hold: "bg-yellow-100 text-yellow-800 border-yellow-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return <Badge className={map[value || ""] || "bg-gray-100 text-gray-800 border-gray-200"}>{value || ""}</Badge>;
  }

  return (
    <div className="grid gap-4">
      <h2 className="text-responsive-h2">Chantiers</h2>

      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Kpi label="Total" value={metrics.total_chantiers} />
          <Kpi label="En cours" value={metrics.in_progress} />
          <Kpi label="Terminés" value={metrics.completed} />
          <Kpi label="Avancement moyen" value={`${metrics.average_progress_pct}%`} />
          <Kpi label="Exécution budget" value={`${Math.round(metrics.budget_execution_rate * 100)}%`} />
          <Kpi label="À l'heure" value={`${Math.round(metrics.on_time_rate * 100)}%`} />
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full gap-2">
          <div className="relative w-full">
            <Input
              placeholder="Recherche"
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              className="w-full"
            />
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          </div>

          {isMobile && (
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="touch-target">
                  <Filter className="mr-2 size-4" /> Filtres
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 bg-sky-600 text-white border-sky-600">{activeFiltersCount}</Badge>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Filtres avancés</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
                    <SelectContent>
                      {["planned", "in_progress", "on_hold", "completed", "cancelled"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filters.infrastructure_type_id} onValueChange={(v) => setFilters((f) => ({ ...f, infrastructure_type_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      {types.map((t: any) => (
                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
                    <Input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
                  </div>
                  <Select value={filters.zone_commune_id} onValueChange={(v) => setFilters((f) => ({ ...f, zone_commune_id: v, zone_arrondissement_id: "", zone_quartier_id: "" }))}>
                    <SelectTrigger><SelectValue placeholder="Commune" /></SelectTrigger>
                    <SelectContent>
                      {communes.map((z: any) => (
                        <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filters.zone_arrondissement_id} onValueChange={(v) => setFilters((f) => ({ ...f, zone_arrondissement_id: v, zone_quartier_id: "" }))}>
                    <SelectTrigger><SelectValue placeholder="Arrondissement" /></SelectTrigger>
                    <SelectContent>
                      {arrondissements.map((z: any) => (
                        <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filters.zone_quartier_id} onValueChange={(v) => setFilters((f) => ({ ...f, zone_quartier_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Quartier" /></SelectTrigger>
                    <SelectContent>
                      {quartiers.map((z: any) => (
                        <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Manager ID" value={filters.manager_user_id} onChange={(e) => setFilters((f) => ({ ...f, manager_user_id: e.target.value }))} />
                  <Select value={filters.sort} onValueChange={(v) => setFilters((f) => ({ ...f, sort: v }))}>
                    <SelectTrigger><SelectValue placeholder="Tri" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-created_at">Plus récents</SelectItem>
                      <SelectItem value="planned_end_at">Fin prévue</SelectItem>
                      <SelectItem value="progress_pct">Avancement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </div>

        {!isMobile && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-full md:w-auto">
            <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
              <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                {["planned", "in_progress", "on_hold", "completed", "cancelled"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.infrastructure_type_id} onValueChange={(v) => setFilters((f) => ({ ...f, infrastructure_type_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {types.map((t: any) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
              <Input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
            </div>
            <Select value={filters.zone_commune_id} onValueChange={(v) => setFilters((f) => ({ ...f, zone_commune_id: v, zone_arrondissement_id: "", zone_quartier_id: "" }))}>
              <SelectTrigger><SelectValue placeholder="Commune" /></SelectTrigger>
              <SelectContent>
                {communes.map((z: any) => (
                  <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.zone_arrondissement_id} onValueChange={(v) => setFilters((f) => ({ ...f, zone_arrondissement_id: v, zone_quartier_id: "" }))}>
              <SelectTrigger><SelectValue placeholder="Arrondissement" /></SelectTrigger>
              <SelectContent>
                {arrondissements.map((z: any) => (
                  <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.zone_quartier_id} onValueChange={(v) => setFilters((f) => ({ ...f, zone_quartier_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Quartier" /></SelectTrigger>
              <SelectContent>
                {quartiers.map((z: any) => (
                  <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Manager ID" value={filters.manager_user_id} onChange={(e) => setFilters((f) => ({ ...f, manager_user_id: e.target.value }))} />
            <Select value={filters.sort} onValueChange={(v) => setFilters((f) => ({ ...f, sort: v }))}>
              <SelectTrigger><SelectValue placeholder="Tri" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="-created_at">Plus récents</SelectItem>
                <SelectItem value="planned_end_at">Fin prévue</SelectItem>
                <SelectItem value="progress_pct">Avancement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid gap-2">
        {rows.map((c: any) => (
          <Link to={`/chantiers/${c.id}`} key={c.id} className="border rounded-lg p-4 card-hover">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-medium text-gray-900">#{c.id} — {c.title}</div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {<StatusBadge value={c.status} />} <span className="text-gray-600">{c.progress_pct}%</span>
              </div>
            </div>
            {c.description && (
              <div className="text-sm text-gray-700 mt-1">{String(c.description).slice(0, 120)}</div>
            )}
            <div className="mt-3">
              <Progress value={Number(c.progress_pct) || 0} />
            </div>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() =>
            window.open(
              `/api/exports/chantiers.pdf?${new URLSearchParams(
                Object.fromEntries(
                  Object.entries(filters).filter(([k, v]) =>
                    ["infrastructure_type_id", "status", "from", "to", "zone_id", "manager_user_id"].includes(k) && v
                  )
                )
              ).toString()}`,
              "_blank"
            )
          }
          className="touch-target"
        >
          Exporter PDF
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            window.open(
              `/api/exports/chantiers.xlsx?${new URLSearchParams(
                Object.fromEntries(
                  Object.entries(filters).filter(([k, v]) =>
                    ["infrastructure_type_id", "status", "from", "to", "zone_id", "manager_user_id"].includes(k) && v
                  )
                )
              ).toString()}`,
              "_blank"
            )
          }
          className="touch-target"
        >
          Exporter Excel
        </Button>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: any }) {
  return (
    <div className="border rounded p-3 bg-white">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}