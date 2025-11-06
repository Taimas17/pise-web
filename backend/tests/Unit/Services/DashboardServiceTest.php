<?php

namespace Tests\Unit\Services;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Tests\TestCase;

class DashboardServiceTest extends TestCase
{
    public function test_service_resolves()
    {
        $svc = $this->app->make(DashboardService::class);
        $this->assertInstanceOf(DashboardService::class, $svc);
    }

    public function test_get_stats_returns_array()
    {
        $svc = $this->app->make(DashboardService::class);
        $stats = $svc->getStats(new Request());
        $this->assertIsArray($stats);
        $this->assertArrayHasKey('total_reports', $stats);
    }
}
