<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $this->authorize('stats', Report::class);
        $query = Report::query();
        if ($type = $request->input('type_id')) $query->where('infrastructure_type_id', $type);
        if ($status = $request->input('status')) $query->where('status', $status);
        if ($crit = $request->input('criticality')) $query->where('criticality', $crit);
        if ($zone = $request->input('zone_id')) $query->where('zone_id', $zone);
        if ($from = $request->input('from')) $query->whereDate('created_at', '>=', $from);
        if ($to = $request->input('to')) $query->whereDate('created_at', '<=', $to);

        $total = (clone $query)->count();
        $resolved = (clone $query)->where('status','resolved')->count();
        $resolution_rate = $total ? round(($resolved / $total) * 100, 2) : 0;

        $avg_resolution_seconds = (clone $query)
            ->whereNotNull('resolved_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(SECOND, submitted_at, resolved_at)) as avg_seconds')
            ->value('avg_seconds');
        $avg_resolution_hours = $avg_resolution_seconds ? round($avg_resolution_seconds / 3600, 2) : 0;

        $avg_review_seconds = (clone $query)
            ->whereNotNull('reviewed_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(SECOND, submitted_at, reviewed_at)) as avg_seconds')
            ->value('avg_seconds');
        $avg_review_hours = $avg_review_seconds ? round($avg_review_seconds / 3600, 2) : 0;

        $sla_total = (clone $query)->whereNotNull('resolved_at')->whereNotNull('sla_due_at')->count();
        $sla_ok = (clone $query)->whereNotNull('resolved_at')->whereNotNull('sla_due_at')->whereColumn('resolved_at','<=','sla_due_at')->count();
        $sla_compliance_rate = $sla_total ? round(($sla_ok / $sla_total) * 100, 2) : 0;

        $rev_total = (clone $query)->whereNotNull('reviewed_at')->whereNotNull('sla_review_due_at')->count();
        $rev_ok = (clone $query)->whereNotNull('reviewed_at')->whereNotNull('sla_review_due_at')->whereColumn('reviewed_at','<=','sla_review_due_at')->count();
        $review_sla_compliance_rate = $rev_total ? round(($rev_ok / $rev_total) * 100, 2) : 0;

        $by_type = (clone $query)
            ->selectRaw('infrastructure_type_id, COUNT(*) as count')
            ->groupBy('infrastructure_type_id')
            ->get();
        $by_crit = (clone $query)
            ->selectRaw('criticality, COUNT(*) as count')
            ->groupBy('criticality')
            ->get();
        $by_zone_level = [
            'commune' => DB::table('zones')->join('reports','zones.id','=','reports.zone_id')->where('zones.level','commune')->selectRaw('zones.id, zones.name, COUNT(reports.id) as count')->groupBy('zones.id','zones.name')->get(),
            'arrondissement' => DB::table('zones')->join('reports','zones.id','=','reports.zone_id')->where('zones.level','arrondissement')->selectRaw('zones.id, zones.name, COUNT(reports.id) as count')->groupBy('zones.id','zones.name')->get(),
            'quartier' => DB::table('zones')->join('reports','zones.id','=','reports.zone_id')->where('zones.level','quartier')->selectRaw('zones.id, zones.name, COUNT(reports.id) as count')->groupBy('zones.id','zones.name')->get(),
        ];

        $monthly_current = (clone $query)
            ->whereYear('created_at', now()->year)
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->groupBy('month')->orderBy('month')->get();
        $monthly_prev = (clone $query)
            ->whereYear('created_at', now()->subYear()->year)
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->groupBy('month')->orderBy('month')->get();
        $last7days = (clone $query)
            ->whereDate('created_at','>=', now()->subDays(6)->toDateString())
            ->selectRaw('DATE(created_at) as day, COUNT(*) as count')
            ->groupBy('day')->orderBy('day')->get();

        return response()->json([
            'total_reports' => $total,
            'resolved_reports' => $resolved,
            'resolution_rate' => $resolution_rate,
            'avg_resolution_hours' => $avg_resolution_hours,
            'avg_review_hours' => $avg_review_hours,
            'sla_compliance_rate' => $sla_compliance_rate,
            'review_sla_compliance_rate' => $review_sla_compliance_rate,
            'by_type' => $by_type,
            'by_criticality' => $by_crit,
            'by_zone' => $by_zone_level,
            'monthly_current' => $monthly_current,
            'monthly_previous' => $monthly_prev,
            'last7days' => $last7days,
        ]);
    }
}
