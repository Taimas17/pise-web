<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
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

        $monthly = (clone $query)
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'total_reports' => $total,
            'resolved_reports' => $resolved,
            'resolution_rate' => $resolution_rate,
            'avg_resolution_hours' => $avg_resolution_hours,
            'monthly_frequency' => $monthly,
        ]);
    }
}
