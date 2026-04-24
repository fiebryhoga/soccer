<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Benchmark extends Model
{
    protected $fillable = ['club_id', 'name', 'target_type', 'player_id', 'metrics'];

    // Mengubah kolom 'metrics' (JSON) menjadi Array otomatis
    protected $casts = [
        'metrics' => 'array',
    ];

    public function club() {
        return $this->belongsTo(Club::class);
    }

    public function player() {
        return $this->belongsTo(Player::class);
    }
}