<?php

namespace App\Providers;

use App\Models\InfrastructureType;
use App\Models\Report;
use App\Models\Zone;
use App\Models\Chantier;
use App\Models\Lot;
use App\Models\Etape;
use App\Models\Expense;
use App\Policies\InfrastructureTypePolicy;
use App\Policies\ReportPolicy;
use App\Policies\ZonePolicy;
use App\Policies\ChantierPolicy;
use App\Policies\LotPolicy;
use App\Policies\EtapePolicy;
use App\Policies\ExpensePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Report::class => ReportPolicy::class,
        Zone::class => ZonePolicy::class,
        InfrastructureType::class => InfrastructureTypePolicy::class,
        Chantier::class => ChantierPolicy::class,
        Lot::class => LotPolicy::class,
        Etape::class => EtapePolicy::class,
        Expense::class => ExpensePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
