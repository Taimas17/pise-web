<?php

namespace Tests\Feature\Analytics;

use App\Models\InfrastructureType;
use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BreakdownTest extends TestCase
{
    use RefreshDatabase;

    public function test_breakdown_by_type()
    {
        $user = User::factory()->create(['role'=>'admin']);
        $this->actingAs($user);
        $t1 = InfrastructureType::factory()->create();
        $t2 = InfrastructureType::factory()->create();
        Report::factory()->create(['infrastructure_type_id'=>$t1->id,'status'=>'resolved','submitted_at'=>now()->subHours(5),'resolved_at'=>now()]);
        Report::factory()->create(['infrastructure_type_id'=>$t2->id,'status'=>'draft']);
        $res = $this->getJson('/api/reports/stats/breakdown?group_by=type')->json();
        $this->assertIsArray($res);
        $this->assertNotEmpty($res);
    }
}
