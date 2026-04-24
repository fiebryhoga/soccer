<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlayerMetric extends Model
{
    use HasFactory;

    // TAMBAHKAN 'performance_log_id' DI SINI
    protected $fillable = [
        'performance_log_id', 
        'player_id', 
        'metrics',
        'sort_order',
    ];

    // Pastikan casting array untuk kolom metrics
    protected $casts = [
        'metrics' => 'array',
    ];

    public function log()
    {
        return $this->belongsTo(PerformanceLog::class, 'performance_log_id');
    }

    public function player()
    {
        return $this->belongsTo(Player::class);
    }
}