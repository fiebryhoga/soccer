<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerformanceLog extends Model
{
    protected $fillable = [
        'club_id', 'date', 'type', 'title', 'description', 'selected_metrics', 'benchmark_id'
    ];

    // Otomatis ubah JSON ke Array PHP
    protected $casts = [
        'selected_metrics' => 'array',
    ];

    public function benchmark() {
        return $this->belongsTo(Benchmark::class);
    }
}