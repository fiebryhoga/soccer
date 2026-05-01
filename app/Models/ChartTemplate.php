<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChartTemplate extends Model
{
    protected $fillable = ['club_id', 'name', 'config'];

    protected $casts = [
        'config' => 'array', // Otomatis ubah JSON ke Array PHP
    ];

    public function club()
    {
        return $this->belongsTo(Club::class);
    }
}