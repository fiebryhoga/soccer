<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Club extends Model
{
    protected $fillable = ['name', 'logo', 'season_start_date'];

    public function players()
    {
        return $this->hasMany(Player::class);
    }
}