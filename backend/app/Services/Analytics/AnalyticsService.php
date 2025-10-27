<?php

namespace App\Services\Analytics;

use App\Models\Assignment;
use App\Models\InfrastructureType;
use App\Models\Report;
use App\Models\Zone;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    protected function key(string $name, array $params): string
    {
        ksort($params);
        $version = Cache::get('analytics_version', 1);
        return 'analytics:'.$version.':'.$name.':'.md5(json_encode($params));
    }

    public function overview(array $params): array
    {
        return Cache::remember($this->key('overview', $params), 300, function () use ($params) {
            $base = QueryFilters::apply(Report::query(), $params);

            $created = (clone $base)->count();
            $resolved = (clone $base)->where('status', 'resolved')->count();
            $rejected = (clone $base)->where('status', 'rejected')->count();
            $inProgress = (clone $base)->whereIn('status', ['pending_review','assigned'])->count();
            $backlog = (clone $base)->whereIn('status', ['draft','pending_review','assigned'])->count();

            $resTimes = (clone $base)
                ->whereNotNull('resolved_at')
                ->selectRaw('TIMESTAMPDIFF(SECOND, submitted_at, resolved_at) as seconds')
                ->pluck('seconds')
                ->filter(fn($v)=>$v!==null)
                ->values();

            $avg = $resTimes->count() ? round($resTimes->avg() / 3600, 2) : 0;
            $median = 0; $p90 = 0;
            if ($resTimes->count()) {
                $sorted = $resTimes->sort()->values();
                $n = $sorted->count();
                $median = round(($sorted[intval(floor(($n - 1) / 2))] + $sorted[intval(ceil(($n - 1) / 2))]) / 2 / 3600, 2);
                $p90 = round($sorted[intval(floor($n * 0.9))] / 3600, 2);
            }

            $reviewAvgSec = (clone $base)
                ->whereNotNull('reviewed_at')
                ->selectRaw('AVG(TIMESTAMPDIFF(SECOND, submitted_at, reviewed_at)) as s')
                ->value('s');
            $assignAvgSec = (clone $base)
                ->whereNotNull('assigned_at')
                ->selectRaw('AVG(TIMESTAMPDIFF(SECOND, COALESCE(reviewed_at, submitted_at), assigned_at)) as s')
                ->value('s');

            $now = now();
            $backlogAges = (clone $base)
                ->whereIn('status', ['draft','pending_review','assigned'])
                ->select('submitted_at')
                ->get()
                ->map(fn($r)=>$r->submitted_at ? $r->submitted_at->diffInHours($now) : null)
                ->filter()
                ->map(fn($h)=>[
                    'lt_24h' => $h < 24 ? 1 : 0,
                    'd1_3' => ($h >= 24 && $h < 72) ? 1 : 0,
                    'd3_7' => ($h >= 72 && $h < 168) ? 1 : 0,
                    'gt_7d' => $h >= 168 ? 1 : 0,
                ])
                ->reduce(fn($carry, $item)=>[
                    'lt_24h' => ($carry['lt_24h'] ?? 0) + $item['lt_24h'],
                    'd1_3' => ($carry['d1_3'] ?? 0) + $item['d1_3'],
                    'd3_7' => ($carry['d3_7'] ?? 0) + $item['d3_7'],
                    'gt_7d' => ($carry['gt_7d'] ?? 0) + $item['gt_7d'],
                ], ['lt_24h'=>0,'d1_3'=>0,'d3_7'=>0,'gt_7d'=>0]);

            return [
                'totals' => [
                    'created' => $created,
                    'in_progress' => $inProgress,
                    'resolved' => $resolved,
                    'rejected' => $rejected,
                    'backlog' => $backlog,
                ],
                'resolution' => [
                    'avg_hours' => $avg,
                    'median_hours' => $median,
                    'p90_hours' => $p90,
                ],
                'time_to_first_review_hours_avg' => $reviewAvgSec ? round($reviewAvgSec/3600,2) : 0,
                'time_to_assignment_hours_avg' => $assignAvgSec ? round($assignAvgSec/3600,2) : 0,
                'backlog_age_buckets' => $backlogAges,
            ];
        });
    }

    public function breakdown(array $params): array
    {
        $groupBy = $params['group_by'] ?? 'type';
        return Cache::remember($this->key('breakdown:'.$groupBy, $params), 300, function () use ($params, $groupBy) {
            $base = QueryFilters::apply(Report::query(), $params);

            if ($groupBy === 'type') {
                $rows = (clone $base)
                    ->select('infrastructure_type_id')
                    ->selectRaw('COUNT(*) as created')
                    ->selectRaw('SUM(CASE WHEN status = "resolved" THEN 1 ELSE 0 END) as resolved')
                    ->selectRaw('AVG(CASE WHEN resolved_at IS NOT NULL THEN TIMESTAMPDIFF(SECOND, submitted_at, resolved_at) END) as avg_seconds')
                    ->groupBy('infrastructure_type_id')
                    ->get();
                $types = InfrastructureType::whereIn('id', $rows->pluck('infrastructure_type_id'))->get()->keyBy('id');
                $data = $rows->map(function ($r) use ($types) {
                    $created = (int) $r->created;
                    $resolved = (int) $r->resolved;
                    $avg = $r->avg_seconds ? round($r->avg_seconds/3600,2) : 0;
                    $resolvedReports = Report::where('infrastructure_type_id', $r->infrastructure_type_id)
                        ->whereNotNull('resolved_at')
                        ->get(['criticality','submitted_at','resolved_at']);
                    $onTime = $resolvedReports->filter(function($x){
                        $target = config('sla.resolve_hours')[$x->criticality] ?? null;
                        if (!$target || !$x->submitted_at || !$x->resolved_at) return false;
                        return $x->submitted_at->diffInHours($x->resolved_at) <= $target;
                    })->count();
                    $rate = $resolved ? round($onTime/$resolved*100,2) : 0;
                    return [
                        'key' => ['id'=>$r->infrastructure_type_id, 'name'=>$types[$r->infrastructure_type_id]->name ?? 'Inconnu'],
                        'counts' => ['created'=>$created,'resolved'=>$resolved],
                        'resolution' => ['avg_hours'=>$avg],
                        'sla' => ['resolve_on_time_rate_pct'=>$rate],
                    ];
                })->values()->all();
                return $data;
            }

            if ($groupBy === 'zone') {
                $rows = (clone $base)
                    ->select('zone_id')
                    ->selectRaw('COUNT(*) as created')
                    ->selectRaw('SUM(CASE WHEN status = "resolved" THEN 1 ELSE 0 END) as resolved')
                    ->selectRaw('AVG(CASE WHEN resolved_at IS NOT NULL THEN TIMESTAMPDIFF(SECOND, submitted_at, resolved_at) END) as avg_seconds')
                    ->groupBy('zone_id')
                    ->get();
                $zones = Zone::whereIn('id', $rows->pluck('zone_id'))->get()->keyBy('id');
                return $rows->map(function($r) use ($zones){
                    $created = (int) $r->created;
                    $resolved = (int) $r->resolved;
                    $avg = $r->avg_seconds ? round($r->avg_seconds/3600,2) : 0;
                    $resolvedReports = Report::where('zone_id', $r->zone_id)
                        ->whereNotNull('resolved_at')
                        ->get(['criticality','submitted_at','resolved_at']);
                    $onTime = $resolvedReports->filter(function($x){
                        $target = config('sla.resolve_hours')[$x->criticality] ?? null;
                        if (!$target || !$x->submitted_at || !$x->resolved_at) return false;
                        return $x->submitted_at->diffInHours($x->resolved_at) <= $target;
                    })->count();
                    $rate = $resolved ? round($onTime/$resolved*100,2) : 0;
                    return [
                        'key' => ['id'=>$r->zone_id, 'name'=>$zones[$r->zone_id]->name ?? 'Sans zone'],
                        'counts' => ['created'=>$created,'resolved'=>$resolved],
                        'resolution' => ['avg_hours'=>$avg],
                        'sla' => ['resolve_on_time_rate_pct'=>$rate],
                    ];
                })->values()->all();
            }

            $rows = Assignment::query()
                ->join('reports','reports.id','=','assignments.report_id')
                ->when(!empty($params['from']), fn($q)=>$q->whereDate('reports.created_at','>=',$params['from']))
                ->when(!empty($params['to']), fn($q)=>$q->whereDate('reports.created_at','<=',$params['to']))
                ->when(!empty($params['type_id']), fn($q)=>$q->where('reports.infrastructure_type_id',$params['type_id']))
                ->when(!empty($params['status']), fn($q)=>$q->where('reports.status',$params['status']))
                ->when(!empty($params['criticality']), fn($q)=>$q->where('reports.criticality',$params['criticality']))
                ->when(!empty($params['zone_id']), fn($q)=>$q->where('reports.zone_id',$params['zone_id']))
                ->select('assignments.assigned_to_user_id')
                ->selectRaw('COUNT(DISTINCT reports.id) as created')
                ->selectRaw('SUM(CASE WHEN reports.status = "resolved" THEN 1 ELSE 0 END) as resolved')
                ->selectRaw('AVG(CASE WHEN reports.resolved_at IS NOT NULL THEN TIMESTAMPDIFF(SECOND, reports.submitted_at, reports.resolved_at) END) as avg_seconds')
                ->groupBy('assignments.assigned_to_user_id')
                ->get();
            $userIds = $rows->pluck('assigned_to_user_id')->filter()->unique()->values();
            $names = DB::table('users')->whereIn('id', $userIds)->pluck('name','id');
            return $rows->map(function($r) use ($names){
                $created = (int) $r->created;
                $resolved = (int) $r->resolved;
                $avg = $r->avg_seconds ? round($r->avg_seconds/3600,2) : 0;
                $resolvedReports = Report::whereHas('assignments', function($q) use ($r){
                        $q->where('assigned_to_user_id', $r->assigned_to_user_id);
                    })
                    ->whereNotNull('resolved_at')
                    ->get(['criticality','submitted_at','resolved_at']);
                $onTime = $resolvedReports->filter(function($x){
                    $target = config('sla.resolve_hours')[$x->criticality] ?? null;
                    if (!$target || !$x->submitted_at || !$x->resolved_at) return false;
                    return $x->submitted_at->diffInHours($x->resolved_at) <= $target;
                })->count();
                $rate = $resolved ? round($onTime/$resolved*100,2) : 0;
                return [
                    'key' => ['id'=>$r->assigned_to_user_id, 'name'=>$names[$r->assigned_to_user_id] ?? 'Agent '.$r->assigned_to_user_id],
                    'counts' => ['created'=>$created,'resolved'=>$resolved],
                    'resolution' => ['avg_hours'=>$avg],
                    'sla' => ['resolve_on_time_rate_pct'=>$rate],
                ];
            })->values()->all();
        });
    }

    public function trends(array $params): array
    {
        $interval = $params['interval'] ?? 'daily';
        return Cache::remember($this->key('trends:'.$interval, $params), 300, function () use ($params, $interval) {
            $base = QueryFilters::apply(Report::query(), $params);
            $format = '%Y-%m-%d';
            if ($interval === 'weekly') $format = '%x-%v-1';
            if ($interval === 'monthly') $format = '%Y-%m-01';

            $created = (clone $base)
                ->selectRaw('DATE_FORMAT(created_at, "'.$format.'") as d, COUNT(*) as c')
                ->groupBy('d')
                ->orderBy('d')
                ->pluck('c','d');

            $resolved = QueryFilters::apply(Report::query(), $params)
                ->whereNotNull('resolved_at')
                ->selectRaw('DATE_FORMAT(resolved_at, "'.$format.'") as d, COUNT(*) as c')
                ->groupBy('d')
                ->orderBy('d')
                ->pluck('c','d');

            $dates = collect($created->keys())->merge($resolved->keys())->unique()->sort()->values();

            $series = $dates->map(function ($d) use ($created, $resolved) {
                $c = (int) ($created[$d] ?? 0);
                $r = (int) ($resolved[$d] ?? 0);
                $backlog = 0;
                $end = $d;
                $backlog = Report::query()
                    ->when(true, function($q) use ($end){
                        $q->whereDate('created_at','<=',$end)
                          ->where(function($q2) use ($end){
                              $q2->whereNull('resolved_at')->orWhereDate('resolved_at','>',$end);
                          });
                    })
                    ->count();
                return ['date'=>$d,'created'=>$c,'resolved'=>$r,'backlog'=>$backlog];
            })->values()->all();

            $compliance = $dates->map(function($d){
                $resolvedReports = Report::whereNotNull('resolved_at')
                    ->whereDate('resolved_at', $d)
                    ->get(['criticality','submitted_at','resolved_at']);
                $total = $resolvedReports->count();
                $onTime = $resolvedReports->filter(function($x){
                    $target = config('sla.resolve_hours')[$x->criticality] ?? null;
                    if (!$target || !$x->submitted_at || !$x->resolved_at) return false;
                    return $x->submitted_at->diffInHours($x->resolved_at) <= $target;
                })->count();
                return ['date'=>$d,'resolve_on_time_rate_pct'=>$total?round($onTime/$total*100,2):0];
            })->values()->all();

            return ['series'=>$series,'sla_compliance_series'=>$compliance];
        });
    }
}
