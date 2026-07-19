<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $query = Patient::query()->latest();

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('first_name', 'like', "%{$s}%")
                  ->orWhere('last_name', 'like', "%{$s}%")
                  ->orWhere('code', 'like', "%{$s}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $patients = $query->get()->map->toFrontend();

        return response()->json([
            'data'  => $patients,
            'stats' => [
                'today' => Patient::whereDate('created_at', today())->count(),
                'total' => Patient::count(),
                'queue' => Patient::where('status', 'Pending')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'firstName' => 'required|string|max:100',
            'lastName'  => 'required|string|max:100',
            'age'       => 'nullable|integer|min:0|max:130',
            'sex'       => 'required|in:Male,Female,Other',
            'contact'   => 'required|string|max:50',
        ]);

        $nextNumber = (Patient::max('id') ?? 10492) + 1;

        $patient = Patient::create([
            'code'       => 'PT-' . $nextNumber,
            'first_name' => $data['firstName'],
            'last_name'  => $data['lastName'],
            'age'        => $data['age'] ?? null,
            'sex'        => $data['sex'],
            'contact'    => $data['contact'],
            'status'     => 'Pending',
        ]);

        return response()->json(['data' => $patient->toFrontend()], 201);
    }

    public function show(Patient $patient)
    {
        return response()->json(['data' => $patient->toFrontend()]);
    }

    public function update(Request $request, Patient $patient)
    {
        $data = $request->validate([
            'status'  => 'sometimes|in:Pending,Active,Admitted',
            'age'     => 'sometimes|integer|min:0|max:130',
            'contact' => 'sometimes|string|max:50',
        ]);

        $patient->update($data);

        return response()->json(['data' => $patient->toFrontend()]);
    }

    public function destroy(Patient $patient)
    {
        $patient->delete();
        return response()->json(null, 204);
    }
}
