<?php

namespace Tests\Feature;

use Tests\TestCase;

class PageRoutesTest extends TestCase
{
    public function test_dashboard_routes_are_available(): void
    {
        $response = $this->get('/dashboard');
        $response->assertStatus(200);

        $redirectResponse = $this->get('/dashboard.html');
        $redirectResponse->assertRedirect('/dashboard');
    }
}
