<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TelehealthSession;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class TelehealthController extends Controller
{
    public function startRoom()
    {
        $apiKey = config('services.daily.api_key');

        if (empty($apiKey)) {
            return response()->json(['message' => 'Telehealth service is not configured.'], 503);
        }

        $response = Http::withToken($apiKey)
            ->post('https://api.daily.co/v1/rooms', [
                'name' => 'consult-' . Str::random(8),
                'properties' => [
                    'exp' => now()->addHours(2)->timestamp,
                    'enable_chat' => true,
                ],
            ]);

        if ($response->failed()) {
            return response()->json(['message' => 'Failed to create telehealth room.'], 502);
        }

        $room = $response->json();

        TelehealthSession::create([
            'room_url'  => $room['url'],
            'room_name' => $room['name'] ?? null,
            'status'    => 'active',
        ]);

        return response()->json(['roomUrl' => $room['url']]);
    }
}
