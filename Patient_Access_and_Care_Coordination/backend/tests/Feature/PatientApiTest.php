<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatientApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_can_be_created_via_singular_api_endpoint(): void
    {
        $response = $this->postJson('/api/patient', [
            'firstName' => 'John',
            'lastName' => 'Doe',
            'age' => 32,
            'sex' => 'Male',
            'contact' => '0900000000',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'John Doe')
            ->assertJsonPath('data.status', 'Pending');
    }
}
