<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ReportsExport;

class ExportController extends Controller
{
    protected function filteredReports(Request $request)
    {
        $query = Report::with(['type','zone']);
        if ($type = $request->input('type_id')) $query->where('infrastructure_type_id', $type);
        if ($status = $request->input('status')) $query->where('status', $status);
        if ($crit = $request->input('criticality')) $query->where('criticality', $crit);
        if ($zone = $request->input('zone_id')) $query->where('zone_id', $zone);
        if ($from = $request->input('from')) $query->whereDate('created_at', '>=', $from);
        if ($to = $request->input('to')) $query->whereDate('created_at', '<=', $to);
        return $query->orderByDesc('id')->get();
    }

    public function reportsPdf(Request $request)
    {
        $reports = $this->filteredReports($request);
        $pdf = Pdf::loadView('exports.reports', ['reports' => $reports]);
        return $pdf->download('reports.pdf');
    }

    public function reportsExcel(Request $request)
    {
        $reports = $this->filteredReports($request);
        return Excel::download(new ReportsExport($reports), 'reports.xlsx');
    }

    public function reportsGeojson(Request $request)
    {
        $reports = $this->filteredReports($request);
        $features = [];
        foreach ($reports as $r) {
            $lat = $r->lat_masked !== null ? round((float)$r->lat_masked, (int)config('privacy.precision_mask',3)) : null;
            $lng = $r->lng_masked !== null ? round((float)$r->lng_masked, (int)config('privacy.precision_mask',3)) : null;
            if ($lat === null || $lng === null) continue;
            $sla = null;
            if ($r->resolved_at && $r->sla_due_at) $sla = $r->resolved_at->gt($r->sla_due_at) ? 'late' : 'on_time';
            $features[] = [
                'type' => 'Feature',
                'geometry' => ['type' => 'Point', 'coordinates' => [$lng,$lat]],
                'properties' => [
                    'id' => $r->id,
                    'title' => $r->title,
                    'type_id' => $r->infrastructure_type_id,
                    'type_name' => optional($r->type)->name,
                    'status' => $r->status,
                    'criticality' => $r->criticality,
                    'created_at' => optional($r->created_at)?->toIso8601String(),
                    'resolved_at' => optional($r->resolved_at)?->toIso8601String(),
                    'zone_path' => $this->zonePath($r),
                    'sla_status' => $sla,
                    'assignee_id' => optional($r->assignments()->latest('assigned_at')->first())->assigned_to_user_id,
                    'assignee_name' => null,
                    'external_ticket_ref' => null,
                ],
            ];
        }
        return response()->json(['type' => 'FeatureCollection', 'features' => $features]);
    }

    private function zonePath(Report $r): ?string
    {
        $zone = $r->zone;
        if (!$zone) return null;
        $names = [];
        $current = $zone;
        while ($current) { $names[] = $current->name; $current = $current->parent; }
        return implode('>', array_reverse($names));
    }
}
