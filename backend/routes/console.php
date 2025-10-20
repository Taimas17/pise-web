<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

if (class_exists(\App\Console\Commands\KoboSyncCommand::class)) {
    Artisan::resolve(\App\Console\Commands\KoboSyncCommand::class);
}
