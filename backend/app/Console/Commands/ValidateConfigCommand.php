<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ValidateConfigCommand extends Command
{
    protected $signature = 'config:validate';
    protected $description = 'Validate critical configuration values';

    public function handle(): int
    {
        $errors = [];

        $origins = config('cors.allowed_origins');
        if (empty($origins) || in_array('*', $origins, true)) {
            $errors[] = 'CORS_ALLOWED_ORIGINS must be explicitly set (not wildcard)';
        }

        if (!config('app.key')) {
            $errors[] = 'APP_KEY not set';
        }

        if (!env('COLUMN_ENCRYPTION_KEY')) {
            $this->warn('COLUMN_ENCRYPTION_KEY not set - using APP_KEY (not recommended)');
        }

        if (config('database.default') === 'sqlite' && app()->environment('production')) {
            $errors[] = 'SQLite should not be used in production';
        }

        if (!empty($errors)) {
            foreach ($errors as $error) {
                $this->error($error);
            }
            return self::FAILURE;
        }

        $this->info('Configuration validation passed');
        return self::SUCCESS;
    }
}
