import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

export type Filters = {
  from?: string;
  to?: string;
  zone_id?: number;
  type_id?: number;
  agent_id?: number;
  criticality?: "faible" | "moyenne" | "haute";
  status?: "draft" | "pending_review" | "assigned" | "resolved" | "rejected";
  interval?: "daily" | "weekly" | "monthly";
};

export function useStats(filters: Filters) {
  const [overview, setOverview] = useState<any>(null);
  const [breakdownType, setBreakdownType] = useState<any[]>([]);
  const [breakdownZone, setBreakdownZone] = useState<any[]>([]);
  const [breakdownAgent, setBreakdownAgent] = useState<any[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [slaSummary, setSlaSummary] = useState<any>(null);
  const [slaBreakdownType, setSlaBreakdownType] = useState<any[]>([]);
  const [slaBreakdownZone, setSlaBreakdownZone] = useState<any[]>([]);
  const [slaBreakdownAgent, setSlaBreakdownAgent] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError(null);
      const params: any = { ...filters };
      try {
        const [ov, bt, bz, ba, tr, sl, sBt, sBz, sBa] = await Promise.all([
          api.get('/reports/stats/overview', { params }),
          api.get('/reports/stats/breakdown', { params: { ...params, group_by: 'type' } }),
          api.get('/reports/stats/breakdown', { params: { ...params, group_by: 'zone' } }),
          api.get('/reports/stats/breakdown', { params: { ...params, group_by: 'agent' } }),
          api.get('/reports/stats/trends', { params: { ...params, interval: params.interval || 'daily' } }),
          api.get('/reports/sla/summary', { params }),
          api.get('/reports/sla/breakdown', { params: { ...params, group_by: 'type' } }),
          api.get('/reports/sla/breakdown', { params: { ...params, group_by: 'zone' } }),
          api.get('/reports/sla/breakdown', { params: { ...params, group_by: 'agent' } }),
        ]);
        if (cancelled) return;
        setOverview(ov.data);
        setBreakdownType(bt.data);
        setBreakdownZone(bz.data);
        setBreakdownAgent(ba.data);
        setTrends(tr.data);
        setSlaSummary(sl.data);
        setSlaBreakdownType(sBt.data);
        setSlaBreakdownZone(sBz.data);
        setSlaBreakdownAgent(sBa.data);
      } catch (e: any) {
        if (!cancelled) setError('Erreur de chargement des statistiques');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [JSON.stringify(filters)]);

  const agentsOptions = useMemo(() => {
    return breakdownAgent.map((b: any) => ({ value: b.key.id, label: b.key.name }));
  }, [breakdownAgent]);

  return { overview, breakdownType, breakdownZone, breakdownAgent, trends, slaSummary, slaBreakdownType, slaBreakdownZone, slaBreakdownAgent, agentsOptions, loading, error };
}
