<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MetricsController extends Controller
{
    public function chantiers(Request $request)
    {
        $this->authorize('viewAny', Chantier::class);

        $q = Chantier::query();
        if ($v = $request->integer('infrastructure_type_id')) $q->where('infrastructure_type_id', $v);
        if ($v = $request->integer('zone_id')) $q->where('zone_id', $v);
        if ($v = $request->get('status')) $q->where('status', $v);
        if ($v = $request->integer('manager_user_id')) $q->where('manager_user_id', $v);
        if ($v = $request->date('from')) $q->whereDate('created_at', '>=', $v);
        if ($v = $request->date('to')) $q->whereDate('created_at', '<=', $v);

        $base = $q->clone();

        $total = (clone $base)->count();
        $inProgress = (clone $base)->where('status','in_progress')->count();
        $completed = (clone $base)->where('status','completed')->count();
        $avgProgress = (float) ((clone $base)->avg('progress_pct') ?? 0);
        $sumPlanned = (float) ((clone $base)->sum('budget_planned') ?? 0);
        $sumActual = (float) ((clone $base)->sum('budget_actual') ?? 0);
        $budgetExecution = $sumPlanned > 0 ? round($sumActual / $sumPlanned, 4) : 0;

        $svDays = (clone $base)
            ->selectRaw("AVG(TIMESTAMPDIFF(DAY, planned_end_at, COALESCE(actual_end_at, NOW()))) as avg_days")
            ->value('avg_days') ?? 0;

        $onTimeCount = (clone $base)->whereNotNull('actual_end_at')->whereColumn('actual_end_at','<=','planned_end_at')->count();
        $completedCount = (clone $base)->whereNotNull('actual_end_at')->count();
        $onTimeRate = $completedCount > 0 ? round($onTimeCount / $completedCount, 4) : 0;

        $budgetVarianceAvg = 0.0;
        if ($total > 0) {
            $budgetVarianceAvg = (float) DB::table('chantiers')
                ->whereIn('id', (clone $base)->pluck('id'))
                ->selectRaw('AVG((budget_actual - budget_planned)) as v')
                ->value('v') ?? 0.0;
        }

        $atRiskRate = 0.0;
        $atRiskCount = (clone $base)
            ->where('status','in_progress')
            ->where(function($qq){
                $qq->whereColumn('budget_actual','>=', DB::raw('0.9 * budget_planned'))
                   ->orWhereRaw('DATEDIFF(planned_end_at, NOW()) <= 7');
            })->count();
        $inProgTotal = (clone $base)->where('status','in_progress')->count();
        if ($inProgTotal > 0) $atRiskRate = round($atRiskCount / $inProgTotal, 4);

        $byType = (clone $base)
            ->selectRaw('infrastructure_type_id, COUNT(*) as count')
            ->groupBy('infrastructure_type_id')->get();
        $byZone = [
            'level1' => (clone $base)->selectRaw('zone_id as id, COUNT(*) as count')->groupBy('zone_id')->limit(50)->get(),
        ];
        $byStatus = (clone $base)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')->get();

        $monthlyCreated = (clone $base)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count")
            ->groupBy('month')->orderBy('month')->get();
        $monthlyCompleted = (clone $base)
            ->whereNotNull('actual_end_at')
            ->selectRaw("DATE_FORMAT(actual_end_at, '%Y-%m') as month, COUNT(*) as count")
            ->groupBy('month')->orderBy('month')->get();
        $weeklyAvgProgress = DB::table('chantiers')
            ->whereIn('id', (clone $base)->pluck('id'))
            ->selectRaw("YEARWEEK(updated_at, 1) as week, AVG(progress_pct) as avg_progress")
            ->groupBy('week')->orderBy('week','desc')->limit(8)->get()->reverse()->values();

        return response()->json([
            'total_chantiers' => $total,
            'in_progress' => $inProgress,
            'completed' => $completed,
            'average_progress_pct' => round($avgProgress, 2),
            'budget_execution_rate' => $budgetExecution,
            'schedule_variance_days' => (float) $svDays,
            'budget_variance_avg' => (float) $budgetVarianceAvg,
            'on_time_rate' => $onTimeRate,
            'at_risk_rate' => $atRiskRate,
            'by_type' => $byType,
            'by_zone' => $byZone,
            'by_status' => $byStatus,
            'monthly_created' => $monthlyCreated,
            'monthly_completed' => $monthlyCompleted,
            'weekly_avg_progress' => $weeklyAvgProgress,
        ]);
    }
}
