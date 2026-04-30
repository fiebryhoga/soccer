<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('assessment_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('assessment_categories')->cascadeOnDelete();
            $table->string('name'); // Contoh: "Bench Press", "20m Sprint"
            $table->string('unit'); // Contoh: "kg", "sec", "cm", "reps"
            $table->decimal('target_value', 8, 2); // Target acuan (Contoh: 100 kg, atau 3.20 sec)
            $table->boolean('is_lower_better')->default(false); // TRUE jika tes sprint/waktu
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessment_metrics');
    }
};
