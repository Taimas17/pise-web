<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;
use App\Models\Lot;
use App\Models\Etape;
use App\Models\Expense;
use App\Observers\LotObserver;
use App\Observers\EtapeObserver;
use App\Observers\ExpenseObserver;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        RateLimiter::for('reports', function (Request $request) {
            return [
                Limit::perMinute((int) env('REPORTS_RATE_LIMIT_PER_MIN', 20))->by($request->ip()),
                Limit::perHour((int) env('REPORTS_RATE_LIMIT_PER_HOUR', 200))->by($request->ip()),
            ];
        });

        Lot::observe(LotObserver::class);
        Etape::observe(EtapeObserver::class);
        Expense::observe(ExpenseObserver::class);
    }
}
