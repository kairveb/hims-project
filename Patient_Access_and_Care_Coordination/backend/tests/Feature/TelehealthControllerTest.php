<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TelehealthControllerTest extends TestCase
{
    public function test_start_room_returns_service_unavailable_when_daily_key_is_missing(): void
    {
        config()->set('services.daily.api_key', null);

        Http::fake([
            'https://api.daily.co/v1/rooms' => Http::response(['message' => 'unauthorized'], 401),
        ]);

        $response = $this->getJson('/api/telehealth/start-room');

        $response->assertStatus(503)
            ->assertJson(['message' => 'Telehealth service is not configured.']);
    }
}
