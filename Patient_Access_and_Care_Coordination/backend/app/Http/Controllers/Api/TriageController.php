<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TriageIntake;
use Illuminate\Http\Request;

class TriageController extends Controller
{
    private const HIGH_RISK = ['Chest pain', 'Difficulty breathing', 'Severe bleeding', 'Loss of consciousness'];
    private const MID_RISK  = ['High fever', 'Fracture / trauma'];

    public function score(Request $request)
    {
        $v = $request->validate([
            'hr'       => 'nullable|numeric',
            'rr'       => 'nullable|numeric',
            'spo2'     => 'nullable|numeric',
            'temp'     => 'nullable|numeric',
            'bp'       => 'nullable|numeric',
            'pain'     => 'nullable|numeric|min:0|max:10',
            'symptoms' => 'nullable|array',
        ]);

        $score = 0;
        $reasons = [];

        $spo2 = $v['spo2'] ?? null;
        if ($spo2 !== null && $spo2 < 90) { $score += 4; $reasons[] = "SpO2 critically low ({$spo2}%)"; }
        elseif ($spo2 !== null && $spo2 < 94) { $score += 2; $reasons[] = "SpO2 below normal ({$spo2}%)"; }

        $hr = $v['hr'] ?? null;
        if ($hr !== null && ($hr > 130 || $hr < 45)) { $score += 3; $reasons[] = "Heart rate markedly abnormal ({$hr} bpm)"; }
        elseif ($hr !== null && ($hr > 110 || $hr < 55)) { $score += 1; $reasons[] = "Heart rate elevated/low ({$hr} bpm)"; }

        $bp = $v['bp'] ?? null;
        if ($bp !== null && $bp < 90) { $score += 3; $reasons[] = "Hypotensive (systolic {$bp} mmHg)"; }

        $rr = $v['rr'] ?? null;
        if ($rr !== null && ($rr > 28 || $rr < 10)) { $score += 2; $reasons[] = "Respiratory rate abnormal ({$rr}/min)"; }

        $temp = $v['temp'] ?? null;
        if ($temp !== null && $temp >= 39.5) { $score += 2; $reasons[] = "High-grade fever ({$temp}C)"; }

        $pain = $v['pain'] ?? 0;
        if ($pain >= 8) { $score += 1; $reasons[] = "Severe pain reported ({$pain}/10)"; }

        foreach (($v['symptoms'] ?? []) as $symptom) {
            if (in_array($symptom, self::HIGH_RISK, true)) { $score += 3; $reasons[] = "High-risk symptom: {$symptom}"; }
            elseif (in_array($symptom, self::MID_RISK, true)) { $score += 1; $reasons[] = "Moderate-risk symptom: {$symptom}"; }
            else { $reasons[] = "Reported: {$symptom}"; }
        }

        $level = match (true) {
            $score >= 8 => 1,
            $score >= 5 => 2,
            $score >= 3 => 3,
            $score >= 1 => 4,
            default     => 5,
        };

        return response()->json([
            'level'      => $level,
            'score'      => $score,
            'confidence' => min(99, 60 + $score * 4),
            'reasons'    => $reasons,
        ]);
    }

    public function index()
    {
        $queue = TriageIntake::orderBy('level')->orderByDesc('created_at')->get();
        return response()->json(['data' => $queue->map->toFrontend()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:150',
            'complaint' => 'nullable|string|max:255',
            'level'     => 'required|integer|min:1|max:5',
            'vitals'    => 'nullable|array',
            'symptoms'  => 'nullable|array',
        ]);

        $intake = TriageIntake::create([
            'code'         => 'ER-' . random_int(2200, 2299),
            'patient_name' => $data['name'],
            'complaint'    => $data['complaint'] ?? 'General complaint',
            'level'        => $data['level'],
            'vitals'       => $data['vitals'] ?? null,
            'symptoms'     => $data['symptoms'] ?? null,
        ]);

        return response()->json(['data' => $intake->toFrontend()], 201);
    }
}
