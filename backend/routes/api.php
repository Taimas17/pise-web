<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\InfrastructureTypeController;
use App\Http\Controllers\ZoneController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\DashboardController;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

Route::middleware(['throttle:reports'])->group(function () {
    Route::post('/reports', [ReportController::class, 'store']);
    Route::post('/reports/{report}/photos', [ReportController::class, 'uploadPhotos']);
});

Route::get('/reports', [ReportController::class, 'index'])->middleware('auth:sanctum');
Route::get('/reports/{report}', [ReportController::class, 'show'])->middleware('auth:sanctum');
Route::patch('/reports/{report}', [ReportController::class, 'update'])->middleware('auth:sanctum');
Route::post('/reports/{report}/review', [ReportController::class, 'review'])->middleware(['auth:sanctum', 'role:moderator,admin']);
Route::post('/reports/{report}/assign', [ReportController::class, 'assign'])->middleware(['auth:sanctum', 'role:moderator,admin']);
Route::get('/reports/stats', [DashboardController::class, 'stats'])->middleware('auth:sanctum');

Route::apiResource('infrastructure-types', InfrastructureTypeController::class)->middleware('auth:sanctum');

Route::get('/zones', [ZoneController::class, 'index'])->middleware('auth:sanctum');
Route::post('/zones', [ZoneController::class, 'store'])->middleware(['auth:sanctum','role:admin']);
Route::post('/zones/import', [ZoneController::class, 'importGeoJson'])->middleware(['auth:sanctum','role:admin']);

Route::get('/exports/reports.pdf', [ExportController::class, 'reportsPdf'])->middleware('auth:sanctum');
Route::get('/exports/reports.xlsx', [ExportController::class, 'reportsExcel'])->middleware('auth:sanctum');
