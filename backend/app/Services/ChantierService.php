<?php

namespace App\Services;

use App\Models\Chantier;
use Illuminate\Support\Facades\DB;

class ChantierService
{
    public function recalculateProgress(Chantier $chantier): Chantier
    {
        $progress = DB::table('lots')->where('chantier_id', $chantier->id)->avg('progress_pct');
        if ($progress === null) {
            $progress = DB::table('etapes')->where('chantier_id', $chantier->id)->avg('progress_pct');
        }
        $chantier->progress_pct = round((float) $progress, 2);
        $chantier->saveQuietly();
        return $chantier->fresh();
    }

    public function recalculateBudget(Chantier $chantier): Chantier
    {
        $sum = DB::table('expenses')->where('chantier_id', $chantier->id)->sum('amount');
        $chantier->budget_actual = $sum;
        $chantier->saveQuietly();
        return $chantier->fresh();
    }
}
