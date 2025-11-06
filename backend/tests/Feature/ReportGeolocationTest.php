<?php

namespace Tests\Feature;

use App\Models\InfrastructureType;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ReportGeolocationTest extends TestCase
{
    public function test_submit_report_with_valid_coordinates(): void
    {
        $type = InfrastructureType::create(['name' => 'Route', 'slug' => 'route']);

        $resp = $this->postJson('/api/reports', [
            'infrastructure_type_id' => $type->id,
            'criticality' => 'moyenne',
            'lat' => 48.856613,
            'lng' => 2.352222,
            'public_location' => true,
        ]);
        $resp->assertStatus(201);
        $id = $resp->json('id');
        $row = DB::selectOne('SELECT ST_AsText(location) as wkt FROM reports WHERE id = ?', [$id]);
        $this->assertNotNull($row);
        $this->assertNotEmpty($row->wkt);
        $this->assertStringContainsString('POINT', $row->wkt);
    }

    public function test_submit_report_with_invalid_coordinates_is_rejected(): void
    {
        $type = InfrastructureType::create(['name' => 'Route', 'slug' => 'route']);
        $resp = $this->postJson('/api/reports', [
            'infrastructure_type_id' => $type->id,
            'criticality' => 'moyenne',
            'lat' => 91,
            'lng' => 181,
            'public_location' => true,
        ]);
        $resp->assertStatus(422);
    }

    public function test_injection_payload_in_coordinates_is_rejected(): void
    {
        $type = InfrastructureType::create(['name' => 'Route', 'slug' => 'route']);
        $resp = $this->postJson('/api/reports', [
            'infrastructure_type_id' => $type->id,
            'criticality' => 'moyenne',
            'lat' => '0); DROP TABLE users; --',
            'lng' => 0,
            'public_location' => true,
        ]);
        $resp->assertStatus(422);
    }
}
