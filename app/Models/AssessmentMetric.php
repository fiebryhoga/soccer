<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class AssessmentMetric extends Model
{
    protected $fillable = ['category_id', 'name', 'unit', 'target_value', 'is_lower_better'];

    protected $casts = [
        'is_lower_better' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(AssessmentCategory::class, 'category_id');
    }
}