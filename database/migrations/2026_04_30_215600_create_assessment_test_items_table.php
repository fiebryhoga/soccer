<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('assessment_test_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('assessment_categories')->cascadeOnDelete();
            $table->string('name'); // Nama Tes
            // Sesuai request Anda: opsi parameter
            $table->enum('parameter_type', ['points', 'reps', 'cm', 's', 'vo2max', 'm', 'min', 'kg']);
            $table->decimal('target_benchmark', 8, 2); // Target 100%
            $table->boolean('is_lower_better')->default(false); // TRUE jika tes waktu (s/min)
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('assessment_test_items');
    }
};