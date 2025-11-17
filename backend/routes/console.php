<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Planification des tâches automatiques (si les classes existent)
if (class_exists(\App\Console\Commands\PiiRetentionPurgeCommand::class)) {
    Schedule::command('pii:retention-purge')->monthlyOn(1, '3:00');
}
