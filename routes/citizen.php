<?php

use App\Http\Controllers\Citizen\ComplaintController;
use App\Http\Middleware\EnsureUserRole;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Citizen workspace
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', EnsureUserRole::class.':citizen'])
    ->prefix('citizen')
    ->name('citizen.')
    ->group(function () {
        Route::get('dashboard', [ComplaintController::class, 'dashboard'])->name('dashboard');

        Route::get('complaints', [ComplaintController::class, 'index'])->name('complaints.index');
        Route::get('complaints/create', [ComplaintController::class, 'create'])->name('complaints.create');
        Route::post('complaints', [ComplaintController::class, 'store'])->name('complaints.store');
        Route::get('complaints/{complaint}', [ComplaintController::class, 'show'])->name('complaints.show');

        Route::get('map', [ComplaintController::class, 'map'])->name('map');
        Route::get('notifications', [ComplaintController::class, 'notifications'])->name('notifications');
        Route::post('notifications/read', [ComplaintController::class, 'markNotificationsRead'])->name('notifications.read');
    });
