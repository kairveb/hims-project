<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/dashboard.html');
});

Route::view('/dashboard.html', 'dashboard');
Route::view('/registration.html', 'registration');
Route::view('/scheduling.html', 'scheduling');
Route::view('/telehealth.html', 'telehealth');
Route::view('/triage.html', 'triage');
Route::view('/bed-management.html', 'bed-management');
