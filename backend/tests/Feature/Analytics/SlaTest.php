<?php

namespace Tests\Feature\Analytics;

use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class SlaTest extends TestCase
{
    use RefreshDatabase;

    public function test_resolve_compliance_basic()
    {
        Config::set('sla.resolve_hours', ['faible'=>48,'moyenne'=>24,'haute'=>8]);
        $user = User::factory()->create(['role'=>'admin']);
        $this->actingAs($user);
        $r1 = Report::factory()->create([
            'criticality'=>'faible','status'=>'resolved',
            'submitted_at'=>now()->subHours(10),'resolved_at'=>now()
        ]);
        $r2 = Report::factory()->create([
            'criticality'=>'haute','status'=>'resolved',
            'submitted_at'=>now()->subHours(30),'resolved_at'=>now()
        ]);
        $res = $this->getJson('/api/reports/sla/summary')->json();
        $this->assertEquals(50.0, $res['compliance']['resolve']['on_time_pct']);
        $this->assertEquals(1, $res['compliance']['resolve']['breaches']);
    }

    public function test_review_and_assign_computation_with_nulls()
    {
        $user = User::factory()->create(['role'=>'admin']);
        $this->actingAs($user);
        Report::factory()->create(['criticality'=>'moyenne','submitted_at'=>now()->subHours(10),'reviewed_at'=>now()->subHours(5)]);
        Report::factory()->create(['criticality'=>'moyenne','submitted_at'=>now()->subHours(20),'reviewed_at'=>null]);
        Report::factory()->create(['criticality'=>'moyenne','submitted_at'=>now()->subHours(30),'reviewed_at'=>now()->subHours(10),'assigned_at'=>now()->subHours(2)]);
        $res = $this->getJson('/api/reports/sla/summary')->json();
        $this->assertArrayHasKey('review', $res['compliance']);
        $this->assertArrayHasKey('assign', $res['compliance']);
    }
}
