<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    // UBAH jersey_number menjadi position_number
    protected $fillable = ['club_id', 'name', 'profile_photo', 'position_number', 'position'];

    public function club()
    {
        return $this->belongsTo(Club::class);
    }
}