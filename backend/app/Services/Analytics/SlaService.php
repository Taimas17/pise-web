<?php

namespace App\Services\Analytics;

use App\Models\Report;
use Illuminate\Support\Facades\Cache;

class SlaService
{
    protected function key(string $name, array $params): string
    {
        ksort($params);
        $version = Cache::get('analytics_version', 1);
        return 'sla:'.$version.':'.$name.':'.md5(json_encode($params));
    }

    public function summary(array $params): array
    {
        return Cache::remember($this->key('summary', $params), 300, function () use ($params) {
            $base = QueryFilters::apply(Report::query(), $params);

            $targets = [
                'review_hours' => config('sla.review_hours'),
                'assign_hours' => config('sla.assign_hours'),
                'resolve_hours' => config('sla.resolve_hours'),
            ];

            $reports = (clone $base)->get(['criticality','submitted_at','reviewed_at','assigned_at','resolved_at']);

            $review = $this->computeCompliance($reports, function($r){
                if (!$r->submitted_at || !$r->reviewed_at) return null;
                return $r->submitted_at->diffInHours($r->reviewed_at);
            }, fn($r)=>config('sla.review_hours')[$r->criticality] ?? null);

            $assign = $this->computeCompliance($reports, function($r){
                if (!$r->assigned_at) return null;
                $start = $r->reviewed_at ?: $r->submitted_at;
                if (!$start) return null;
                return $start->diffInHours($r->assigned_at);
            }, fn($r)=>config('sla.assign_hours')[$r->criticality] ?? null);

            $resolve = $this->computeCompliance($reports, function($r){
                if (!$r->submitted_at || !$r->resolved_at) return null;
                return $r->submitted_at->diffInHours($r->resolved_at);
            }, fn($r)=>config('sla.resolve_hours')[$r->criticality] ?? null);

            return [
                'targets' => $targets,
                'compliance' => [
                    'review' => $review,
                    'assign' => $assign,
                    'resolve' => $resolve,
                ],
            ];
        });
    }

