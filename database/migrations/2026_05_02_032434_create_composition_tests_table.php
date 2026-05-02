<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('composition_tests', function (Blueprint $table) {
            $table->id();
            
            // MENGGUNAKAN player_id SEBAGAI FOREIGN KEY
            $table->foreignId('player_id')->constrained('players')->cascadeOnDelete();
            
            $table->date('date');
            $table->integer('age');
            $table->integer('metabolic_age')->nullable();
            
            $table->decimal('weight', 5, 2)->comment('KG');
            $table->decimal('height', 5, 2)->comment('Meter');
            $table->decimal('bmi', 5, 2)->nullable();
            
            $table->decimal('body_fat_percentage', 5, 2)->nullable();
            $table->decimal('muscle_mass', 5, 2)->nullable();
            $table->decimal('bone_mass', 5, 2)->nullable();
            $table->decimal('visceral_fat', 5, 2)->nullable();
            $table->integer('bmr')->nullable()->comment('Kcal');
            $table->decimal('total_body_water', 5, 2)->nullable()->comment('Persen');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('composition_tests');
    }
};