<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
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
        // Force HTTPS scheme in production so all generated URLs use https://
        // and Sanctum/session cookies are issued with the Secure flag.
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        RateLimiter::for('reports', function (Request $request) {
            return [
                Limit::perMinute((int) env('REPORTS_RATE_LIMIT_PER_MIN', 20))->by($request->ip()),
                Limit::perHour((int) env('REPORTS_RATE_LIMIT_PER_HOUR', 200))->by($request->ip()),
            ];
        });

        Lot::observe(LotObserver::class);
        Etape::observe(EtapeObserver::class);
        Expense::observe(ExpenseObserver::class);

        // Ensure exceptions for API routes are returned as JSON instead of attempting
        // a redirect to a named 'login' route (which may be absent for API-only setups).
        if ($this->app->bound(\Illuminate\Foundation\Exceptions\Handler::class)) {
            $this->app->make(\Illuminate\Foundation\Exceptions\Handler::class)
                ->shouldRenderJsonWhen(function ($request, $e) {
                    return $request->is('api/*') || $request->expectsJson();
                });
        }
    }
}
