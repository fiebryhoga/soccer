<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PlayerAssessment extends Model
{
    protected $fillable = ['player_id', 'metric_id', 'result_value', 'percentage', 'date'];

    public function player()
    {
        return $this->belongsTo(Player::class);
    }

    public function metric()
    {
        return $this->belongsTo(AssessmentMetric::class, 'metric_id');
    }
}