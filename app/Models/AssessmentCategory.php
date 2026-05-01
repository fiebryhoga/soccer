<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssessmentCategory extends Model
{
    protected $fillable = ['name', 'biomotor_stages'];

    protected $casts = [
        'biomotor_stages' => 'array',
    ];

    public function testItems()
    {
        return $this->hasMany(AssessmentTestItem::class, 'category_id');
    }
}