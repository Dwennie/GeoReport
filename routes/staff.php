<?php

use App\Http\Controllers\Staff\ComplaintController;
use App\Http\Middleware\EnsureUserRole;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Staff workspace
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', EnsureUserRole::class.':staff', 'throttle:workspace-actions'])
    ->prefix('staff')
    ->name('staff.')
    ->group(function () {
        Route::get('dashboard', [ComplaintController::class, 'dashboard'])->name('dashboard');

        Route::get('complaints', [ComplaintController::class, 'index'])->name('complaints.index');
        Route::get('complaints/{complaint}', [ComplaintController::class, 'show'])->name('complaints.show');

        Route::post('complaints/{complaint}/status', [ComplaintController::class, 'updateStatus'])->name('complaints.status');
        Route::post('complaints/{complaint}/notes', [ComplaintController::class, 'addNote'])->name('complaints.notes');

        Route::get('map', [ComplaintController::class, 'map'])->name('map');
        Route::get('history', [ComplaintController::class, 'history'])->name('history');
    });
