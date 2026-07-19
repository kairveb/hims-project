<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::query()->orderBy('appt_date')->orderBy('appt_time');

        if ($request->filled('week_start') && $request->filled('week_end')) {
            $query->whereBetween('appt_date', [$request->week_start, $request->week_end]);
        }

        return response()->json([
            'data' => $query->get()->map->toFrontend(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient'   => 'required|string|max:150',
            'physician' => 'required|string|max:150',
            'visitType' => 'required|in:In-person,Telehealth',
            'date'      => 'required|date',
            'time'      => 'required|date_format:H:i',
        ]);

        $appt = Appointment::create([
            'code'         => 'AP-' . now()->timestamp . '-' . Str::random(4),
            'patient_name' => $data['patient'],
            'physician'    => $data['physician'],
            'visit_type'   => $data['visitType'],
            'appt_date'    => $data['date'],
            'appt_time'    => $data['time'],
        ]);

        return response()->json(['data' => $appt->toFrontend()], 201);
    }
}
