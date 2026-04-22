<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Activity;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Tugas otomatis: Hapus log aktivitas yang lebih lama dari 100 hari
Schedule::call(function () {
    Activity::where('created_at', '<', now()->subDays(100))->delete();
})->daily();