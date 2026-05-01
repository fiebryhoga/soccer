<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('player_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assessment_test_item_id')->constrained('assessment_test_items')->cascadeOnDelete();
            
            // Kolom date DIHAPUS
            
            $table->decimal('result_value', 8, 2); 
            $table->decimal('percentage', 8, 2);   
            $table->decimal('weight_snapshot', 5, 2)->nullable();
            $table->integer('age_snapshot')->nullable();
            $table->timestamps();

            // Unique sekarang hanya cek Player ID dan Item Tes-nya saja
            $table->unique(['player_id', 'assessment_test_item_id'], 'player_item_unique');
        });
    }

    public function down()
    {
        Schema::dropIfExists('player_assessments');
    }
};