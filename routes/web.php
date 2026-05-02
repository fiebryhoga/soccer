<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\GlobalSearchController;
use App\Http\Controllers\ClubController;
use App\Http\Controllers\BenchmarkController;
use App\Http\Controllers\PlayerBenchmarkController;
use App\Http\Controllers\TrainingMetricController;
use App\Http\Controllers\PerformanceLogController;
use App\Http\Controllers\PerformanceAnalysisController;
use App\Http\Controllers\PlayerAnalysisController;
use App\Http\Controllers\FormulaController;
use App\Http\Controllers\BenchmarkAssessmentController;
use App\Http\Controllers\PlayerAssessmentController;
use App\Http\Controllers\PlayerProfileController;
use App\Http\Controllers\CompositionTestController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 1. Redirect Root ke Login
Route::get('/', function () {
    return redirect()->route('login');
});

// 2. Dashboard
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// 3. Activity Log (Halaman yang tadi kita buat)
Route::get('/activity', function () {
    return Inertia::render('Activity/Index');
})->middleware(['auth', 'verified'])->name('activity.index');


// 4. Grouping Route untuk User yang Sudah Login
Route::middleware('auth')->group(function () {

    Route::get('/search', [GlobalSearchController::class, 'search'])->name('global.search');
    
    // --- Bawaan Profile Breeze ---
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    
    // --- ADMIN MANAGEMENT CRUD ---
    // Kita panggil index, create, store, edit, dan destroy pakai resource bawaan
    Route::resource('admins', AdminController::class)->except(['show', 'update']);

    // KHUSUS UPDATE: Kita paksa menggunakan POST agar upload Foto Profil (multipart/form-data) tidak error/kosong.
    Route::post('/admins/{admin}', [AdminController::class, 'update'])->name('admins.update');

    Route::get('/activity', [ActivityController::class, 'index'])->name('activity.index');
    Route::get('/activity/export', [ActivityController::class, 'export'])->name('activity.export'); // Tambahkan ini
    

    // Tambahkan di dalam Route::middleware('auth')->group(...)
    Route::post('/activity/mark-read', function () {
        \App\Models\Activity::where('is_read', false)->update(['is_read' => true]);
        return redirect()->back();
    })->name('activity.markRead');

    Route::get('/club', [ClubController::class, 'index'])->name('club.index');
    Route::post('/club', [ClubController::class, 'store'])->name('club.store');
    
    // UBAH INI MENJADI PATCH
    Route::patch('/club/{club}', [ClubController::class, 'update'])->name('club.update'); 
    
    // Rute Pemain
    Route::post('/players', [ClubController::class, 'storePlayer'])->name('players.store');
    Route::post('/players/bulk', [ClubController::class, 'storeBulkPlayer'])->name('players.storeBulk');
    
    // UBAH INI MENJADI PATCH
    Route::patch('/players/{player}', [ClubController::class, 'updatePlayer'])->name('players.update'); 
    
    Route::delete('/players/{player}', [ClubController::class, 'destroyPlayer'])->name('players.destroy');

    Route::prefix('benchmarks/assessments')->name('benchmarks.assessments.')->group(function () {
        Route::get('/', [App\Http\Controllers\BenchmarkAssessmentController::class, 'index'])->name('index');
        Route::put('/categories/{id}/biomotor', [App\Http\Controllers\BenchmarkAssessmentController::class, 'updateBiomotor'])->name('updateBiomotor');
        Route::post('/items', [App\Http\Controllers\BenchmarkAssessmentController::class, 'storeTestItem'])->name('storeTestItem');
        Route::delete('/items/{id}', [App\Http\Controllers\BenchmarkAssessmentController::class, 'destroyTestItem'])->name('destroyTestItem');
    });


    Route::get('/benchmarks', [BenchmarkController::class, 'index'])->name('benchmarks.index');
    Route::get('/benchmarks/create', [BenchmarkController::class, 'create'])->name('benchmarks.create');
    Route::post('/benchmarks', [BenchmarkController::class, 'store'])->name('benchmarks.store');
    Route::get('/benchmarks/{benchmark}', [BenchmarkController::class, 'show'])->name('benchmarks.show');
    Route::get('/benchmarks/{benchmark}/edit', [BenchmarkController::class, 'edit'])->name('benchmarks.edit');
    Route::post('/benchmarks/{benchmark}/duplicate', [BenchmarkController::class, 'duplicate'])->name('benchmarks.duplicate');
    Route::patch('/benchmarks/{benchmark}', [BenchmarkController::class, 'update'])->name('benchmarks.update');
    Route::delete('/benchmarks/{benchmark}', [BenchmarkController::class, 'destroy'])->name('benchmarks.destroy');

    Route::get('/performance-logs', [PerformanceLogController::class, 'index'])->name('performance-logs.index');    
    Route::post('/performance-logs/start-date', [PerformanceLogController::class, 'updateStartDate'])->name('performance-logs.updateStartDate');    
    Route::post('/performance-logs', [PerformanceLogController::class, 'store'])->name('performance-logs.store');
    Route::get('/performance-logs/{log}', [PerformanceLogController::class, 'show'])->name('performance-logs.show');
    Route::post('/performance-logs/{log}/metrics', [PerformanceLogController::class, 'storeMetrics'])->name('performance-logs.storeMetrics');

    Route::post('performance-logs/{log}/metrics/bulk', [PerformanceLogController::class, 'storeMetrics'])
        ->name('performance-logs.metrics.storeBulk');

    Route::post('performance-logs/{log}/update-metrics', [PerformanceLogController::class, 'updateMetrics'])
        ->name('performance-logs.metrics.updateBulk');

    Route::get('performance-logs/{log}/export/pdf', [App\Http\Controllers\PerformanceLogController::class, 'exportPdf'])
        ->name('performance-logs.export.pdf');

    Route::get('performance-logs/{log}/export/excel', [App\Http\Controllers\PerformanceLogController::class, 'exportExcel'])
        ->name('performance-logs.export.excel');


    Route::get('performance-analysis', [App\Http\Controllers\PerformanceAnalysisController::class, 'index'])
        ->name('performance.analysis');
    
    Route::get('/analysis/strain-monotony', [PerformanceAnalysisController::class, 'strainMonotony'])->name('analysis.strain');

    Route::get('/analysis/strain-monotony', [PerformanceAnalysisController::class, 'strainMonotony'])->name('analysis.strain');
    Route::get('/analysis/acwr', [PerformanceAnalysisController::class, 'acwr'])->name('analysis.acwr');
    Route::get('/analysis/comparison', [PerformanceAnalysisController::class, 'comparison'])->name('analysis.comparison');
    Route::get('/performance-logs/analysis/session', [PerformanceAnalysisController::class, 'sessionAnalysis'])
    ->name('team.analysis.session');

    Route::prefix('players-benchmarks')->group(function () {
        Route::get('/', [PlayerBenchmarkController::class, 'index'])->name('players.benchmarks.index');
        Route::get('/create', [PlayerBenchmarkController::class, 'create'])->name('players.benchmarks.create');
        Route::post('/', [PlayerBenchmarkController::class, 'store'])->name('players.benchmarks.store');
        Route::get('/{benchmark}/edit', [PlayerBenchmarkController::class, 'edit'])->name('players.benchmarks.edit');
        Route::put('/{benchmark}', [PlayerBenchmarkController::class, 'update'])->name('players.benchmarks.update');
        Route::post('/{benchmark}/duplicate', [PlayerBenchmarkController::class, 'duplicate'])->name('players.benchmarks.duplicate');
        Route::delete('/{benchmark}', [PlayerBenchmarkController::class, 'destroy'])->name('players.benchmarks.destroy');
    });

    Route::get('/analysis/player/strain', [PlayerAnalysisController::class, 'playerStrain'])->name('analysis.player.strain');
    Route::get('/analysis/player/acwr', [App\Http\Controllers\PlayerAnalysisController::class, 'playerAcwr'])->name('analysis.player.acwr');
    Route::get('/analysis/player/comparison', [App\Http\Controllers\PlayerAnalysisController::class, 'playerComparison'])->name('analysis.player.comparison');
    
    Route::prefix('formula')->name('formula.')->group(function () {
        Route::get('/strength', [App\Http\Controllers\FormulaController::class, 'strength'])->name('strength');
        Route::get('/endurance', [App\Http\Controllers\FormulaController::class, 'endurance'])->name('endurance');
        Route::post('/save-test', [App\Http\Controllers\FormulaController::class, 'saveTest'])->name('saveTest');
    });

    Route::get('/players/{player}/assessments', [App\Http\Controllers\PlayerAssessmentController::class, 'index'])->name('players.assessments.index');
    Route::post('/players/{player}/assessments', [App\Http\Controllers\PlayerAssessmentController::class, 'store'])->name('players.assessments.store');

    Route::prefix('profiling')->name('profiling.')->group(function () {
        Route::get('/', [App\Http\Controllers\PlayerProfileController::class, 'index'])->name('index');

        Route::get('/{player}', [App\Http\Controllers\PlayerProfileController::class, 'show'])->name('show');
        // Nanti rute detail pemain masuk ke sini
    });

    Route::post('/analysis/chart-templates', [App\Http\Controllers\PerformanceAnalysisController::class, 'storeChartTemplate'])->name('chart-templates.store');
Route::delete('/analysis/chart-templates/{id}', [App\Http\Controllers\PerformanceAnalysisController::class, 'destroyChartTemplate'])->name('chart-templates.destroy');
Route::put('/analysis/chart-templates/{id}', [App\Http\Controllers\PerformanceAnalysisController::class, 'updateChartTemplate'])->name('chart-templates.update');

Route::get('/analysis/composition', [App\Http\Controllers\CompositionTestController::class, 'index'])->name('analysis.composition.index');
Route::post('/analysis/composition/benchmarks', [App\Http\Controllers\CompositionTestController::class, 'saveBenchmarks'])->name('analysis.composition.save-benchmarks');
Route::get('/analysis/composition/{player}', [App\Http\Controllers\CompositionTestController::class, 'show'])->name('analysis.composition.show');
Route::post('/analysis/composition', [App\Http\Controllers\CompositionTestController::class, 'store'])->name('analysis.composition.store');

    

});

require __DIR__.'/auth.php';