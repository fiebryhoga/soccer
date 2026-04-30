<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlayerFitnessTest extends Model
{
    protected $fillable = ['player_id', 'date', 'category', 'test_name', 'results'];

    protected $casts = [
        'results' => 'array',
        'date' => 'date'
    ];

    public function player()
    {
        return $this->belongsTo(Player::class);
    }
}