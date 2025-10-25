<?php

namespace App\Observers;

use App\Models\Etape;
use Illuminate\Support\Facades\DB;

class EtapeObserver
{
    public function saved(Etape $etape): void { $this->recalc($etape->chantier_id); }
    public function deleted(Etape $etape): void { $this->recalc($etape->chantier_id); }

    protected function recalc(int $chantierId): void
    {
        $progress = DB::table('lots')->where('chantier_id', $chantierId)->avg('progress_pct');
        if ($progress === null) {
            $progress = DB::table('etapes')->where('chantier_id', $chantierId)->avg('progress_pct');
        }
        DB::table('chantiers')->where('id', $chantierId)->update(['progress_pct' => round((float)$progress, 2)]);
    }
}
