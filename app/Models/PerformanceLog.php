<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerformanceLog extends Model
{
    protected $fillable = [
        'club_id', 
        'date', 
        'type', 
        'title', 
        'description', 
        'selected_metrics', 
        'tag', 
        'benchmark_id',           
        'player_benchmark_id',
        'custom_charts'     
    ];

    // Otomatis ubah JSON ke Array PHP
    protected $casts = [
        'selected_metrics' => 'array',
        'custom_charts' => 'array',
    ];

    public function benchmark() {
        return $this->belongsTo(Benchmark::class);
    }

    public function playerBenchmark() {
        return $this->belongsTo(Benchmark::class, 'player_benchmark_id');
    }

    public function playerMetrics()
    {
        return $this->hasMany(PlayerMetric::class, 'performance_log_id', 'id');
    }
}