    public function breakdown(array $params): array
    {
        $groupBy = $params['group_by'] ?? 'type';
        return Cache::remember($this->key('breakdown:'.$groupBy, $params), 300, function () use ($params, $groupBy) {
            $base = QueryFilters::apply(Report::query(), $params);

            if ($groupBy === 'type') {
                $groups = (clone $base)->select('infrastructure_type_id as id')->groupBy('infrastructure_type_id')->pluck('id');
                $names = \App\Models\InfrastructureType::whereIn('id',$groups)->pluck('name','id');
                return $groups->map(function($id) use ($names, $base){
                    $reports = (clone $base)->where('infrastructure_type_id',$id)->get(['criticality','submitted_at','reviewed_at','assigned_at','resolved_at']);
                    $review = $this->computeCompliance($reports, function($r){ if(!$r->submitted_at||!$r->reviewed_at)return null; return $r->submitted_at->diffInHours($r->reviewed_at); }, fn($r)=>config('sla.review_hours')[$r->criticality]??null);
                    $assign = $this->computeCompliance($reports, function($r){ if(!$r->assigned_at)return null; $s=$r->reviewed_at?:$r->submitted_at; if(!$s)return null; return $s->diffInHours($r->assigned_at); }, fn($r)=>config('sla.assign_hours')[$r->criticality]??null);
                    $resolve = $this->computeCompliance($reports, function($r){ if(!$r->submitted_at||!$r->resolved_at)return null; return $r->submitted_at->diffInHours($r->resolved_at); }, fn($r)=>config('sla.resolve_hours')[$r->criticality]??null);
                    return [
                        'key' => ['id'=>$id,'name'=>$names[$id]??'Inconnu'],
                        'review_on_time_pct' => $review['on_time_pct'],
                        'assign_on_time_pct' => $assign['on_time_pct'],
                        'resolve_on_time_pct' => $resolve['on_time_pct'],
                        'breaches' => $review['breaches'] + $assign['breaches'] + $resolve['breaches'],
                    ];
                })->values()->all();
            }

            if ($groupBy === 'zone') {
                $groups = (clone $base)->select('zone_id as id')->groupBy('zone_id')->pluck('id');
                $names = \App\Models\Zone::whereIn('id',$groups)->pluck('name','id');
                return $groups->map(function($id) use ($names, $base){
                    $reports = (clone $base)->where('zone_id',$id)->get(['criticality','submitted_at','reviewed_at','assigned_at','resolved_at']);
                    $review = $this->computeCompliance($reports, function($r){ if(!$r->submitted_at||!$r->reviewed_at)return null; return $r->submitted_at->diffInHours($r->reviewed_at); }, fn($r)=>config('sla.review_hours')[$r->criticality]??null);
                    $assign = $this->computeCompliance($reports, function($r){ if(!$r->assigned_at)return null; $s=$r->reviewed_at?:$r->submitted_at; if(!$s)return null; return $s->diffInHours($r->assigned_at); }, fn($r)=>config('sla.assign_hours')[$r->criticality]??null);
                    $resolve = $this->computeCompliance($reports, function($r){ if(!$r->submitted_at||!$r->resolved_at)return null; return $r->submitted_at->diffInHours($r->resolved_at); }, fn($r)=>config('sla.resolve_hours')[$r->criticality]??null);
                    return [
                        'key' => ['id'=>$id,'name'=>$names[$id]??'Sans zone'],
                        'review_on_time_pct' => $review['on_time_pct'],
                        'assign_on_time_pct' => $assign['on_time_pct'],
                        'resolve_on_time_pct' => $resolve['on_time_pct'],
                        'breaches' => $review['breaches'] + $assign['breaches'] + $resolve['breaches'],
                    ];
                })->values()->all();
            }

            $groups = \App\Models\Assignment::query()
                ->join('reports','reports.id','=','assignments.report_id')
                ->when(!empty($params['from']), fn($q)=>$q->whereDate('reports.created_at','>=',$params['from']))
                ->when(!empty($params['to']), fn($q)=>$q->whereDate('reports.created_at','<=',$params['to']))
                ->when(!empty($params['type_id']), fn($q)=>$q->where('reports.infrastructure_type_id',$params['type_id']))
                ->when(!empty($params['status']), fn($q)=>$q->where('reports.status',$params['status']))
                ->when(!empty($params['criticality']), fn($q)=>$q->where('reports.criticality',$params['criticality']))
                ->when(!empty($params['zone_id']), fn($q)=>$q->where('reports.zone_id',$params['zone_id']))
                ->select('assignments.assigned_to_user_id as id')
                ->groupBy('assignments.assigned_to_user_id')
                ->pluck('id');
            $names = \Illuminate\Support\Facades\DB::table('users')->whereIn('id',$groups)->pluck('name','id');
            return $groups->map(function($id) use ($names, $params){
                $reports = Report::query()
                    ->when(!empty($params['from']), fn($q)=>$q->whereDate('created_at','>=',$params['from']))
                    ->when(!empty($params['to']), fn($q)=>$q->whereDate('created_at','<=',$params['to']))
                    ->when(!empty($params['type_id']), fn($q)=>$q->where('infrastructure_type_id',$params['type_id']))
                    ->when(!empty($params['status']), fn($q)=>$q->where('status',$params['status']))
                    ->when(!empty($params['criticality']), fn($q)=>$q->where('criticality',$params['criticality']))
                    ->when(!empty($params['zone_id']), fn($q)=>$q->where('zone_id',$params['zone_id']))
                    ->whereHas('assignments', fn($q)=>$q->where('assigned_to_user_id',$id))
                    ->get(['criticality','submitted_at','reviewed_at','assigned_at','resolved_at']);
                $review = $this->computeCompliance($reports, function($r){ if(!$r->submitted_at||!$r->reviewed_at)return null; return $r->submitted_at->diffInHours($r->reviewed_at); }, fn($r)=>config('sla.review_hours')[$r->criticality]??null);
                $assign = $this->computeCompliance($reports, function($r){ if(!$r->assigned_at)return null; $s=$r->reviewed_at?:$r->submitted_at; if(!$s)return null; return $s->diffInHours($r->assigned_at); }, fn($r)=>config('sla.assign_hours')[$r->criticality]??null);
                $resolve = $this->computeCompliance($reports, function($r){ if(!$r->submitted_at||!$r->resolved_at)return null; return $r->submitted_at->diffInHours($r->resolved_at); }, fn($r)=>config('sla.resolve_hours')[$r->criticality]??null);
                return [
                    'key' => ['id'=>$id,'name'=>$names[$id]??('Agent '.$id)],
                    'review_on_time_pct' => $review['on_time_pct'],
                    'assign_on_time_pct' => $assign['on_time_pct'],
                    'resolve_on_time_pct' => $resolve['on_time_pct'],
                    'breaches' => $review['breaches'] + $assign['breaches'] + $resolve['breaches'],
                ];
            })->values()->all();
        });
    }

    protected function computeCompliance($reports, $durationFn, $targetFn): array
    {
        $durations = [];
        $breaches = 0;
        $lateness = [];
        foreach ($reports as $r) {
            $d = $durationFn($r);
            $t = $targetFn($r);
            if ($d === null || $t === null) continue;
            $durations[] = $d;
            if ($d > $t) {
                $breaches++;
                $lateness[] = $d - $t;
            }
        }
        $n = count($durations);
        $onTime = $n ? ($n - $breaches) : 0;
        return [
            'on_time_pct' => $n ? round($onTime / $n * 100, 2) : 0,
            'breaches' => $breaches,
            'avg_lateness_hours' => count($lateness) ? round(array_sum($lateness) / count($lateness), 2) : 0,
        ];
    }
}
