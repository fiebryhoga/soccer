<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlayerAssessment extends Model
{
    protected $fillable = [
        'player_id', 'assessment_test_item_id', 
        'result_value', 'percentage', 'weight_snapshot', 'age_snapshot'
    ];

    public function item()
    {
        return $this->belongsTo(AssessmentTestItem::class, 'assessment_test_item_id');
    }
}