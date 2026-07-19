<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bed;
use App\Models\Ward;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BedController extends Controller
{
    // Returns grouped-by-ward shape: { A: [...], B: [...], C: [...], I: [...] }
    // matching the frontend's `wardData` object exactly.
    public function index()
    {
        $wards = Ward::with('beds')->get();

        $grouped = [];
        foreach ($wards as $ward) {
            $grouped[$ward->code] = $ward->beds->map->toFrontend()->values();
        }

        return response()->json(['data' => $grouped]);
    }

    public function update(Request $request, Bed $bed)
    {
        $data = $request->validate([
            'status'  => ['required', Rule::in(['available', 'occupied', 'cleaning', 'reserved'])],
            'patient' => 'nullable|string|max:150',
            'note'    => 'nullable|string|max:255',
        ]);

        $bed->update([
            'status'       => $data['status'],
            'patient_name' => $data['patient'] ?? null,
            'note'         => $data['note'] ?? null,
        ]);

        return response()->json(['data' => $bed->toFrontend()]);
    }
}