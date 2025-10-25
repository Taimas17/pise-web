<?php

namespace App\Console\Commands;

use App\Models\Report;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PiiRetentionPurgeCommand extends Command
{
    protected $signature = 'pii:retention-purge';

    protected $description = 'Anonymiser les PII au-delà de la période de rétention';

    public function handle(): int
    {
        $months = (int) config('privacy.retention_months', 24);
        $threshold = Carbon::now()->subMonths($months);
        DB::transaction(function () use ($threshold) {
            Report::where('created_at', '<', $threshold)->update([
                'citizen_email_enc' => null,
                'citizen_phone_enc' => null,
                'location_precise_enc' => null,
            ]);
            User::where('created_at', '<', $threshold)->update([
                'phone_enc' => null,
            ]);
        });
        $this->info('Purge PII exécutée');
        return self::SUCCESS;
    }
}
