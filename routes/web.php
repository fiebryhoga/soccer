<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ActivityController;
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

    // Tambahkan di dalam Route::middleware('auth')->group(...)
    Route::post('/activity/mark-read', function () {
        // Ubah semua activity milik user menjadi sudah dibaca
        \App\Models\Activity::where('is_read', false)->update(['is_read' => true]);
        return redirect()->back();
    })->name('activity.markRead');

});

require __DIR__.'/auth.php';