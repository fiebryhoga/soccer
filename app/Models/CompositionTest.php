<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompositionTest extends Model
{
    use HasFactory;

    protected $fillable = [
        'player_id',
        'date',
        'age',
        'metabolic_age',
        'weight',
        'height',
        'bmi',
        'body_fat_percentage',
        'muscle_mass',
        'bone_mass',
        'visceral_fat',
        'bmr',
        'total_body_water',
        'essential_fat_mass',
        'storage_fat_mass',
        'other_mass',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'weight' => 'float',
        'height' => 'float',
        'bmi' => 'float',
        'body_fat_percentage' => 'float',
        'muscle_mass' => 'float',
        'bone_mass' => 'float',
        'visceral_fat' => 'float',
        'total_body_water' => 'float',
        'essential_fat_mass' => 'float',
        'storage_fat_mass' => 'float',
        'other_mass' => 'float',
    ];

    // Relasi kembali ke Player
    public function player()
    {
        return $this->belongsTo(Player::class);
    }
}