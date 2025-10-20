<?php

namespace App\Providers;

use App\Models\InfrastructureType;
use App\Models\Report;
use App\Models\Zone;
use App\Policies\InfrastructureTypePolicy;
use App\Policies\ReportPolicy;
use App\Policies\ZonePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Report::class => ReportPolicy::class,
        Zone::class => ZonePolicy::class,
        InfrastructureType::class => InfrastructureTypePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
