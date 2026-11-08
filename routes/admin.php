<?php

use App\Http\Controllers\Admin\BarangayController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ComplaintController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Middleware\EnsureUserRole;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Administrator workspace
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', EnsureUserRole::class.':administrator'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('dashboard', [ComplaintController::class, 'dashboard'])->name('dashboard');

        Route::get('complaints', [ComplaintController::class, 'index'])->name('complaints.index');
        Route::post('complaints/bulk-status', [ComplaintController::class, 'bulkStatus'])->name('complaints.bulk-status');
        Route::get('complaints/{complaint}', [ComplaintController::class, 'show'])->name('complaints.show');

        Route::post('complaints/{complaint}/approve', [ComplaintController::class, 'approve'])->name('complaints.approve');
        Route::post('complaints/{complaint}/reject', [ComplaintController::class, 'reject'])->name('complaints.reject');
        Route::post('complaints/{complaint}/assign', [ComplaintController::class, 'assign'])->name('complaints.assign');
        Route::post('complaints/{complaint}/close', [ComplaintController::class, 'close'])->name('complaints.close');

        Route::get('map', [ComplaintController::class, 'map'])->name('map');
        Route::get('assignments', [ComplaintController::class, 'assignments'])->name('assignments');

        // Categories Management (Full CRUD)
        Route::get('categories', [CategoryController::class, 'index'])->name('categories');
        Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::post('categories/seed-defaults', [CategoryController::class, 'seedDefaults'])->name('categories.seed');
        Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::patch('categories/{category}/toggle', [CategoryController::class, 'toggle'])->name('categories.toggle');
        Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        // Barangays Management (Full CRUD + PSA GeoJSON Sync)
        Route::get('barangays', [BarangayController::class, 'index'])->name('barangays');
        Route::post('barangays', [BarangayController::class, 'store'])->name('barangays.store');
        Route::post('barangays/sync', [BarangayController::class, 'sync'])->name('barangays.sync');
        Route::put('barangays/{barangay}', [BarangayController::class, 'update'])->name('barangays.update');
        Route::delete('barangays/{barangay}', [BarangayController::class, 'destroy'])->name('barangays.destroy');

        // Users & Role Management
        Route::get('users', [UserController::class, 'index'])->name('users');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::patch('users/{user}/role', [UserController::class, 'updateRole'])->name('users.role');

        Route::get('analytics', [ComplaintController::class, 'analytics'])->name('analytics');
        Route::get('settings', [ComplaintController::class, 'settings'])->name('settings');
        Route::put('settings', [ComplaintController::class, 'updateSettings'])->name('settings.update');
    });
