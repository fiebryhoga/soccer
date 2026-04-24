<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlayerMetric extends Model
{
    protected $fillable = ['player_id', 'date', 'benchmark_id', 'metrics'];

    protected $casts = [
        'metrics' => 'array',
    ];

    public function player() {
        return $this->belongsTo(Player::class);
    }

    public function benchmark() {
        return $this->belongsTo(Benchmark::class);
    }
}