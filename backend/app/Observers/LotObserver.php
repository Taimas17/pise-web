<?php

namespace App\Observers;

use App\Models\Lot;
use Illuminate\Support\Facades\DB;

class LotObserver
{
    public function saved(Lot $lot): void { $this->recalc($lot->chantier_id); }
    public function deleted(Lot $lot): void { $this->recalc($lot->chantier_id); }

    protected function recalc(int $chantierId): void
    {
        $progress = DB::table('lots')->where('chantier_id', $chantierId)->avg('progress_pct');
        if ($progress === null) {
            $progress = DB::table('etapes')->where('chantier_id', $chantierId)->avg('progress_pct');
        }
        DB::table('chantiers')->where('id', $chantierId)->update(['progress_pct' => round((float)$progress, 2)]);
    }
}
