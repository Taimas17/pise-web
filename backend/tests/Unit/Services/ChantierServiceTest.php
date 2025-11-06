<?php

namespace Tests\Unit\Services;

use App\Services\ChantierService;
use Tests\TestCase;

class ChantierServiceTest extends TestCase
{
    public function test_service_resolves()
    {
        $svc = $this->app->make(ChantierService::class);
        $this->assertInstanceOf(ChantierService::class, $svc);
    }
}
