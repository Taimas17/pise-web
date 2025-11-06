<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Route::middleware('role:admin')->get('/test-role', fn () => 'ok');
    }

    public function test_denies_unauthenticated(): void
    {
        $response = $this->get('/test-role');
        $response->assertStatus(401);
    }

    public function test_denies_non_admin(): void
    {
        $user = User::factory()->make(['role' => 'agent']);
        $this->actingAs($user);
        $response = $this->get('/test-role');
        $response->assertStatus(403);
    }

    public function test_allows_admin(): void
    {
        $user = User::factory()->make(['role' => 'admin']);
        $this->actingAs($user);
        $response = $this->get('/test-role');
        $response->assertOk();
    }
}
