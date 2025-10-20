<?php

namespace App\Http\Controllers;

use App\Models\Report;
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
}
