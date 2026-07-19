<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\BedController;
use App\Http\Controllers\Api\TriageController;
use App\Http\Controllers\Api\TelehealthController;
use App\Http\Controllers\Api\DashboardController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('patients', PatientController::class)->only(['index', 'store', 'show', 'update', 'destroy']);

// Backward-compatible singular aliases for older frontend calls such as /api/patient.
Route::get('/patient', [PatientController::class, 'index']);
Route::post('/patient', [PatientController::class, 'store']);
Route::get('/patient/{patient}', [PatientController::class, 'show']);
Route::patch('/patient/{patient}', [PatientController::class, 'update']);
Route::delete('/patient/{patient}', [PatientController::class, 'destroy']);

Route::get('/appointments', [AppointmentController::class, 'index']);
Route::post('/appointments', [AppointmentController::class, 'store']);
Route::get('/beds', [BedController::class, 'index']);
Route::patch('/beds/{bed}', [BedController::class, 'update']);
Route::post('/triage/score', [TriageController::class, 'score']);
Route::get('/triage/queue', [TriageController::class, 'index']);
Route::post('/triage/queue', [TriageController::class, 'store']);
Route::get('/telehealth/start-room', [TelehealthController::class, 'startRoom']);
Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
