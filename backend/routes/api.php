<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\InfrastructureTypeController;
use App\Http\Controllers\ZoneController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\ChantierController;
use App\Http\Controllers\MetricsController;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'environment' => app()->environment(),
    ]);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

Route::middleware(['throttle:reports'])->group(function () {
    Route::post('/reports', [ReportController::class, 'store']);
});

Route::post('/reports/{report}/photos', [ReportController::class, 'uploadPhotos'])
    ->middleware(['auth:sanctum','can:update,report']);

Route::get('/reports', [ReportController::class, 'index'])->middleware(['auth:sanctum','can:viewAny,App\\Models\\Report']);
Route::get('/reports/{report}', [ReportController::class, 'show'])->middleware(['auth:sanctum','can:view,report']);
Route::get('/reports/{report}/audit', [ReportController::class, 'audit'])->middleware(['auth:sanctum','can:view,report']);
Route::patch('/reports/{report}', [ReportController::class, 'update'])->middleware(['auth:sanctum','can:update,report']);
Route::post('/reports/{report}/review', [ReportController::class, 'review'])->middleware(['auth:sanctum','can:review,report']);
Route::post('/reports/{report}/assign', [ReportController::class, 'assign'])->middleware(['auth:sanctum','can:assign,report']);
Route::get('/reports/stats', [DashboardController::class, 'stats'])->middleware(['auth:sanctum','can:stats,App\\Models\\Report']);

Route::apiResource('infrastructure-types', InfrastructureTypeController::class)->middleware('auth:sanctum');

Route::get('/zones', [ZoneController::class, 'index'])->middleware('auth:sanctum');
Route::post('/zones', [ZoneController::class, 'store'])->middleware(['auth:sanctum','role:admin']);
Route::patch('/zones/{zone}', [ZoneController::class, 'update'])->middleware(['auth:sanctum','role:admin']);
Route::delete('/zones/{zone}', [ZoneController::class, 'destroy'])->middleware(['auth:sanctum','role:admin']);
Route::post('/zones/import', [ZoneController::class, 'importGeoJson'])->middleware(['auth:sanctum','role:admin']);

Route::get('/exports/reports.pdf', [ExportController::class, 'reportsPdf'])->middleware(['auth:sanctum','can:export,App\\Models\\Report']);
Route::get('/exports/reports.xlsx', [ExportController::class, 'reportsExcel'])->middleware(['auth:sanctum','can:export,App\\Models\\Report']);
Route::get('/exports/reports.geojson', [ExportController::class, 'reportsGeojson'])->middleware(['auth:sanctum','can:export,App\\Models\\Report']);

Route::get('/users', [UserController::class, 'index'])->middleware(['auth:sanctum','role:admin']);
Route::patch('/users/{user}/role', [UserController::class, 'updateRole'])->middleware(['auth:sanctum','role:admin']);

Route::get('/audit/logs', [AuditController::class, 'logs'])->middleware(['auth:sanctum','role:admin']);

Route::post('/integrations/kobo/sync', [IntegrationController::class, 'koboSync'])->middleware(['auth:sanctum','role:admin']);

Route::middleware('auth:sanctum')->group(function(){
    Route::get('/chantiers', [ChantierController::class, 'index'])->middleware('can:viewAny,App\\Models\\Chantier');
    Route::post('/chantiers', [ChantierController::class, 'store'])->middleware('can:create,App\\Models\\Chantier');
    Route::get('/chantiers/{chantier}', [ChantierController::class, 'show'])->middleware('can:view,chantier');
    Route::patch('/chantiers/{chantier}', [ChantierController::class, 'update'])->middleware('can:update,chantier');
    Route::delete('/chantiers/{chantier}', [ChantierController::class, 'destroy'])->middleware('can:delete,chantier');
    Route::post('/chantiers/{chantier}/progress', [ChantierController::class, 'updateProgress'])->middleware('can:update,chantier');

    Route::get('/chantiers/{id}/lots', [ChantierController::class, 'lotsIndex']);
    Route::post('/chantiers/{id}/lots', [ChantierController::class, 'lotsStore']);
    Route::patch('/lots/{lot}', [ChantierController::class, 'lotUpdate']);
    Route::delete('/lots/{lot}', [ChantierController::class, 'lotDelete']);

    Route::get('/chantiers/{id}/etapes', [ChantierController::class, 'etapesIndex']);
    Route::post('/chantiers/{id}/etapes', [ChantierController::class, 'etapesStore']);
    Route::patch('/etapes/{etape}', [ChantierController::class, 'etapeUpdate']);
    Route::delete('/etapes/{etape}', [ChantierController::class, 'etapeDelete']);

    Route::get('/chantiers/{id}/expenses', [ChantierController::class, 'expensesIndex']);
    Route::post('/chantiers/{id}/expenses', [ChantierController::class, 'expensesStore']);
    Route::patch('/expenses/{expense}', [ChantierController::class, 'expenseUpdate']);
    Route::delete('/expenses/{expense}', [ChantierController::class, 'expenseDelete']);

    Route::post('/chantiers/{id}/attachments', [ChantierController::class, 'attachmentsStore']);
    Route::delete('/attachments/{attachment}', [ChantierController::class, 'attachmentDelete']);

    Route::get('/chantiers/{id}/reports', [ChantierController::class, 'reportsIndex']);
    Route::post('/chantiers/{id}/reports', [ChantierController::class, 'reportsLink']);
    Route::delete('/chantiers/{id}/reports/{reportId}', [ChantierController::class, 'reportsUnlink']);

    Route::get('/chantiers/metrics', [MetricsController::class, 'chantiers']);

    Route::get('/exports/chantiers.pdf', [ExportController::class, 'chantiersPdf']);
    Route::get('/exports/chantiers.xlsx', [ExportController::class, 'chantiersExcel']);
});
