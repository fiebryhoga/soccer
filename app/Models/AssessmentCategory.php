<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssessmentCategory extends Model
{
    protected $fillable = ['name', 'body_part', 'periodization_rules'];

    protected $casts = [
        'periodization_rules' => 'array',
    ];

    public function metrics()
    {
        return $this->hasMany(AssessmentMetric::class, 'category_id');
    }
}