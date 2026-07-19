<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/dashboard');
});

Route::view('/dashboard', 'dashboard')->name('dashboard');
Route::view('/registration', 'registration')->name('registration');
Route::view('/scheduling', 'scheduling')->name('scheduling');
Route::view('/telehealth', 'telehealth')->name('telehealth');
Route::view('/triage', 'triage')->name('triage');
Route::view('/bed-management', 'bed-management')->name('bed-management');

Route::redirect('/dashboard.html', '/dashboard');
Route::redirect('/registration.html', '/registration');
Route::redirect('/scheduling.html', '/scheduling');
Route::redirect('/telehealth.html', '/telehealth');
Route::redirect('/triage.html', '/triage');
Route::redirect('/bed-management.html', '/bed-management');
