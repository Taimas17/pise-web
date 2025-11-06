import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
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

export default function ReportsList() {
  const [reports, setReports] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: "",
    type_id: "",
    criticality: "",
    q: "",
    from: "",
    to: "",
    commune_id: "",
    arrondissement_id: "",
    quartier_id: "",
  });
  const [communes, setCommunes] = useState<any[]>([]);
  const [arrondissements, setArrondissements] = useState<any[]>([]);
  const [quartiers, setQuartiers] = useState<any[]>([]);

  async function load() {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v)
    );
    const { data } = await api.get("/reports", { params });
    setReports(data.data || data);
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
      if (filters.commune_id) {
        const { data } = await api.get("/zones", {
          params: { level: "arrondissement", parent_id: filters.commune_id },
        });
        setArrondissements(data);
        setQuartiers([]);
      } else {
        setArrondissements([]);
        setQuartiers([]);
      }
    })();
  }, [filters.commune_id]);

  useEffect(() => {
    (async () => {
      if (filters.arrondissement_id) {
        const { data } = await api.get("/zones", {
          params: { level: "quartier", parent_id: filters.arrondissement_id },
        });
        setQuartiers(data);
      } else {
        setQuartiers([]);
      }
    })();
  }, [filters.arrondissement_id]);

  useEffect(() => {
    load();
  }, [filters]);

  const isMobile = useIsMobile();

  const activeFiltersCount = useMemo(() => {
    const { q, ...rest } = filters;
    return Object.values(rest).filter(Boolean).length;
  }, [filters]);

  function StatusBadge({ value }: { value?: string }) {
    const map: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800 border-gray-200",
      pending_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
      assigned: "bg-sky-100 text-sky-800 border-sky-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return <Badge className={map[value || ""] || "bg-gray-100 text-gray-800 border-gray-200"}>{value || ""}</Badge>;
  }

  function CritBadge({ value }: { value?: string }) {
    const map: Record<string, string> = {
      faible: "bg-gray-100 text-gray-800 border-gray-200",
      moyenne: "bg-orange-100 text-orange-800 border-orange-200",
      haute: "bg-red-100 text-red-800 border-red-200",
    };
    return <Badge className={map[value || ""] || "bg-gray-100 text-gray-800 border-gray-200"}>{value || ""}</Badge>;
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-responsive-h2">Suivi des signalements</h2>
      </div>

      {/* Barre d'actions (mobile + desktop) */}
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
                      {["draft", "pending_review", "assigned", "resolved", "rejected"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filters.type_id} onValueChange={(v) => setFilters((f) => ({ ...f, type_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      {types.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filters.criticality} onValueChange={(v) => setFilters((f) => ({ ...f, criticality: v }))}>
                    <SelectTrigger><SelectValue placeholder="Criticité" /></SelectTrigger>
                    <SelectContent>
                      {["faible", "moyenne", "haute"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
                  <Input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
                  <Select value={filters.commune_id} onValueChange={(v) => setFilters((f) => ({ ...f, commune_id: v, arrondissement_id: "", quartier_id: "" }))}>
                    <SelectTrigger><SelectValue placeholder="Commune" /></SelectTrigger>
                    <SelectContent>
                      {communes.map((z) => (
                        <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filters.arrondissement_id} onValueChange={(v) => setFilters((f) => ({ ...f, arrondissement_id: v, quartier_id: "" }))}>
                    <SelectTrigger><SelectValue placeholder="Arrondissement" /></SelectTrigger>
                    <SelectContent>
                      {arrondissements.map((z) => (
                        <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filters.quartier_id} onValueChange={(v) => setFilters((f) => ({ ...f, quartier_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Quartier" /></SelectTrigger>
                    <SelectContent>
                      {quartiers.map((z) => (
                        <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </div>

        {/* Desktop filters visibles */}
        {!isMobile && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-full md:w-auto">
            <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
              <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                {["draft", "pending_review", "assigned", "resolved", "rejected"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.type_id} onValueChange={(v) => setFilters((f) => ({ ...f, type_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.criticality} onValueChange={(v) => setFilters((f) => ({ ...f, criticality: v }))}>
              <SelectTrigger><SelectValue placeholder="Criticité" /></SelectTrigger>
              <SelectContent>
                {["faible", "moyenne", "haute"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
              <Input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
            </div>
            <Select value={filters.commune_id} onValueChange={(v) => setFilters((f) => ({ ...f, commune_id: v, arrondissement_id: "", quartier_id: "" }))}>
              <SelectTrigger><SelectValue placeholder="Commune" /></SelectTrigger>
              <SelectContent>
                {communes.map((z) => (
                  <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.arrondissement_id} onValueChange={(v) => setFilters((f) => ({ ...f, arrondissement_id: v, quartier_id: "" }))}>
              <SelectTrigger><SelectValue placeholder="Arrondissement" /></SelectTrigger>
              <SelectContent>
                {arrondissements.map((z) => (
                  <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.quartier_id} onValueChange={(v) => setFilters((f) => ({ ...f, quartier_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Quartier" /></SelectTrigger>
              <SelectContent>
                {quartiers.map((z) => (
                  <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Liste des reports */}
      <div className="grid gap-2">
        {reports.map((r: any) => (
          <Link
            to={`/suivi/${r.id}`}
            key={r.id}
            className="border rounded-lg p-4 card-hover"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-medium text-gray-900">
                #{r.id} — {r.title || r.type?.name}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {r.criticality && <CritBadge value={r.criticality} />}
                {r.status && <StatusBadge value={r.status} />} 
              </div>
            </div>
            {r.description && (
              <div className="text-sm text-gray-700 mt-1">
                {String(r.description).slice(0, 120)}
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Actions d'export */}
      <div className="pt-2">
        <Button
          variant="outline"
          onClick={() =>
            window.open(
              `/api/exports/reports.geojson?${new URLSearchParams(
                Object.fromEntries(
                  Object.entries(filters).filter(([_, v]) => v)
                )
              ).toString()}`,
              "_blank"
            )
          }
          className="touch-target"
        >
          Exporter GeoJSON
        </Button>
      </div>
    </div>
  );
}