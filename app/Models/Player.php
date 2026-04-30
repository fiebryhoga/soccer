<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    use HasFactory;

    protected $fillable = [
        'club_id',
        'name',
        'position_number',
        'position',
        'profile_photo',
        'highest_metrics',
        'age', 
        'gender', 
        'height', 
        'weight', 
        'dominant_limb'
    ];

    protected $casts = [
        'highest_metrics' => 'array',
        'benchmark_metrics' => 'array',
    ];

    public function club()
    {
        return $this->belongsTo(Club::class);
    }

    public function metrics()
    {
        return $this->hasMany(PlayerMetric::class);
    }
}