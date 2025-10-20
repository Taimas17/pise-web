<?php

namespace App\Console\Commands;

use App\Jobs\ImportKoboSubmissions;
use Illuminate\Console\Command;

class KoboSyncCommand extends Command
{
    protected $signature = 'kobo:sync';

    protected $description = 'Synchroniser les soumissions Kobo (stub)';

    public function handle(): int
    {
        ImportKoboSubmissions::dispatch();
        $this->info('Job ImportKoboSubmissions dispatché');
        return self::SUCCESS;
    }
}
