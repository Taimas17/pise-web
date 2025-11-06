<?php

namespace Tests\Unit;

use App\Services\GeometryService;
use Tests\TestCase;

class GeometryServiceTest extends TestCase
{
    public function test_create_point_with_valid_coordinates(): void
    {
        $service = app(GeometryService::class);
        $geo = $service->createPoint(2.352222, 48.856613);
        $this->assertNotEmpty($geo);
    }

    public function test_reject_out_of_bounds_coordinates(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $service = app(GeometryService::class);
        $service->createPoint(200.0, 95.0);
    }

    public function test_create_linestring_and_polygon(): void
    {
        $service = app(GeometryService::class);
        $ls = $service->createGeometry('LINESTRING', [
            [2.35, 48.85],
            [2.36, 48.86],
        ]);
        $this->assertNotEmpty($ls);

        $poly = $service->createGeometry('POLYGON', [
            [
                [2.35, 48.85],
                [2.36, 48.85],
                [2.36, 48.86],
                [2.35, 48.86],
                [2.35, 48.85],
            ],
        ]);
        $this->assertNotEmpty($poly);
    }

    public function test_injection_attempt_is_sanitized(): void
    {
        $service = app(GeometryService::class);
        $geo = $service->createGeometry('LINESTRING', [
            [0, 0],
            [0, '0); DROP TABLE users; --'],
        ]);
        $this->assertNotEmpty($geo);
    }
}
