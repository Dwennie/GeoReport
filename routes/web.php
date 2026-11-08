<?php

use App\Http\Controllers\GeoJsonController;
use App\Http\Middleware\EnsureUserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'Welcome')->name('home');
Route::get('geojson/loon-barangays', [GeoJsonController::class, 'loonBarangays'])->name('geojson.loon');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function (Request $request) {
        return redirect()->to($request->user()->homeRoute());
    })->name('dashboard');
});

Route::middleware(['auth', EnsureUserRole::class.':administrator'])->group(function () {
    Route::inertia('gis', 'gis/Index')->name('gis');
});

require __DIR__.'/settings.php';
require __DIR__.'/citizen.php';
require __DIR__.'/staff.php';
require __DIR__.'/admin.php';
