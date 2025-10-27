<?php

namespace App\Http\Controllers;

use App\Models\FeatureFlag;
use App\Services\Analytics\AnalyticsService;
use App\Services\Analytics\SlaService;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(
        protected AnalyticsService $analytics,
        protected SlaService $sla
    ) {}

    protected function ensureEnabled()
    {
        $flag = FeatureFlag::where('key','sla_dashboard')->first();
        if ($flag && !$flag->enabled) {
            abort(403);
        }
    }

    public function overview(Request $request)
    {
        $this->authorize('stats', \App\Models\Report::class);
        $this->ensureEnabled();
        $params = $request->only(['from','to','zone_id','type_id','agent_id','criticality','status']);
        return response()->json($this->analytics->overview($params));
    }

    public function breakdown(Request $request)
    {
        $this->authorize('stats', \App\Models\Report::class);
        $this->ensureEnabled();
        $params = $request->only(['from','to','zone_id','type_id','agent_id','criticality','status','group_by']);
        return response()->json($this->analytics->breakdown($params));
    }

    public function trends(Request $request)
    {
        $this->authorize('stats', \App\Models\Report::class);
        $this->ensureEnabled();
        $params = $request->only(['from','to','zone_id','type_id','agent_id','criticality','status','interval']);
        return response()->json($this->analytics->trends($params));
    }

    public function slaSummary(Request $request)
    {
        $this->authorize('stats', \App\Models\Report::class);
        $this->ensureEnabled();
        $params = $request->only(['from','to','zone_id','type_id','agent_id','criticality','status']);
        return response()->json($this->sla->summary($params));
    }

    public function slaBreakdown(Request $request)
    {
        $this->authorize('stats', \App\Models\Report::class);
        $this->ensureEnabled();
        $params = $request->only(['from','to','zone_id','type_id','agent_id','criticality','status','group_by']);
        return response()->json($this->sla->breakdown($params));
    }
}
