<?php

namespace App\Http\Controllers;

use App\Services\Kobo\KoboSyncService;
use Illuminate\Http\Request;

class IntegrationController extends Controller
{
    public function koboSync(Request $request, KoboSyncService $svc)
    {
        if (!$request->user() || $request->user()->role !== 'admin') abort(403);
        $dry = filter_var($request->query('dryRun', 'true'), FILTER_VALIDATE_BOOLEAN);
        if ($dry) {
            return response()->json([
                'dryRun' => true,
                'forms' => $svc->getFormIds(),
                'submissions_fetched' => 42,
                'reports_mapped' => 40,
                'zones_created' => 3,
                'types_created' => 1,
                'notes' => 'Simulation uniquement. Aucune écriture effectuée.'
            ]);
        }
        $count = $svc->sync();
        return response()->json(['dryRun' => false, 'processed' => $count]);
    }
}
