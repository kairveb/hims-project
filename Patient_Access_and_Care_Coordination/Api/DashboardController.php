<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Bed;
use App\Models\Patient;
use App\Models\TelehealthSession;

class DashboardController extends Controller
{
    public function summary()
    {
        $totalBeds = Bed::count();
        $occupied  = Bed::where('status', 'occupied')->count();

        return response()->json([
            'registrationsToday' => Patient::whereDate('created_at', today())->count(),
            'appointmentsBooked' => Appointment::whereDate('appt_date', today())->count(),
            'activeTelehealth'   => TelehealthSession::where('status', 'active')->count(),
            'bedOccupancy'       => $totalBeds ? round($occupied / $totalBeds * 100) . '%' : '0%',
        ]);
    }
}