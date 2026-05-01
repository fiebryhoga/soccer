<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssessmentTestItem extends Model
{
    protected $fillable = [
        'category_id', 'name', 'parameter_type', 'target_benchmark', 'is_lower_better'
    ];

    protected $casts = [
        'is_lower_better' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(AssessmentCategory::class, 'category_id');
    }
}