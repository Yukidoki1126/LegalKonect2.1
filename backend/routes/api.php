<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Client\ClientController;
use App\Http\Controllers\LawFirm\LawFirmController;
use App\Models\LawFirm;
use App\Models\Specialization;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register/client', [AuthController::class, 'registerClient']);
    Route::post('/register/law-firm', [AuthController::class, 'registerLawFirm']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Public specializations list
Route::get('/specializations', function () {
    return Specialization::active()->get();
});

// Public law firm profile (only approved)
Route::get('/law-firms/{id}', function ($id) {
    return LawFirm::with(['user', 'specializations', 'ratings'])
        ->approved()
        ->findOrFail($id);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);

    // Client routes
    Route::middleware('role:client')->prefix('client')->group(function () {
        Route::get('/profile', [ClientController::class, 'profile']);
        Route::put('/profile', [ClientController::class, 'updateProfile']);
        Route::put('/location', [ClientController::class, 'updateLocation']);
        Route::get('/recommendations', [ClientController::class, 'recommendations']);
        Route::get('/appointments', [ClientController::class, 'appointments']);
        Route::get('/appointments/{id}', [ClientController::class, 'showAppointment']);
        Route::post('/ratings', [ClientController::class, 'submitRating']);
        Route::get('/law-firms/{id}', [ClientController::class, 'viewLawFirm']);
    });

    // Law Firm routes
    Route::middleware('role:law_firm')->prefix('law-firm')->group(function () {
        Route::get('/profile', [LawFirmController::class, 'profile']);
        Route::put('/profile', [LawFirmController::class, 'updateProfile']);
        Route::put('/location', [LawFirmController::class, 'updateLocation']);

        // Routes that require approval
        Route::middleware('law_firm.approved')->group(function () {
            Route::get('/appointments', [LawFirmController::class, 'appointments']);
            Route::post('/appointments', [LawFirmController::class, 'createAppointment']);
            Route::put('/appointments/{id}', [LawFirmController::class, 'updateAppointment']);
            Route::delete('/appointments/{id}', [LawFirmController::class, 'cancelAppointment']);
            Route::get('/calendar', [LawFirmController::class, 'calendar']);
            Route::get('/clients', [LawFirmController::class, 'clients']);
        });
    });

    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/law-firms', [AdminController::class, 'lawFirms']);
        Route::get('/law-firms/pending', [AdminController::class, 'pendingVerifications']);
        Route::put('/law-firms/{id}/approve', [AdminController::class, 'approveLawFirm']);
        Route::put('/law-firms/{id}/reject', [AdminController::class, 'rejectLawFirm']);
        Route::get('/clients', [AdminController::class, 'clients']);
        Route::get('/appointments', [AdminController::class, 'appointments']);
        Route::get('/analytics/specializations', [AdminController::class, 'specializationAnalytics']);
        Route::get('/analytics/appointments', [AdminController::class, 'appointmentAnalytics']);
        Route::get('/analytics/distances', [AdminController::class, 'distanceAnalytics']);
        Route::get('/analytics/registrations', [AdminController::class, 'registrationTrends']);
    });
});
