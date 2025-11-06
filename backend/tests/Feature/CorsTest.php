<?php

namespace Tests\Feature;

use Tests\TestCase;

class CorsTest extends TestCase
{
    public function test_cors_configuration_is_restricted(): void
    {
        $methods = config('cors.allowed_methods');
        $headers = config('cors.allowed_headers');
        $origins = config('cors.allowed_origins');

        $this->assertIsArray($methods);
        $this->assertNotContains('*', $methods);
        $this->assertContains('GET', $methods);
        $this->assertContains('POST', $methods);

        $this->assertIsArray($headers);
        $this->assertNotContains('*', $headers);
        $this->assertContains('Authorization', $headers);
        $this->assertContains('Content-Type', $headers);

        $this->assertIsArray($origins);
        $this->assertNotContains('*', $origins);
    }
}
