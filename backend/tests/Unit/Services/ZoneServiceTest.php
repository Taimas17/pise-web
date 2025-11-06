<?php

namespace Tests\Unit\Services;

use App\Services\ZoneService;
use Tests\TestCase;

class ZoneServiceTest extends TestCase
{
    public function test_service_resolves()
    {
        $svc = $this->app->make(ZoneService::class);
        $this->assertInstanceOf(ZoneService::class, $svc);
    }
}
