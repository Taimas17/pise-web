<?php

namespace Tests\Feature;

use App\Models\User;
use App\Policies\UserPolicy;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    public function test_user_policy_rules(): void
    {
        $policy = new UserPolicy();

        $admin = User::factory()->make(['id' => 1, 'role' => 'admin']);
        $agent = User::factory()->make(['id' => 2, 'role' => 'agent']);
        $citizen = User::factory()->make(['id' => 3, 'role' => 'citizen']);

        $this->assertTrue($policy->viewAny($admin));
        $this->assertFalse($policy->viewAny($agent));

        $this->assertTrue($policy->view($admin, $agent));
        $this->assertTrue($policy->view($agent, $agent));
        $this->assertFalse($policy->view($agent, $citizen));

        $this->assertTrue($policy->create($admin));
        $this->assertFalse($policy->create($agent));

        $this->assertTrue($policy->update($admin, $agent));
        $this->assertTrue($policy->update($agent, $agent));
        $this->assertFalse($policy->update($agent, $admin));

        $this->assertTrue($policy->delete($admin, $agent));
        $this->assertFalse($policy->delete($admin, $admin));
        $this->assertFalse($policy->delete($agent, $citizen));
    }
}
